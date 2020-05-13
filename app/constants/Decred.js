export const MAX_POSSIBLE_FEE_INPUT = 0.1;

export const MIN_RELAY_FEE = 0.0001;

// Constants copied from dcrd/chaincfg/params.go

export const TestNetParams = {
  TicketMaturity: 16,
  TicketExpiry: 6144, // 6*TicketPoolSize
  CoinbaseMaturity: 16,
  SStxChangeMaturity: 1,
  GenesisTimestamp: 1489550400,
  TargetTimePerBlock: 2 * 60, // in seconds
  WorkDiffWindowSize: 144,

  // no way to know which one the wallet is using right now, so we record both
  // types for the moment.
  LegacyHDCoinType: 11,
  HDCoinType: 1,

  TreasuryAddress: "TcrypGAcGCRVXrES7hWqVZb5oLJKCZEtoL1",
  trezorCoinName: "Decred Testnet",

  // Address encoding magics
  NetworkAddressPrefix: "T",
  PubKeyAddrID: Buffer.from([0x28, 0xf7]), // starts with Tk
  PubKeyHashAddrID: Buffer.from([0x0f, 0x21]), // starts with Ts
  PKHEdwardsAddrID: [0x0f, 0x01], // starts with Te
  PKHSchnorrAddrID: [0x0e, 0xe3] // starts with TS
};

export const MainNetParams = {
  TicketMaturity: 256,
  TicketExpiry: 40960, // 5*TicketPoolSize
  CoinbaseMaturity: 256,
  SStxChangeMaturity: 1,
  GenesisTimestamp: 1454954400,
  TargetTimePerBlock: 5 * 60, // in seconds
  WorkDiffWindowSize: 144,

  // no way to know which one the wallet is using right now, so we record both
  // types for the moment.
  LegacyHDCoinType: 20,
  HDCoinType: 42,

  TreasuryAddress: "Dcur2mcGjmENx4DhNqDctW5wJCVyT3Qeqkx",
  trezorCoinName: "Decred",

  // Address encoding magics
  NetworkAddressPrefix: "D",
  PubKeyAddrID: [0x13, 0x86], // starts with Dk
  PubKeyHashAddrID: [0x07, 0x3f], // starts with Ds
  PKHEdwardsAddrID: [0x07, 0x1f], // starts with De
  PKHSchnorrAddrID: [0x07, 0x01] // starts with DS
};

// MAX_DCR_AMOUNT represents the maximum decred amount in atoms.
export const MAX_DCR_AMOUNT = 21e14;

// UNIT_DIVISOR represents the minimum value one decred can have in atoms.
export const UNIT_DIVISOR = 100000000;

// STEcdsaSecp256k1 specifies that the signature is an ECDSA signature
// over the secp256k1 elliptic curve.
export const STEcdsaSecp256k1 = 0;

// STEd25519 specifies that the signature is an ECDSA signature over the
// edwards25519 twisted Edwards curve.
export const STEd25519 = 1;

// STSchnorrSecp256k1 specifies that the signature is a Schnorr
// signature over the secp256k1 elliptic curve.
export const STSchnorrSecp256k1 = 2;

// ripemd160Size is the size of the RIPEMD-160 hash algorithm checksum in bytes.
export const ripemd160Size = 20;
