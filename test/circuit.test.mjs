import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);

test("synthetic deposit vector has the fixed witness shape", async () => {
  const vector = JSON.parse(await readFile(resolve(root, "test/vectors/deposit.json")));
  assert.equal(vector.operation, 1);
  assert.equal(vector.input_path.length, 2);
  assert.equal(vector.input_path_bits.length, 2);
  assert.equal(vector.output_enabled[0], true);
  assert.equal(vector.output_enabled[1], false);
});

test("circuit source preserves the public operation invariants", async () => {
  const source = await readFile(resolve(root, "circuits/noir/src/main.nr"), "utf8");
  assert.match(source, /assert\(operation >= 1\)/);
  assert.match(source, /assert\(operation <= 3\)/);
  assert.match(source, /assert\(input_total/);
  assert.match(source, /poseidon2_permutation/);
});