import type { Diagnostic, SnapshotEnvelope, SurfaceSnapshot } from "@perceptual/core";

export interface PerceptualQueryApi {
  snapshot(): SnapshotEnvelope;
  listSurfaces(): SurfaceSnapshot[];
  getSurface(id: string): SurfaceSnapshot | undefined;
  findByConcept(concept: string): SurfaceSnapshot[];
  hitTest(x: number, y: number): SurfaceSnapshot[];
  validate(): Diagnostic[];
  watch(listener: (event: unknown) => void): () => void;
}
