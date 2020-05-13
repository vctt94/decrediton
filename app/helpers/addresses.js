import {
  TESTNET, MAINNET, STEcdsaSecp256k1, STEd25519, STSchnorrSecp256k1, ripemd160Size
} from "constants";
const bs58 = require("bs58");

let createBlakeHash;
if (process.env.NODE_ENV === "test") {
  // Node 10.x errors when trying to import the native blake-hash during unit
  // test. As far as I (matheusd) can see, this only happens during test, and
  // isn't triggered in runtime, even if the native module does run. So for the
  // moment, I'm resorting to running the js version during tests. Ideally, this
  // needs to be solved in the upstream blake-hash so that we can also use the
  // native version in tests.
  createBlakeHash = require("blake-hash/js");
} else {
  createBlakeHash = require("blake-hash");
}
const bs58checkBase = require("bs58check/base");

export const ERR_INVALID_ADDR_EMPTY = "ERR_INVALID_ADDR_EMPTY";
export const ERR_INVALID_ADDR_TOOSHORT = "ERR_INVALID_ADDR_TOOSHORT";
export const ERR_INVALID_ADDR_TOOLONG = "ERR_INVALID_ADDR_TOOLONG";
export const ERR_INVALID_ADDR_NETWORKPREFIX = "ERR_INVALID_ADDR_NETWORKPREFIX";
export const ERR_INVALID_ADDR_CHECKSUM = "ERR_INVALID_ADDR_CHECKSUM";

// isValidAddress performs a simple set of validations for a given address in
// the given network (either testnet or mainnet).
//
// Returns an error identifier or null if the address is valid.
//
// Validations Performed:
// 1) Length - Too short, too long, or empty
// 2) Network - Either mainnet or testnet
// 3) Checksum - https://github.com/bitcoinjs/bs58check/blob/master/test/base.js

// _blake256x2 gets a buffer and calculate its checksum twice with blake256.
const _blake256x2 = (buffer) => _blake256(_blake256(buffer));

export const _blake256 = (buffer) => createBlakeHash("blake256").update(buffer).digest();

export function isValidAddress(addr, network) {
  if (!addr || !addr.trim().length) return ERR_INVALID_ADDR_EMPTY;
  if (addr.length < 25) return ERR_INVALID_ADDR_TOOSHORT;
  if (addr.length > 36) return ERR_INVALID_ADDR_TOOLONG;

  if (network === TESTNET && addr[0] !== "T")
    return ERR_INVALID_ADDR_NETWORKPREFIX;
  if (network === MAINNET && addr[0] !== "D")
    return ERR_INVALID_ADDR_NETWORKPREFIX;

  try {
    const bs58check = bs58checkBase(_blake256x2);
    bs58check.decode(addr, _blake256x2);
  } catch (error) {
    return ERR_INVALID_ADDR_CHECKSUM;
  }

  return null;
}

const ERR_INVALID_MASTER_PUB_KEY = "ERR_INVALID_MASTER_PUB_KEY";
const ERR_INVALID_MASTERPUB_CHECKSUM = "ERR_INVALID_MASTERPUB_CHECKSUM";

export function isValidMasterPubKey(masterPubKey) {
  if (!masterPubKey || !masterPubKey.trim().length)
    return ERR_INVALID_MASTER_PUB_KEY;
  try {
    const bs58check = bs58checkBase(_blake256x2);
    bs58check.decode(masterPubKey, _blake256x2);
  } catch (error) {
    return ERR_INVALID_MASTERPUB_CHECKSUM;
  }

  return null;
}

// checksum returns the first four bytes of BLAKE256(BLAKE256(input)).
const checksum = (input) => {
  const calculatedChecksum = _blake256x2(input);
  return calculatedChecksum.slice(0, 4);
};

// checkEncode prepends two version bytes and appends a four byte checksum.
const checkEncode = (input, version) => {
  let b = Buffer.from(version);
  b = Buffer.concat([ b, input ]);
  const calculatedChecksum = checksum(b);
  b = Buffer.concat([ b, calculatedChecksum ]);

  return bs58.encode(b);
};


// NewAddressPubKeyHash returns a new AddressPubKeyHash.  pkHash must
// be 20 bytes.

// return (*AddressPubKeyHash, error)
export function newAddressPubKeyHash(pkHash, net, algo) {
  // Ensure the provided signature algo is supported.
  let addrID;
  switch (algo) {
  case STEcdsaSecp256k1:
    addrID = net.PubKeyHashAddrID;
    break;
  case STEd25519:
    addrID = net.PKHEdwardsAddrID;
    break;
  case STSchnorrSecp256k1:
    addrID = net.PKHSchnorrAddrID;
    break;
  default:
    return { error: "unknown signature algorithm" };
  }

  // Ensure the provided pubkey hash length is valid.
  if (pkHash.length !== ripemd160Size) {
    return { error: "pkHash must be 20 bytes" };
  }
  const addr = { netID: addrID, dsa: algo };
  addr.hash = pkHash;

  // base58.CheckEncode(hash160[:ripemd160.Size], netID
  return checkEncode(pkHash.slice(0, 20), addrID);
}

