# ICU API

This directory is the official public API documentation home for ICU / the Perceptual Interface Runtime. The contract is framework-, transport-, vendor-, and repository-name-independent.

## Current contract

- [Public API v0.1](PUBLIC_API_V0_1.md) is the normative contract shipped by package version `0.1.0`.
- [Current API v0.1](CURRENT_API_V0_1.md) is the historical pre-hardening inventory and is not the current normative reference.

Public API version, serialized snapshot version, and package version are deliberately independent. The current values and evolution policy are defined in the public API reference.

## Documentation rule

Any change to public names, types, serialized snapshot shape, diagnostics, query behavior, versioning, package exports, capture contracts, or adapter obligations must update this directory in the same coherent change: **change the API, change `docs/API/`.** Planning documents and handoffs do not replace this reference.

## Authority

1. perceptual-interface standard and standardization charter;
2. documented serialized contracts and API semantics;
3. conformance/behavior tests;
4. package implementations;
5. transports and framework adapters.

No MCP, HTTP, WebSocket, extension, Electron IPC, browser, or vendor transport defines ICU semantics.
