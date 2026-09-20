import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";

const root = resolve(new URL("..", import.meta.url).pathname);
const artifact = JSON.parse(await readFile(resolve(root, process.env.CIRCUIT_ARTIFACT ?? "build/sealedcash_privacy.json")));
const proof = JSON.parse(await readFile(resolve(root, process.argv[2] ?? "build/deposit-proof.json")));
const api = await Barretenberg.new();
try {
  const program = artifact.program ?? artifact;
  const backend = new UltraHonkBackend(program.bytecode, api);
  const valid = await backend.verifyProof({
    proof: Uint8Array.from(Buffer.from(proof.proof, "hex")),
    publicInputs: proof.publicInputs,
    verificationKey: await backend.getVerificationKey({ verifierTarget: "evm" })
  }, { verifierTarget: "evm" });
  if (!valid) throw new Error("UltraHonk proof verification failed");
  console.log("UltraHonk proof verified");
} finally {
  await api.destroy();
}