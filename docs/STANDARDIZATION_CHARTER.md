# Standardization Charter

## Purpose

This project is intended to explore a new software convention for the era of software agents:

> Interfaces should expose a machine-observable description of the human-visible experience.

The ambition is broad adoption, but the engineering discipline must remain conservative.

## What should become standard

A project should be able to expose, in a framework-independent form:

- semantic surface identity,
- conceptual role,
- state,
- geometry,
- visibility,
- relationships,
- expected perceptual behavior,
- observed perceptual evidence,
- diagnostics,
- and optional capture hooks.

## Standardization principles

### Small core

The required core should remain small enough that ordinary projects can adopt it without architectural commitment.

### Progressive disclosure

The runtime should work automatically, then allow richer annotations where useful.

### Vendor neutrality

No browser, model provider, agent framework, UI framework, cloud provider, or transport should own the standard.

### Human-visible truth matters

DOM state, component state, scene state, and screenshots are evidence. None alone is the whole truth.

### Meaning outlives implementation

A concept such as `lightbox`, `file-explorer`, or `camera` should survive framework rewrites.

### Transport independence

MCP may become an important adapter, but the standard is the schema and behavior, not MCP itself.

### Evidence over confidence theater

Diagnostics should say what was measured and what was inferred.

## Compatibility goal

The eventual runtime should be usable from:

- JavaScript,
- TypeScript,
- plain HTML,
- common UI frameworks,
- canvas,
- WebGL/WebGPU,
- Electron/native bridges.

The first implementation is browser-first, not browser-only.
