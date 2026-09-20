import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const files = process.argv.slice(2);
const selected = files.length ? files : ["build/sealedcash_privacy.json"];
const artifacts = {};
for (const file of selected) {
  const contents = await readFile(resolve(root, file));
  artifacts[file] = { sha256: createHash("sha256").update(contents).digest("hex") };
}
const output = resolve(root, "build/artifact-manifest.json");
await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, `${JSON.stringify({ schemaVersion: 1, artifacts }, null, 2)}\n`);
console.log(`Wrote artifact manifest to ${output}`);