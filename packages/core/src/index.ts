/** Public contracts are provisional for v0.1. All values are JSON serializable. */
export type SurfaceId = string;

export interface Rect { x: number; y: number; width: number; height: number }

export interface SurfaceGeometry {
  /** CSS pixel coordinates relative to the viewport. */
  pixelBounds: Rect;
  /** pixelBounds divided by viewport width and height. */
  viewportBounds: Rect;
  /** Bounds relative to the nearest observed parent; dimensions are parent-normalized. */
  parentBounds?: Rect;
  /** The portion of pixelBounds surviving viewport and ancestor clipping. */
  clipBounds?: Rect;
}

export interface VisibilityState {
  visible: boolean;
  clipped: boolean;
  visibleFraction?: number;
  hiddenReason?: "display" | "visibility" | "opacity" | "zero-size" | "outside-clip";
}

export interface SurfaceRelationship { type: string; target: SurfaceId }
export interface SurfaceAction { id: string; label?: string }

export interface SurfaceSnapshot {
  id: SurfaceId;
  concept: string;
  role?: string;
  text?: string;
  state?: Record<string, unknown>;
  geometry?: SurfaceGeometry;
  visibility?: VisibilityState;
  parentId?: SurfaceId;
  childIds?: SurfaceId[];
  relationships?: SurfaceRelationship[];
  actions?: SurfaceAction[];
}

export type DiagnosticType = "outside-parent-bounds" | "viewport-overflow" | "clipped-content" |
  "zero-size-visible-element" | "hidden-interactive-control" | "contract-violation";
export interface Diagnostic {
  type: DiagnosticType;
  surfaceId: SurfaceId;
  message?: string;
  data?: Record<string, unknown>;
}

export interface SnapshotEnvelope {
  version: "0.1";
  timestamp: number;
  viewport?: { width: number; height: number; devicePixelRatio?: number };
  environment?: { userAgent?: string; language?: string };
  tolerances?: { geometryPixels?: number; visibleFraction?: number };
  surfaces: SurfaceSnapshot[];
  diagnostics?: Diagnostic[];
}

export interface PerceptualExpectation { visible?: boolean; containedBy?: SurfaceId; centered?: boolean; modal?: boolean }
export interface PerceptualContract { id: string; surfaceId: SurfaceId; concept?: string; expected: PerceptualExpectation }

export type SurfaceChangeType = "surface-added" | "surface-removed" | "surface-moved" | "surface-resized" |
  "surface-hidden" | "surface-visible" | "state-changed" | "viewport-changed";
export interface SurfaceChange { type: SurfaceChangeType; surfaceId?: SurfaceId; snapshot: SnapshotEnvelope }
export type SurfaceChangeListener = (change: SurfaceChange) => void;

export interface SnapshotProvider { snapshot(): SnapshotEnvelope; watch?(listener: SurfaceChangeListener): () => void }
export interface DiagnosticProvider { validate(snapshot: SnapshotEnvelope): Diagnostic[] }

/** Framework-independent registry useful to non-DOM providers. */
export class SurfaceRegistry {
  readonly #surfaces = new Map<SurfaceId, SurfaceSnapshot>();
  register(surface: SurfaceSnapshot): void {
    if (!surface.id || !surface.concept) throw new TypeError("A surface requires non-empty id and concept");
    this.#surfaces.set(surface.id, structuredClone(surface));
  }
  unregister(id: SurfaceId): boolean { return this.#surfaces.delete(id); }
  get(id: SurfaceId): SurfaceSnapshot | undefined {
    const value = this.#surfaces.get(id); return value && structuredClone(value);
  }
  list(): SurfaceSnapshot[] { return [...this.#surfaces.values()].map((value) => structuredClone(value)); }
  clear(): void { this.#surfaces.clear(); }
}
