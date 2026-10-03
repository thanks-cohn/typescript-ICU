import type { Diagnostic, Rect, SnapshotEnvelope, SurfaceSnapshot } from "@perceptual/core";

const positive = (n: number) => Math.max(0, n);
export function containmentOverflow(child: Rect, parent: Rect) {
  return {
    overflowLeft: positive(parent.x - child.x), overflowTop: positive(parent.y - child.y),
    overflowRight: positive(child.x + child.width - (parent.x + parent.width)),
    overflowBottom: positive(child.y + child.height - (parent.y + parent.height)),
  };
}

function hasOverflow(values: Record<string, number>, tolerance: number) {
  return Object.values(values).some((value) => value > tolerance);
}

const interactive = (surface: SurfaceSnapshot) => surface.state?.interactive === true ||
  ["button", "link", "textbox", "checkbox", "radio", "combobox", "slider"].includes(surface.role ?? "");

/** Diagnose only serialized snapshot data; no DOM or rendering implementation is required. */
export function diagnose(snapshot: SnapshotEnvelope): Diagnostic[] {
  const result: Diagnostic[] = [];
  const byId = new Map(snapshot.surfaces.map((surface) => [surface.id, surface]));
  const tolerance = snapshot.tolerances?.geometryPixels ?? 0;
  for (const surface of snapshot.surfaces) {
    const bounds = surface.geometry?.pixelBounds;
    const parent = surface.parentId ? byId.get(surface.parentId) : undefined;
    if (bounds && parent?.geometry) {
      const overflow = containmentOverflow(bounds, parent.geometry.pixelBounds);
      if (hasOverflow(overflow, tolerance)) result.push({ type: "outside-parent-bounds", surfaceId: surface.id,
        message: `${surface.id} extends outside ${parent.id}`, data: { parentId: parent.id, ...overflow } });
    }
    if (bounds && snapshot.viewport) {
      const overflow = containmentOverflow(bounds, { x: 0, y: 0, width: snapshot.viewport.width, height: snapshot.viewport.height });
      if (hasOverflow(overflow, tolerance)) result.push({ type: "viewport-overflow", surfaceId: surface.id, data: overflow });
    }
    if (surface.visibility?.clipped) result.push({ type: "clipped-content", surfaceId: surface.id,
      data: { visibleFraction: surface.visibility.visibleFraction } });
    if (surface.visibility?.visible && bounds && (bounds.width <= 0 || bounds.height <= 0))
      result.push({ type: "zero-size-visible-element", surfaceId: surface.id });
    if (!surface.visibility?.visible && interactive(surface))
      result.push({ type: "hidden-interactive-control", surfaceId: surface.id,
        data: { hiddenReason: surface.visibility?.hiddenReason } });
  }
  return result;
}
