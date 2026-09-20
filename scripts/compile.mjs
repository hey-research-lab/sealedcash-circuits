import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compile, createFileManager } from "@noir-lang/noir_wasm";

const root = resolve(new URL("..", import.meta.url).pathname);
const circuit = resolve(root, "circuits/noir");
const outputDir = resolve(root, process.env.CIRCUIT_OUTPUT_DIR ?? "build");
await mkdir(outputDir, { recursive: true });
const artifact = await compile(createFileManager(circuit));
await writeFile(resolve(outputDir, "sealedcash_privacy.json"), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Compiled Noir ACIR to ${resolve(outputDir, "sealedcash_privacy.json")}`);