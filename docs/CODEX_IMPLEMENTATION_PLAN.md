# Codex Implementation Plan

## Objective

Create the smallest useful implementation of the perceptual-interface standard.

The first implementation should prove that a generic browser project can install the runtime and immediately expose a machine-observable scene describing what the user sees.

## Milestone 0: workspace

Establish:

- npm workspaces,
- TypeScript build configuration,
- package boundaries,
- test runner,
- examples,
- CI-ready scripts.

## Milestone 1: core schema

Implement `packages/core`.

Required types:

```ts
type SurfaceId = string;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SurfaceGeometry {
  pixelBounds: Rect;
  viewportBounds: Rect;
  parentBounds?: Rect;
}

interface VisibilityState {
  visible: boolean;
  clipped: boolean;
  visibleFraction?: number;
}

interface SurfaceSnapshot {
  id: SurfaceId;
  concept: string;
  role?: string;
  text?: string;
  state?: Record<string, unknown>;
  geometry?: SurfaceGeometry;
  visibility?: VisibilityState;
  parentId?: SurfaceId;
  childIds?: SurfaceId[];
}
```

Also define:

- relationships,
- diagnostics,
- perceptual contracts,
- snapshot envelope,
- provider interfaces.

No browser imports are allowed in `core`.

## Milestone 2: browser observer

Implement `packages/browser`.

Provide:

```ts
observe(options?)
stop()
snapshot()
registerSurface(...)
unregisterSurface(...)
```

Zero-config discovery should inspect:

- buttons,
- links,
- inputs,
- selects,
- textareas,
- dialogs,
- nav,
- main,
- aside,
- header,
- footer,
- images,
- video,
- audio,
- canvas,
- iframe,
- ARIA-role-bearing elements,
- explicitly annotated elements.

Infer concept from semantic HTML and ARIA when possible.

Each observed surface should capture:

- `getBoundingClientRect()`,
- normalized viewport bounds,
- nearest observed semantic parent,
- computed visibility,
- overflow/clipping context,
- focusability/interactivity,
- accessible name when available.

## Milestone 3: diagnostics

Implement `packages/diagnostics`.

Required v0.1 diagnostics:

- `outside-parent-bounds`
- `viewport-overflow`
- `clipped-content`
- `zero-size-visible-element`
- `hidden-interactive-control`

Diagnostics must be pure over snapshots whenever possible.

## Milestone 4: agent query surface

Implement `packages/agent`.

Required API:

```ts
listSurfaces()
getSurface(id)
findByConcept(concept)
hitTest(x, y)
snapshot()
validate()
watch(listener)
```

The agent package should not require a specific transport.

It should be possible to wrap it later in:

- MCP,
- WebSocket,
- HTTP,
- Chrome extension messaging,
- Electron IPC.

## Milestone 5: capture provider

Implement `packages/capture`.

Define only the provider contract first:

```ts
interface CaptureProvider {
  captureViewport(): Promise<CaptureResult>;
  captureRegion?(rect: Rect): Promise<CaptureResult>;
  captureSurface?(id: string): Promise<CaptureResult>;
}
```

The core runtime should function without a capture provider.

## Milestone 6: examples

Create:

- vanilla JavaScript example,
- TypeScript example.

Each should demonstrate one-line observation plus a deliberately overflowing child so diagnostics can prove the system works.

## Milestone 7: watch/change model

Use browser primitives such as:

- `MutationObserver`,
- `ResizeObserver`,
- scroll/resize listeners,
- focus/input/change events.

Emit normalized changes:

```text
surface-added
surface-removed
surface-moved
surface-resized
surface-hidden
surface-visible
state-changed
viewport-changed
```

Coalesce aggressively. Do not flood agents with raw DOM mutation events.

## Milestone 8: calibration foundation

Do not build a full calibration suite yet.

Add schema support for:

- viewport dimensions,
- devicePixelRatio,
- browser metadata,
- tolerances.

Document the intended future `calibrate` command.

## Definition of done for v0.1

A new web project can:

```ts
import { observe } from "<package>";

observe();
```

and an agent-facing query layer can return structured surfaces, geometry, visibility, and overflow diagnostics.

The implementation must not require React, browser extensions, screenshots, or project-specific annotations.

## Explicitly defer

- React/Vue/Svelte adapters
- Three.js/Babylon adapters
- full computer vision
- screenshot implementation
- native desktop capture
- calibration CLI
- standardized concept registry governance
- autonomous repair

Those belong after the browser core is proven.
