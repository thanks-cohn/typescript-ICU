import type { Diagnostic, SnapshotEnvelope, SnapshotProvider, SurfaceChangeListener, SurfaceSnapshot } from "@perceptual/core";

export interface QueryOptions { diagnose?: (snapshot: SnapshotEnvelope) => Diagnostic[] }
export interface PerceptualQueryApi {
  snapshot(): SnapshotEnvelope;
  listSurfaces(): SurfaceSnapshot[];
  getSurface(id: string): SurfaceSnapshot | undefined;
  findByConcept(concept: string): SurfaceSnapshot[];
  hitTest(x: number, y: number): SurfaceSnapshot[];
  validate(): Diagnostic[];
  watch(listener: SurfaceChangeListener): () => void;
}

/** Adds transport-independent query operations to any snapshot provider. */
export function createQueryApi(provider: SnapshotProvider, options: QueryOptions = {}): PerceptualQueryApi {
  const snapshot = () => structuredClone(provider.snapshot());
  return {
    snapshot,
    listSurfaces: () => snapshot().surfaces,
    getSurface: (id) => snapshot().surfaces.find((surface) => surface.id === id),
    findByConcept: (concept) => snapshot().surfaces.filter((surface) => surface.concept === concept),
    hitTest: (x, y) => snapshot().surfaces.filter((surface) => {
      if (!surface.visibility?.visible || !surface.geometry) return false;
      const rect = surface.geometry.clipBounds ?? surface.geometry.pixelBounds;
      return x >= rect.x && y >= rect.y && x <= rect.x + rect.width && y <= rect.y + rect.height;
    }).reverse(),
    validate: () => { const value = snapshot(); return options.diagnose?.(value) ?? value.diagnostics ?? []; },
    watch: (listener) => provider.watch?.(listener) ?? (() => undefined),
  };
}
