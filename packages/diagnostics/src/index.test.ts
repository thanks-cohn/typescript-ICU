import { describe, expect, it } from "vitest";
import type { SnapshotEnvelope, SurfaceSnapshot } from "@perceptual/core";
import { containmentOverflow, diagnose } from "./index.js";

const surface = (id: string, x: number, y: number, width: number, height: number, extra: Partial<SurfaceSnapshot> = {}): SurfaceSnapshot =>
  ({ id, concept: "test", geometry: { pixelBounds: { x, y, width, height }, viewportBounds: { x: 0, y: 0, width: 0, height: 0 } },
    visibility: { visible: true, clipped: false, visibleFraction: 1 }, ...extra });
const envelope = (surfaces: SurfaceSnapshot[]): SnapshotEnvelope => ({ version: "0.1", timestamp: 0,
  viewport: { width: 100, height: 100 }, surfaces });

describe("geometry diagnostics", () => {
  it("measures each containment edge without confusing coordinate spaces", () => {
    expect(containmentOverflow({ x: -2, y: 5, width: 108, height: 99 }, { x: 0, y: 10, width: 100, height: 90 }))
      .toEqual({ overflowLeft: 2, overflowTop: 5, overflowRight: 6, overflowBottom: 4 });
  });

  it("reports a child extending beyond its visual parent", () => {
    const parent = surface("upload", 10, 10, 80, 80);
    const child = surface("upload.add-child", 70, 20, 44, 20, { parentId: "upload" });
    expect(diagnose(envelope([parent, child]))).toContainEqual(expect.objectContaining({ type: "outside-parent-bounds",
      surfaceId: "upload.add-child", data: expect.objectContaining({ overflowRight: 24 }) }));
  });

  it("handles negative coordinates, viewport overflow, clipping, zero size, and hidden controls", () => {
    const clipped = surface("clipped", -10, 90, 30, 20, { visibility: { visible: true, clipped: true, visibleFraction: 0.25 } });
    const zero = surface("zero", 1, 1, 0, 10);
    const hidden = surface("hidden", 1, 1, 10, 10, { role: "button", visibility: { visible: false, clipped: false, hiddenReason: "display" } });
    const result = diagnose(envelope([clipped, zero, hidden]));
    expect(result.map((item) => item.type)).toEqual(expect.arrayContaining([
      "viewport-overflow", "clipped-content", "zero-size-visible-element", "hidden-interactive-control"]));
  });

  it("respects a configured geometry tolerance", () => {
    const snapshot = envelope([surface("tiny-overflow", 0, 0, 100.4, 100)]);
    snapshot.tolerances = { geometryPixels: 0.5 };
    expect(diagnose(snapshot)).toEqual([]);
  });
});
