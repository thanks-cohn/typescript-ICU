import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: {
    "@perceptual/core": fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
    "@perceptual/diagnostics": fileURLToPath(new URL("./packages/diagnostics/src/index.ts", import.meta.url)),
  } },
  test: { environment: "node" },
});
