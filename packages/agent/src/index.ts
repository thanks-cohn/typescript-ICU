import type { Diagnostic, SnapshotEnvelope, SnapshotProvider, SurfaceChangeListener, SurfaceSnapshot } from "@perceptual/core";
import { PUBLIC_API_VERSION, SNAPSHOT_VERSION } from "@perceptual/core";

export interface QueryOptions {
  diagnose?: (snapshot: SnapshotEnvelope) => Diagnostic[];
  capture?: { viewport: boolean; region?: boolean; surface?: boolean };
  implementation?: { name?: string; version?: string; profile?: string };
}
export interface ApiDescription {
  apiVersion: typeof PUBLIC_API_VERSION;
  snapshotVersion: typeof SNAPSHOT_VERSION;
  operations: readonly ["describe", "snapshot", "listSurfaces", "getSurface", "findByConcept", "hitTest", "validate", "watch"];
  capabilities: {
    diagnostics: boolean;
    watch: boolean;
    capture?: { viewport: boolean; region: boolean; surface: boolean };
  };
  implementation?: { name?: string; version?: string; profile?: string };
}
export interface PerceptualQueryApi {
  describe(): ApiDescription;
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
    describe: () => ({
      apiVersion: PUBLIC_API_VERSION,
      snapshotVersion: SNAPSHOT_VERSION,
      operations: ["describe", "snapshot", "listSurfaces", "getSurface", "findByConcept", "hitTest", "validate", "watch"],
      capabilities: {
        diagnostics: options.diagnose !== undefined || provider.snapshot().diagnostics !== undefined,
        watch: provider.watch !== undefined,
        ...(options.capture && { capture: { viewport: options.capture.viewport, region: options.capture.region ?? false,
          surface: options.capture.surface ?? false } }),
      },
      ...(options.implementation && { implementation: structuredClone(options.implementation) }),
    }),
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
