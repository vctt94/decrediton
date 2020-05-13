import { newAddressPubKeyHash } from "./addresses";

// STEcdsaSecp256k1 specifies that the signature is an ECDSA signature
// over the secp256k1 elliptic curve.
const STEcdsaSecp256k1 = 0;
const OP_DUP = 0x76; // 118
const OP_HASH160 = 0xa9; // 169
const OP_DATA_20 = 0x14; // 20
const OP_EQUALVERIFY = 0x88; // 136
const OP_CHECKSIG = 0xac; // 172

// extractPubKeyHash extracts the public key hash from the passed script if it
// is a standard pay-to-pubkey-hash script.  It will return nil otherwise.
const extractPubKeyHash = (script) => {
  // A pay-to-pubkey-hash script is of the form:
  //  OP_DUP OP_HASH160 <20-byte hash> OP_EQUALVERIFY OP_CHECKSIG
  if (
    script.length === 25 &&
    script[0] == OP_DUP &&
    script[1] == OP_HASH160 &&
    script[2] == OP_DATA_20 &&
    script[23] == OP_EQUALVERIFY &&
    script[24] == OP_CHECKSIG
  ) {
    return script.slice(3, 23);
  }

  return null;
};

// pubKeyHashToAddrs is a convenience function to attempt to convert the
// passed hash to a pay-to-pubkey-hash address housed within an address
// slice.  It is used to consolidate common code.

// return  []dcrutil.Address
const pubKeyHashToAddrs = (hash, params) => {
  // Skip the pubkey hash if it's invalid for some reason.
  const addr = newAddressPubKeyHash(hash, params, STEcdsaSecp256k1);
  if (addr.error) {
    return addr.error;
  }
  return addr;
};

const PubKeyHashTy = "pubkeyhash";
// ExtractPkScriptAddrs returns the type of script, addresses and required
// signatures associated with the passed PkScript.  Note that it only works for
// 'standard' transaction script types.  Any data such as public keys which are
// invalid are omitted from the results.
//
// NOTE: This function only attempts to identify version 0 scripts.  The return
// value will indicate a nonstandard script type for other script versions along
// with an invalid script version error.

// return (ScriptClass, []dcrutil.Address, int, error)
export const extractPkScriptAddrs = (version, pkScript, chainParams) => {
  if (version != 0) {
    return { error: "invalid script version" };
  }

  const hash = extractPubKeyHash(pkScript);
  // console.log(hash)
  // Check for pay-to-pubkey-hash script.
  if (hash) {
    return {
      scriptClass: PubKeyHashTy,
      address: pubKeyHashToAddrs(hash, chainParams),
      requiredSig: 1
    };
  }

  // // Check for pay-to-script-hash.
  // if hash := extractScriptHash(pkScript); hash != nil {
  // 	return ScriptHashTy, scriptHashToAddrs(hash, chainParams), 1, nil
  // }

  // // Check for pay-to-alt-pubkey-hash script.
  // if data, sigType := extractPubKeyHashAltDetails(pkScript); data != nil {
  // 	var addrs []dcrutil.Address
  // 	addr, err := dcrutil.NewAddressPubKeyHash(data, chainParams, sigType)
  // 	if err == nil {
  // 		addrs = append(addrs, addr)
  // 	}
  // 	return PubkeyHashAltTy, addrs, 1, nil
  // }

  // // Check for pay-to-pubkey script.
  // if data := extractPubKey(pkScript); data != nil {
  // 	var addrs []dcrutil.Address
  // 	pk, err := secp256k1.ParsePubKey(data)
  // 	if err == nil {
  // 		addr, err := dcrutil.NewAddressSecpPubKeyCompressed(pk, chainParams)
  // 		if err == nil {
  // 			addrs = append(addrs, addr)
  // 		}
  // 	}
  // 	return PubKeyTy, addrs, 1, nil
  // }

  // // Check for pay-to-alt-pubkey script.
  // if pk, sigType := extractPubKeyAltDetails(pkScript); pk != nil {
  // 	var addrs []dcrutil.Address
  // 	switch sigType {
  // 	case dcrec.STEd25519:
  // 		addr, err := dcrutil.NewAddressEdwardsPubKey(pk, chainParams)
  // 		if err == nil {
  // 			addrs = append(addrs, addr)
  // 		}

  // 	case dcrec.STSchnorrSecp256k1:
  // 		addr, err := dcrutil.NewAddressSecSchnorrPubKey(pk, chainParams)
  // 		if err == nil {
  // 			addrs = append(addrs, addr)
  // 		}
  // 	}

  // 	return PubkeyAltTy, addrs, 1, nil
  // }

  // // Check for multi-signature script.
  // details := extractMultisigScriptDetails(version, pkScript, true)
  // if details.valid {
  // 	// Convert the public keys while skipping any that are invalid.
  // 	addrs := make([]dcrutil.Address, 0, details.numPubKeys)
  // 	for i := 0; i < details.numPubKeys; i++ {
  // 		pubkey, err := secp256k1.ParsePubKey(details.pubKeys[i])
  // 		if err == nil {
  // 			addr, err := dcrutil.NewAddressSecpPubKeyCompressed(pubkey,
  // 				chainParams)
  // 			if err == nil {
  // 				addrs = append(addrs, addr)
  // 			}
  // 		}
  // 	}
  // 	return MultiSigTy, addrs, details.requiredSigs, nil
  // }

  // // Check for stake submission script.  Only stake-submission-tagged
  // // pay-to-pubkey-hash and pay-to-script-hash are allowed.
  // if hash := extractStakePubKeyHash(pkScript, OP_SSTX); hash != nil {
  // 	return StakeSubmissionTy, pubKeyHashToAddrs(hash, chainParams), 1, nil
  // }
  // if hash := extractStakeScriptHash(pkScript, OP_SSTX); hash != nil {
  // 	return StakeSubmissionTy, scriptHashToAddrs(hash, chainParams), 1, nil
  // }

  // // Check for stake generation script.  Only stake-generation-tagged
  // // pay-to-pubkey-hash and pay-to-script-hash are allowed.
  // if hash := extractStakePubKeyHash(pkScript, OP_SSGEN); hash != nil {
  // 	return StakeGenTy, pubKeyHashToAddrs(hash, chainParams), 1, nil
  // }
  // if hash := extractStakeScriptHash(pkScript, OP_SSGEN); hash != nil {
  // 	return StakeGenTy, scriptHashToAddrs(hash, chainParams), 1, nil
  // }

  // // Check for stake revocation script.  Only stake-revocation-tagged
  // // pay-to-pubkey-hash and pay-to-script-hash are allowed.
  // if hash := extractStakePubKeyHash(pkScript, OP_SSRTX); hash != nil {
  // 	return StakeRevocationTy, pubKeyHashToAddrs(hash, chainParams), 1, nil
  // }
  // if hash := extractStakeScriptHash(pkScript, OP_SSRTX); hash != nil {
  // 	return StakeRevocationTy, scriptHashToAddrs(hash, chainParams), 1, nil
  // }

  // // Check for stake change script.  Only stake-change-tagged
  // // pay-to-pubkey-hash and pay-to-script-hash are allowed.
  // if hash := extractStakePubKeyHash(pkScript, OP_SSTXCHANGE); hash != nil {
  // 	return StakeSubChangeTy, pubKeyHashToAddrs(hash, chainParams), 1, nil
  // }
  // if hash := extractStakeScriptHash(pkScript, OP_SSTXCHANGE); hash != nil {
  // 	return StakeSubChangeTy, scriptHashToAddrs(hash, chainParams), 1, nil
  // }

  // // Check for null data script.
  // if isNullDataScript(version, pkScript) {
  // 	// Null data transactions have no addresses or required signatures.
  // 	return NullDataTy, nil, 0, nil
  // }

  // // Don't attempt to extract addresses or required signatures for nonstandard
  // // transactions.
  // return NonStandardTy, nil, 0, nil
};
