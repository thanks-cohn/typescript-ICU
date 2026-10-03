# AGENTS.md

## Mission

Build a small, portable, framework-independent runtime that gives agents a structured view into the user's visible software experience.

The standard must preserve meaning above implementation.

Do not optimize for one framework, one browser, one repository, or one vendor.

## Core rules

1. JavaScript and TypeScript are both first-class.
2. Zero-config adoption must provide immediate value.
3. Explicit annotations may deepen semantics but must not be mandatory.
4. The core schema must be serializable and framework-agnostic.
5. Prefer normalized viewport- and parent-relative geometry over brittle absolute coordinates.
6. Treat DOM, accessibility, render capture, and vision as complementary observation providers.
7. Never equate DOM existence with user-visible truth.
8. Capture providers are adapters. The standard itself must not depend on a specific screenshot mechanism.
9. 3D support must model camera/projected geometry rather than force everything through DOM abstractions.
10. Avoid repo-name-coupled public API names.

## v0.1 scope

Implement only:

- surface registry,
- concept/role metadata,
- DOM binding,
- pixel bounds,
- normalized viewport bounds,
- parent-relative bounds,
- visibility,
- clipping,
- overflow/containment diagnostics,
- JSON snapshot,
- query API,
- watch/change stream,
- optional capture provider interface.

Do not build React/Vue/Three.js adapters yet unless the browser core is complete and tested.

## Acceptance example

An agent should be able to identify that a child control extends outside its visual parent and receive something equivalent to:

```json
{
  "type": "outside-parent-bounds",
  "surface": "upload.add-child",
  "overflowRight": 24
}
```

without project-specific logic.

## Development style

- Keep packages small.
- Prefer explicit schemas and pure functions.
- Avoid framework dependencies in `core`.
- Add tests for geometry edge cases before adding convenience APIs.
- Public contracts must be documented.
- Keep all names provisional unless explicitly marked stable.
