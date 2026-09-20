import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(new URL("..", import.meta.url).pathname);
const artifact = resolve(root, "build/sealedcash_privacy.json");
const manifest = resolve(root, "build/artifact-manifest.json");
await readFile(artifact);
await readFile(manifest);
const payload = JSON.stringify({
  schemaVersion: 1,
  package: "@sealedcash/circuits",
  source: "circuits/noir/src/main.nr",
  artifact: "build/sealedcash_privacy.json",
  manifest: "build/artifact-manifest.json"
}, null, 2);
const bytes = gzipSync(payload);
const digest = createHash("sha256").update(bytes).digest("hex");
const output = resolve(root, "release/sealedcash-circuits-release.json");
await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, `${JSON.stringify({ schemaVersion: 1, status: "review-required", sha256: digest, contents: JSON.parse(payload) }, null, 2)}\n`);
console.log(`Wrote review-required release metadata to ${output}`);