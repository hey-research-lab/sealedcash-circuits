fn hash(v: [Field; 2]) -> Field {
    std::hash::poseidon2_permutation([v[0], v[1], 0, 0])[0]
}
fn h4(a: Field, b: Field, c: Field, d: Field) -> Field {
    hash([hash([a, b]), hash([c, d])])
}
fn h8(v: [Field; 8]) -> Field {
    hash([h4(v[0], v[1], v[2], v[3]), h4(v[4], v[5], v[6], v[7])])
}

fn merkle(leaf: Field, siblings: [Field; 32], bits: [bool; 32]) -> (Field, Field) {
    let mut node = leaf;
    let mut index: u64 = 0;
    for i in 0..32 {
        let bit: Field = if bits[i] { 1 } else { 0 };
        let left = if bits[i] { siblings[i] } else { node };
        let right = if bits[i] { node } else { siblings[i] };
        node = hash([left, right]);
        if bits[i] { index = index + (1u64 << (i as u64)); }
        assert(bit == (if bits[i] { 1 } else { 0 }));
    }
    (node, index as Field)
}

// Public values deliberately retain the exact 21-field order of the Circom
// circuit. The two-by-two private layout is unchanged.
fn main(
    chain_id: pub Field, pool: pub Field, domain: pub Field,
    protocol_version: pub Field, circuit_version: pub Field,
    operation: pub u8, root: pub Field, asset: pub Field,
    public_amount: pub Field, is_deposit: pub bool, recipient: pub Field,
    relayer: pub Field, relayer_fee: pub Field, input_count: pub u8,
    output_count: pub u8, public_nullifiers: pub [Field; 2],
    public_commitments: pub [Field; 2], public_cipher_hashes: pub [Field; 2],
    spending_secret: Field,
    input_enabled: [bool; 2], input_amount: [Field; 2],
    input_secret: [Field; 2], input_nonce: [Field; 2],
    input_diversifier: [Field; 2], input_path: [[Field; 32]; 2],
    input_path_bits: [[bool; 32]; 2],
    output_enabled: [bool; 2], output_amount: [Field; 2],
    output_secret: [Field; 2], output_nonce: [Field; 2],
    output_recipient_key: [Field; 2], output_diversifier: [Field; 2],
    output_cipher_hash: [Field; 2]
) {
    let owner_domain = h4(domain, protocol_version, chain_id, pool);
    let note_domain = h4(domain, protocol_version, circuit_version, chain_id);
    let nullifier_domain = h4(domain + 1, protocol_version, circuit_version, pool);
    let mut input_total: Field = 0;
    let mut output_total: Field = 0;
    let mut enabled_inputs: u8 = 0;
    let mut enabled_outputs: u8 = 0;
    for i in 0..2 {
        if input_enabled[i] { enabled_inputs = enabled_inputs + 1; }
        if output_enabled[i] { enabled_outputs = enabled_outputs + 1; }
        if !input_enabled[i] {
            assert(input_amount[i] == 0);
            assert(input_secret[i] == 0);
            assert(input_nonce[i] == 0);
            assert(input_diversifier[i] == 0);
        }
        if !output_enabled[i] {
            assert(output_amount[i] == 0);
            assert(output_secret[i] == 0);
            assert(output_nonce[i] == 0);
            assert(output_recipient_key[i] == 0);
            assert(output_diversifier[i] == 0);
            assert(output_cipher_hash[i] == 0);
            assert(public_commitments[i] == 0);
            assert(public_cipher_hashes[i] == 0);
        } else {
            assert(output_amount[i] != 0);
            assert(output_cipher_hash[i] == public_cipher_hashes[i]);
        }
        let owner = h4(owner_domain, spending_secret, input_diversifier[i], input_nonce[i]);
        let commitment = h8([note_domain, pool, asset, input_amount[i], owner,
            input_diversifier[i], input_nonce[i], input_secret[i]]);
        let (computed_root, index) = merkle(commitment, input_path[i], input_path_bits[i]);
        if input_enabled[i] {
            assert(computed_root == root);
            assert(h4(nullifier_domain, spending_secret, commitment, index) == public_nullifiers[i]);
        } else { assert(public_nullifiers[i] == 0); }
        let out_commitment = h8([note_domain, pool, asset, output_amount[i],
            output_recipient_key[i], output_diversifier[i], output_nonce[i], output_secret[i]]);
        if output_enabled[i] { assert(out_commitment == public_commitments[i]); }
        input_total = input_total + input_amount[i];
        output_total = output_total + output_amount[i];
    }
    assert(input_count == enabled_inputs);
    assert(output_count == enabled_outputs);
    assert(operation >= 1);
    assert(operation <= 3);
    assert(is_deposit == (operation == 1));
    assert(input_total + (if is_deposit { public_amount } else { 0 }) ==
        output_total + (if operation == 3 { public_amount } else { 0 }) + relayer_fee);
    if operation == 2 { assert(public_amount == 0); }
    if operation == 1 {
        assert(root == 0);
        assert(input_count == 0);
        assert(output_count == 1);
        assert(relayer_fee == 0);
        assert(recipient == 0);
    } else {
        assert(root != 0);
        assert(input_count != 0);
    }
    if operation == 3 { assert(recipient != 0); } else { assert(recipient == 0); }
    assert(relayer == relayer);
}