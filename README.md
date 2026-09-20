# SealedCash circuits

The `@sealedcash/circuits` repository contains the source-of-truth Noir circuit used by SealedCash privacy proofs and small, reproducible tools for compiling, proving, verifying, hashing, and packaging circuit artifacts.

This repository is an engineering component, not a deployment manifest. It does not contain network endpoints, deployed addresses, private keys, ceremony material, or production release hashes. A release is only useful after the resulting artifacts have been independently reviewed and published with their checksums.

Official organization: <https://github.com/sealedcash-org>  
Official repository: <https://github.com/sealedcash-org/sealedcash-circuits>  
Support: <mailto:support@sealedcash.com>

## Capability and status

**Status: experimental engineering release.** This repository can compile the current SealedCash Noir circuit, generate and verify local UltraHonk proofs, and create checksum metadata for review. It does not publish a verifier, deploy contracts, connect to a network, or authorize real funds. A generated artifact is not an audit or a production approval.

## What the circuit proves

The circuit preserves the SealedCash pool's fixed public-input order and two-input/two-output witness layout. It derives note commitments and nullifiers with domain-separated Poseidon2 operations, validates Merkle paths, enforces operation-specific accounting, and checks output ciphertext hashes. The circuit does not move funds, submit transactions, or select a chain.

The source is `circuits/noir/src/main.nr`. The included vector is deliberately synthetic and is suitable only for local development.

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer
- Noir-compatible tooling supplied by the pinned JavaScript packages

Install the pinned dependencies with:

```sh
npm ci
```

## Configuration

All variables are optional and point to local files only:

| Variable | Example placeholder | Purpose |
| --- | --- | --- |
| `CIRCUIT_OUTPUT_DIR` | `./build` | Directory for the compiled ACIR artifact |
| `CIRCUIT_INPUT_FILE` | `./test/vectors/deposit.json` | Synthetic witness input used by `prove` |
| `CIRCUIT_PROOF_FILE` | `./build/deposit-proof.json` | Local proof output path |
| `CIRCUIT_ARTIFACT` | `./build/sealedcash_privacy.json` | Compiled artifact consumed by proof tools |

Copy `.env.example` to `.env` when needed. Never place credentials, private keys, network endpoints, deployed addresses, or production checksums in it.

## Commands

```sh
npm run build
npm run prove -- test/vectors/deposit.json build/deposit-proof.json
npm run verify -- build/deposit-proof.json
npm run hash
npm run release:package
npm test
```

`prove` expects a compiled artifact. The CLI pads short Merkle arrays in local fixtures to the circuit's fixed 32-level shape; production callers should provide all 32 entries explicitly. `verify` checks an UltraHonk proof against the compiled program's EVM-targeted verification key.

## Artifact policy

Generated files belong under `build/` and `release/` and are ignored by Git. `hash-artifacts.mjs` writes a manifest containing SHA-256 checksums and relative paths. `package-release.mjs` creates review-required release metadata that points to the source, manifest, and circuit artifact. The package script refuses to label a release as production-ready and never adds deployment metadata.

## Security

Do not use the sample vector or locally generated artifacts with real funds. Report suspected vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) for changes and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.