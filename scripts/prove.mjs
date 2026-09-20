import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Noir } from "@noir-lang/noir_js";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";

const root = resolve(new URL("..", import.meta.url).pathname);
const artifactPath = resolve(root, process.env.CIRCUIT_ARTIFACT ?? "build/sealedcash_privacy.json");
const inputPath = resolve(root, process.argv[2] ?? process.env.CIRCUIT_INPUT_FILE ?? "test/vectors/deposit.json");
const proofPath = resolve(root, process.argv[3] ?? process.env.CIRCUIT_PROOF_FILE ?? "build/deposit-proof.json");
const artifact = JSON.parse(await readFile(artifactPath));
const input = JSON.parse(await readFile(inputPath));
for (const key of ["input_path", "input_path_bits"]) {
  input[key] = input[key].map((row) => [...row, ...Array(32 - row.length).fill(key === "input_path" ? "0" : false)]);
}
const program = artifact.program ?? artifact;
const noir = new Noir(program);
const { witness } = await noir.execute(input);
const api = await Barretenberg.new();
try {
  const backend = new UltraHonkBackend(program.bytecode, api);
  const proof = await backend.generateProof(witness, { verifierTarget: "evm" });
  await mkdir(resolve(proofPath, ".."), { recursive: true });
  await writeFile(proofPath, `${JSON.stringify({
    proof: Buffer.from(proof.proof).toString("hex"),
    publicInputs: proof.publicInputs
  }, null, 2)}\n`);
  console.log(`Wrote proof to ${proofPath}`);
} finally {
  await api.destroy();
}