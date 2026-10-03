# Foundational Proposal: Perceptual Interface Architecture

**Status:** Foundational proposal  
**Scope:** Language- and framework-agnostic standard with first-class JavaScript and TypeScript support  
**Goal:** Make user interfaces machine-observable at the level of human-visible concepts, geometry, state, and perceptual outcome.

---

## 1. Summary

Modern software gives machines several partial views of an interface:

- source code,
- DOM or component trees,
- application state,
- accessibility trees,
- event systems,
- screenshots,
- video capture,
- browser automation,
- and, in 3D environments, scene graphs, cameras, transforms, and render state.

These are useful, but they do not form a single durable contract describing **what the user is actually intended to see and interact with**.

This proposal defines a standard architecture for exposing that contract.

The central idea is simple:

> Every important visible concept should be able to describe what it is, where it is, what state it is in, what it should look like or do, and how that claim can be verified against the rendered experience.

This creates a bridge between programmatic truth and perceptual truth.

The intended result is software that can be maintained not only logically and structurally, but also perceptually. A future agent should be able to detect conditions such as:

- an element exists but is clipped,
- a modal is logically open but visually absent,
- a control renders outside its parent,
- a 3D object is technically in the scene but not meaningfully visible from the current camera,
- an interaction target is present but occluded,
- a layout shifted relative to the viewport,
- or two implementations serve the same conceptual role even though their code differs.

This is intended as a general standard, not a project-specific debugging layer.

---

## 2. Motivation

Agentic software development changes what "maintainable" should mean.

Historically, maintainability has focused on:

- source readability,
- stable APIs,
- type safety,
- test coverage,
- predictable data flow,
- separation of concerns,
- and compatibility across versions.

These remain essential.

However, an agent that can modify software autonomously needs another layer:

> It must be able to reason about the relationship between implementation and human-visible result.

Today, that relationship is usually reconstructed ad hoc from:

- DOM inspection,
- screenshots,
- browser automation,
- CSS analysis,
- visual models,
- or application-specific heuristics.

This is fragile.

A machine may know that a node exists without knowing whether the user can see it.

It may know that state says `lightboxOpen = true` without knowing whether a lightbox is actually visible.

It may know that a 3D object exists at a world coordinate without knowing whether the current camera, projection, viewport, clipping planes, occluders, and display size make it meaningfully visible to the user.

The proposed standard makes these relationships explicit.

---

## 3. Design Principle

The foundational principle is:

> Preserve semantic and perceptual meaning above implementation details.

Frameworks change.

Rendering engines change.

Browsers change.

Operating systems change.

Screen sizes change.

Input methods change.

But concepts such as these remain understandable:

- button,
- dialog,
- destination picker,
- file explorer,
- timeline,
- viewport,
- 3D object,
- camera,
- selected item,
- active surface,
- visible region,
- occluded region,
- expected modal,
- editable document,
- media control.

A durable interface architecture should expose these concepts independently of the implementation that currently renders them.

---

## 4. The Core Model

The standard should model an interface through a set of **Perceptual Surfaces** and **Perceptual Contracts**.

### 4.1 Perceptual Surface

A Perceptual Surface is any region or object that may contribute to what the user sees or interacts with.

Examples:

- a DOM element,
- a canvas,
- a WebGL surface,
- a video element,
- a document page,
- a floating panel,
- a menu,
- a window,
- a 2D sprite,
- a 3D mesh,
- a camera,
- a world-space label,
- an iframe,
- a native desktop window,
- or a composite surface containing other surfaces.

A surface should be identifiable independently from its implementation.

Conceptually:

```ts
interface PerceptualSurface {
  id: string;
  concept: string;
  role?: string;
  state?: Record<string, unknown>;
  parent?: string;
  children?: string[];

  geometry?: SurfaceGeometry;
  visibility?: VisibilityState;
  actions?: SurfaceAction[];
  relationships?: SurfaceRelationship[];

  expected?: PerceptualExpectation;
  observed?: PerceptualObservation;
}
```

The exact API is not fixed by this proposal. The important part is the information model.

---

## 5. Identity and Concept

Every important surface should have both:

### Identity

A stable identity for the particular object.

Examples:

```text
explorer.preview.lightbox
upload.destination.child.2
world.camera.main
resume.section.experience
```

### Concept

A reusable semantic classification.

Examples:

```text
lightbox
destination-picker
file-explorer
media-timeline
document-section
3d-object
camera
viewport-overlay
```

This allows agents to reason across unrelated projects.

An agent should eventually be able to ask:

> Find all implementations of `destination-picker`.

without needing to know class names, framework names, DOM shapes, or repository-specific naming conventions.

---

## 6. Geometry as a First-Class Contract

The standard should expose geometry in a normalized way.

For 2D surfaces this may include:

- viewport-relative bounds,
- parent-relative bounds,
- document-relative bounds,
- scroll position,
- clipping region,
- transform,
- z-order,
- and visible fraction.

Example:

```ts
interface Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SurfaceGeometry2D {
  viewport: Rect2D;
  normalizedViewport?: Rect2D;
  parent?: Rect2D;
  clip?: Rect2D;
  zIndex?: number;
  transform?: number[];
}
```

Normalized viewport values are especially useful for portability:

```text
x = 0.72
y = 0.14
width = 0.18
height = 0.06
```

These remain meaningful across different resolutions.

---

## 7. 3D Surfaces

The same principle must extend beyond DOM interfaces.

A 3D object can be described relative to:

- world position,
- camera position,
- camera orientation,
- projection,
- field of view,
- clipping planes,
- viewport dimensions,
- depth,
- occlusion,
- projected screen-space bounds,
- apparent size,
- and visibility confidence.

A machine should be able to answer:

> The object exists in world space, but can the user plausibly see it right now?

A conceptual representation might include:

```ts
interface SurfaceGeometry3D {
  worldMatrix?: number[];
  worldPosition?: [number, number, number];
  cameraId?: string;

  projectedBounds?: Rect2D;
  projectedCenter?: [number, number];
  depth?: number;

  inFrustum?: boolean;
  occluded?: boolean;
  visibleFraction?: number;
  apparentPixelArea?: number;
}
```

This allows a rendering engine to expose user-perceptual meaning without requiring a vision model to rediscover the scene from pixels alone.

---

## 8. Multiple Layers of Truth

The architecture should distinguish several kinds of truth rather than collapsing them together.

### 8.1 Logical truth

What application state claims.

Example:

```text
lightboxOpen = true
```

### 8.2 Structural truth

What the runtime says exists.

Example:

```text
DOM node exists
display != none
width = 1200
height = 800
```

### 8.3 Geometric truth

Where the runtime says it is.

Example:

```text
centered in viewport
94% viewport width
z-index = 1000
```

### 8.4 Render truth

What the renderer produced.

Examples:

- pixel region,
- canvas frame,
- compositor output,
- GPU surface,
- browser screenshot,
- native window capture.

### 8.5 Perceptual truth

What a human observer would plausibly perceive.

Examples:

- visible,
- mostly visible,
- clipped,
- hidden,
- occluded,
- unreadable,
- too small to notice,
- visually overlapping another control,
- apparently absent.

A mature implementation should allow these layers to be compared.

---

## 9. Perceptual Contracts

A **Perceptual Contract** describes what should be true when a concept is in a given state.

Example:

```ts
registerPerceptualContract({
  id: "explorer.preview.lightbox",
  concept: "lightbox",

  state: {
    openWhen: "previewLightboxOpen"
  },

  expected: {
    visibleWhenOpen: true,
    centered: true,
    modal: true,
    viewportCoverage: {
      min: 0.75,
      max: 1.0
    }
  },

  actions: ["open", "close"]
});
```

A validation agent can compare the contract against observed state.

Example diagnostic:

```text
Contract: explorer.preview.lightbox

Logical truth:
  open = true

Structural truth:
  node exists = true

Geometric truth:
  viewport coverage = 0.84

Perceptual truth:
  modal detected = false

Result:
  perceptual contract violation
```

This is far more useful than simply knowing that an event handler ran successfully.

---

## 10. Relative Rather Than Absolute Meaning

The standard should prefer relationships over brittle absolute values.

For example:

Bad:

```text
button x = 937 px
```

Better:

```text
button is aligned to the right edge of upload panel
button has 16 px internal margin
button is fully contained by upload panel
button is horizontally adjacent to location selector
```

Likewise in 3D:

Bad:

```text
object screen x = 814
```

Better:

```text
object projects into the center-right quadrant
object occupies approximately 8% of viewport height
object is in front of the camera
object is not occluded
```

Relative semantics survive device and viewport changes much better.

---

## 11. Calibration

A critical part of this proposal is **calibration**.

The same interface can render differently across:

- viewport sizes,
- pixel densities,
- zoom levels,
- browsers,
- operating systems,
- font renderers,
- GPUs,
- accessibility settings,
- input modes,
- and native window environments.

The standard should therefore support calibration runs.

A calibration process may:

1. render known reference surfaces,
2. measure actual bounds,
3. compare expected and observed geometry,
4. record environment characteristics,
5. establish correction factors or tolerances,
6. and save a reusable environment profile.

Conceptually:

```ts
interface CalibrationProfile {
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };

  browser?: string;
  platform?: string;
  zoom?: number;

  measurements: Record<string, unknown>;
  tolerances: Record<string, number>;
}
```

The long-term goal is for a project to install the standard, run calibration, and immediately establish how interface geometry behaves on that machine.

---

## 12. Observation Providers

The standard should not depend on one way of "seeing."

Instead it should support multiple observation providers.

Possible providers include:

- DOM geometry,
- accessibility tree,
- browser screenshot,
- canvas capture,
- WebGL scene graph,
- WebGPU instrumentation,
- native window bounds,
- operating-system accessibility APIs,
- GPU frame capture,
- computer vision,
- application-defined semantic state,
- test instrumentation,
- and remote-device telemetry.

An implementation should be allowed to combine as many of these as are available.

For example:

```text
Semantic provider
    +
DOM geometry provider
    +
Screenshot provider
    +
Vision provider
    =
high-confidence perceptual observation
```

No individual provider should be treated as universally sufficient.

---

## 13. JavaScript and TypeScript

The first implementation should support both JavaScript and TypeScript naturally.

TypeScript should provide:

- type definitions,
- contracts,
- schemas,
- validation helpers,
- IDE completion,
- and compile-time guidance.

JavaScript should remain a first-class runtime consumer.

A JavaScript project should not need to convert to TypeScript to adopt the standard.

The package should therefore expose plain runtime APIs, with TypeScript definitions layered on top.

Example:

```js
import { defineSurface } from "@standard/runtime";

defineSurface({
  id: "upload.destination",
  concept: "destination-picker",
  element: document.querySelector("#upload-destination")
});
```

The TypeScript form should use the same runtime:

```ts
import {
  defineSurface,
  type PerceptualSurfaceDefinition
} from "@standard/runtime";

const destination: PerceptualSurfaceDefinition = {
  id: "upload.destination",
  concept: "destination-picker",
  element: document.querySelector("#upload-destination")
};

defineSurface(destination);
```

The design should not be tied to the repository's current name.

---

## 14. Framework Independence

The standard should work with:

- plain HTML,
- vanilla JavaScript,
- TypeScript,
- React,
- Vue,
- Svelte,
- Solid,
- Web Components,
- Canvas,
- Three.js,
- Babylon.js,
- custom WebGL,
- WebGPU,
- Electron,
- native desktop bridges,
- and future frameworks.

Adapters may exist, but the conceptual core must remain independent.

Example:

```text
core
  ├── DOM adapter
  ├── React adapter
  ├── Web Components adapter
  ├── Three.js adapter
  ├── Babylon adapter
  ├── Electron adapter
  └── Native bridge adapter
```

---

## 15. Portable Surface Schema

A standard serialized representation should eventually exist.

For example:

```json
{
  "id": "explorer.lightbox",
  "concept": "lightbox",
  "role": "modal-preview",
  "state": {
    "open": true
  },
  "geometry": {
    "viewport": {
      "x": 0.03,
      "y": 0.05,
      "width": 0.94,
      "height": 0.90
    }
  },
  "visibility": {
    "expected": true,
    "observed": true,
    "visibleFraction": 1
  },
  "relationships": [
    {
      "type": "obscures",
      "target": "workspace"
    }
  ]
}
```

This representation should be:

- serializable,
- inspectable,
- versioned,
- transportable,
- and understandable without the original framework.

---

## 16. Concept Registry

A future shared registry may define common concepts.

Examples:

```text
button
menu
dialog
lightbox
file-explorer
destination-picker
timeline
editor
viewport
3d-object
camera
toolbar
document-page
media-player
notification
breadcrumb
tab
panel
```

Projects should be able to extend the registry with custom concepts.

The goal is not to constrain design.

The goal is to create enough common vocabulary that machines do not have to rediscover basic interface meaning in every repository.

---

## 17. Relationship Graph

Interfaces should be represented not only as trees, but as relationship graphs.

Useful relationships include:

```text
contains
contained-by
aligned-with
anchored-to
overlaps
must-not-overlap
obscures
is-obscured-by
controls
controlled-by
opens
closes
precedes
follows
projects-to
rendered-by
belongs-to-camera
depends-on
represents
```

Example:

```text
lightbox-button
  opens -> lightbox

lightbox
  obscures -> workspace
  contains -> preview-media

preview-media
  represents -> selected-file
```

This structure is more useful to an agent than raw DOM ancestry alone.

---

## 18. Perceptual Diagnostics

A core library should eventually provide diagnostics such as:

- outside-parent-bounds,
- clipped-content,
- accidental-overflow,
- hidden-interactive-control,
- zero-size-visible-element,
- expected-visible-but-not-observed,
- unexpected-visible-surface,
- modal-not-modal,
- unreadable-text,
- insufficient-target-size,
- viewport-offscreen,
- 3d-object-out-of-frustum,
- 3d-object-occluded,
- projected-size-too-small,
- duplicate-semantic-controls,
- and state/render mismatch.

Example:

```text
UPLOAD_DESTINATION_ADD_BUTTON

Expected:
  contained-by upload-card
  right-margin >= 12 px

Observed:
  right edge exceeds parent by 18 px

Violation:
  accidental-overflow
```

---

## 19. Human View as Ground Truth

The standard should avoid assuming that code is always correct simply because the program state says so.

The ultimate design principle is:

> The user experiences rendered output, not source code.

For this reason, visual evidence should remain available as a verification layer.

The standard is not intended to eliminate screenshots, visual models, or rendered-frame inspection.

It is intended to make them dramatically more useful by giving machines semantic and geometric context before they inspect pixels.

Instead of asking a model:

> What is wrong with this screenshot?

the system can ask:

> This region is contractually a modal dialog, this rectangle is its expected viewport location, this is its semantic role, and this is the rendered image. Does the perceptual result satisfy the contract?

That is a much stronger problem formulation.

---

## 20. Minimal Adoption Path

Adoption should be extremely lightweight.

A project should be able to begin with only a few declarations.

Example:

```js
defineSurface({
  id: "main-toolbar",
  concept: "toolbar",
  element: document.querySelector("header")
});

defineSurface({
  id: "save-button",
  concept: "button",
  element: document.querySelector("#save"),
  relationships: [
    { type: "contained-by", target: "main-toolbar" }
  ]
});
```

Automatic adapters should infer as much as possible.

Developers should not need to manually annotate every element.

A mature implementation should combine:

- automatic discovery,
- framework adapters,
- semantic conventions,
- explicit overrides,
- and agent-generated annotations.

The standard succeeds only if adoption is easier than inventing a custom system.

---

## 21. Agent Interface

The architecture should expose a stable agent-facing query surface.

Examples:

```text
listSurfaces()
getSurface(id)
findByConcept("lightbox")
getGeometry(id)
getVisibility(id)
getRelationships(id)
getObservedFrame(id)
validateContract(id)
compareExpectedToObserved(id)
traceAction("upload")
traceConcept("destination-picker")
```

An agent should be able to move from concept to implementation and back again.

For example:

```text
"Find the upload destination picker"
        ↓
concept registry
        ↓
surface id
        ↓
DOM node / component / scene object
        ↓
geometry
        ↓
rendered region
        ↓
visual validation
        ↓
source implementation
```

This is the core bridge between software maintenance and machine perception.

---

## 22. Portability and Longevity

A major goal is long-term portability.

The standard should avoid binding durable meaning to:

- CSS class names,
- generated DOM structure,
- framework internals,
- transient component IDs,
- exact pixel coordinates,
- or one browser engine.

Durable concepts should remain stable while implementation details are allowed to change.

This means a future rewrite can preserve:

```text
concept: lightbox
contract: covers viewport while open
action: close
relationship: contains preview
```

even if the implementation changes from:

```text
DOM + CSS
```

to:

```text
Canvas
```

or:

```text
native desktop compositor
```

or something that does not yet exist.

---

## 23. Proposed Architecture

A possible package architecture:

```text
core/
  schema
  contracts
  concepts
  relationships
  geometry
  validation

runtime/
  registry
  observation
  diagnostics
  transport

adapters/
  dom
  canvas
  webgl
  webgpu
  three
  babylon
  react
  electron
  native

observers/
  screenshot
  accessibility
  vision
  compositor

calibration/
  viewport
  browser
  device
  renderer

agent/
  query-api
  trace-api
  validation-api
```

The first implementation can be much smaller.

The architecture should simply leave room for this evolution.

---

## 24. Initial Milestone

The first useful milestone should remain deliberately narrow.

### Phase 1

Support browser-based 2D interfaces with:

- surface registration,
- concept names,
- DOM binding,
- viewport-relative geometry,
- parent-relative geometry,
- visibility state,
- clipping detection,
- overflow detection,
- simple relationships,
- JSON serialization,
- JavaScript runtime,
- TypeScript types,
- and a query API.

### Phase 2

Add:

- screenshot-region association,
- expected-vs-observed contracts,
- browser/device calibration,
- visual verification hooks,
- and framework adapters.

### Phase 3

Add 3D support:

- scene objects,
- cameras,
- frustum state,
- world-to-screen projection,
- occlusion hooks,
- apparent size,
- and projected viewport bounds.

### Phase 4

Add deeper agent interoperability:

- automatic concept inference,
- visual diagnostics,
- cross-repository concept tracing,
- migration assistance,
- and autonomous repair validation.

---

## 25. Non-Goals

This proposal does not attempt to:

- replace the DOM,
- replace accessibility APIs,
- replace screenshots,
- replace computer vision,
- replace browser automation,
- replace testing frameworks,
- prescribe a visual design system,
- or define one UI framework.

It is intended to connect these systems through a common semantic and perceptual layer.

---

## 26. Standardization Goal

The long-term ambition is to make this kind of interface observability ordinary.

In an agentic software ecosystem, a machine should not have to approach every interface as an unknown pile of code and pixels.

Applications should be able to expose:

- what their visible concepts are,
- where those concepts are,
- how those concepts relate,
- what state they are in,
- what users should perceive,
- and how those claims can be verified.

The standard should be small enough to adopt broadly and expressive enough to survive major changes in implementation technology.

The aspiration is that future software routinely ships with a perceptual interface surface in the same way modern software routinely ships with APIs, types, tests, and accessibility metadata.

---

## 27. Foundational Statement

The foundation of this work can be summarized as:

> **Software should be able to describe what it means to show.**

And the stronger form:

> **A machine should be able to trace from concept, to implementation, to geometry, to rendered output, to human-visible result.**

That is the standard this proposal intends to establish.
