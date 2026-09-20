## Summary

Describe the change and why it is needed.

## Validation

- [ ] `pnpm test`
- [ ] `pnpm build` (when circuit or compiler inputs changed)
- [ ] Proof generation and verification checked (when proof tooling changed)

## Safety checklist

- [ ] No credentials, private keys, private witness data, production endpoints, or deployment metadata are included.
- [ ] Public-input order and witness shapes remain compatible, or the compatibility impact is documented.
- [ ] Synthetic vectors and documentation are updated as needed.