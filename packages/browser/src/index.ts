import type { SnapshotEnvelope, SurfaceSnapshot } from "@perceptual/core";

export interface ObserveOptions {
  root?: Document | Element;
  autoDiscover?: boolean;
}

export interface BrowserObserver {
  snapshot(): SnapshotEnvelope;
  stop(): void;
  registerSurface(element: Element, surface: Partial<SurfaceSnapshot> & Pick<SurfaceSnapshot, "id" | "concept">): void;
  unregisterSurface(id: string): void;
}

export function observe(_options: ObserveOptions = {}): BrowserObserver {
  throw new Error("Not implemented: follow docs/CODEX_IMPLEMENTATION_PLAN.md");
}
