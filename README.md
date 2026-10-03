# Perceptual Interface Runtime

A framework-agnostic instrumentation standard for the agentic era.

The goal is to let software expose not only its code and state, but also a durable machine-readable model of what the user is intended to see.

The runtime should be installable into an arbitrary project, work with JavaScript and TypeScript, and progressively expose:

- semantic surface identity,
- viewport-relative geometry,
- parent/child relationships,
- visibility and clipping,
- overflow and containment,
- interaction affordances,
- optional screenshot/capture providers,
- expected-vs-observed perceptual contracts,
- and later, 3D scene/camera projection.

The project is repo-name agnostic. Package names are provisional until the standard name stabilizes.

## Immediate target

The first proof should be a browser app where an agent can ask:

```text
What is visible?
Where is it?
What does it mean?
What is clipped or overflowing?
What changed after this interaction?
Give me the rendered region for this surface.
```

and receive structured answers without scraping raw DOM manually.

## Monorepo direction

```text
packages/
  core/          schemas, surfaces, contracts, relationships
  browser/       DOM observation, geometry, visibility
  diagnostics/   overflow, clipping, containment
  agent/         query, snapshot, watch
  capture/       screenshot/capture provider interface

examples/
  vanilla/
  typescript/

docs/
```

See:

- `docs/FOUNDATIONAL_PERCEPTUAL_INTERFACE_STANDARD_PROPOSAL.md`
- `docs/CODEX_IMPLEMENTATION_PLAN.md`
- `docs/STANDARDIZATION_CHARTER.md`

## v0.1 usage

The browser observer is framework-independent and discovers semantic HTML and ARIA surfaces without configuration:

```js
import { observe } from "@perceptual/browser";

const observer = observe();
console.log(observer.snapshot());
const unwatch = observer.watch((change) => console.log(change));
```

Applications may add stable meaning with `data-perceptual-id` and `data-perceptual-concept`, or call
`observer.registerSurface(element, { id, concept })`. Pass the observer to `createQueryApi` for list, lookup,
concept search, hit testing, validation, and transport-neutral change subscriptions. Capture is optional and is
represented only by the `CaptureProvider` contract in v0.1.

Geometry uses CSS pixels for `pixelBounds`, viewport-normalized values for `viewportBounds`, and parent-normalized
values for `parentBounds`. Diagnostics operate on JSON snapshots rather than browser objects. Public contracts remain
provisional until the standard is stabilized.
