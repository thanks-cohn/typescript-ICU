import { observe } from "@perceptual/browser";

// One-line, zero-config discovery. Inspect runtime.snapshot() from an agent transport.
globalThis.runtime = observe();
