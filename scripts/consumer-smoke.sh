#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cd "$root"
npm run build
mkdir "$tmp/tarballs"
for package in core diagnostics agent; do npm pack "./packages/$package" --pack-destination "$tmp/tarballs" >/dev/null; done
mkdir "$tmp/consumer" && cd "$tmp/consumer"
npm init -y >/dev/null
npm install "$tmp"/tarballs/*.tgz >/dev/null
cat > index.mjs <<'JS'
import { SurfaceRegistry } from "@perceptual/core";
import { diagnose } from "@perceptual/diagnostics";
import { createQueryApi } from "@perceptual/agent";
const registry = new SurfaceRegistry();
registry.register({ id: "parent", concept: "panel", geometry: { pixelBounds: { x: 0, y: 0, width: 100, height: 100 }, viewportBounds: { x: 0, y: 0, width: 1, height: 1 } } });
registry.register({ id: "child", concept: "button", parentId: "parent", geometry: { pixelBounds: { x: 90, y: 10, width: 34, height: 20 }, viewportBounds: { x: .9, y: .1, width: .34, height: .2 } }, visibility: { visible: true, clipped: false } });
const provider = { snapshot: () => ({ version: "0.1", timestamp: 0, viewport: { width: 100, height: 100 }, surfaces: registry.list() }) };
const api = createQueryApi(provider, { diagnose });
if (api.describe().apiVersion !== "0.1") throw new Error("discovery failed");
const overflow = api.validate().find(({ type }) => type === "outside-parent-bounds");
if (overflow?.data?.overflowRight !== 24) throw new Error("diagnostic failed");
console.log("plain JavaScript consumer passed");
JS
node index.mjs
