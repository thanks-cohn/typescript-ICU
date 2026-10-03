# ICU API

This directory is the **official public API documentation home** for ICU / the Perceptual Interface Runtime.

The long-term API goal is a framework-, transport-, vendor-, and repository-name-independent contract for exposing what a user can actually perceive and interact with.

## Current status

The implementation already has a real v0.1 API surface across the `core`, `browser`, `diagnostics`, `agent`, and `capture` packages, but the contracts are currently marked provisional and the workspace packages are not yet early-adopter-ready.

The current implemented surface is documented in:

- [CURRENT_API_V0_1.md](CURRENT_API_V0_1.md)

The next Codex run is tasked with turning that implemented surface into a deliberately versioned Public API v0.1 and updating this directory to match what is actually shipped.

## Documentation rule

Any change to public API names, types, serialized snapshot shape, diagnostics, query behavior, versioning, package exports, capture contracts, or adapter obligations must update the relevant documentation in `docs/API/` in the same coherent change.

> **Change the API, change `docs/API/`.**

Planning documents and handoffs do not replace the official API reference.

## Authority

The intended authority order is:

1. the perceptual-interface standard and standardization charter,
2. documented public serialized contracts and API semantics,
3. conformance/behavior tests,
4. package implementations,
5. transports and framework-specific adapters.

No transport such as MCP, HTTP, WebSocket, extension messaging, or Electron IPC should define ICU semantics.
