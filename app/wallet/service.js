import Promise from "promise";
import * as client from "middleware/grpc/client";
import { reverseHash, strHashToRaw, rawToHex } from "../helpers/byteActions";
import { extractPkScriptAddrs } from "helpers/scripts";
import { Uint64LE } from "int64-buffer";
import { CommittedTicketsRequest } from "middleware/walletrpc/api_pb";
import { withLog as log, withLogNoData, logOptionNoResponseData } from "./index";
import * as api from "middleware/walletrpc/api_pb";
import {
  TRANSACTION_DIR_SENT, TRANSACTION_DIR_RECEIVED, TRANSACTION_DIR_TRANSFERRED
} from "constants/Decrediton";
import { _blake256 } from "helpers";

const promisify = fn => (...args) => new Promise((ok, fail) => fn(...args,
  (res, err) => err ? fail(err) : ok(res)));

export const getWalletService = promisify(client.getWalletService);
export const getTicketBuyerService = promisify(client.getTicketBuyerV2Service);
export const getVotingService = promisify(client.getVotingService);
export const getAgendaService = promisify(client.getAgendaService);
export const getSeedService = promisify(client.getSeedService);
export const getAccountMixerService = promisify(client.getAccountMixerService);

export const getNextAddress = log((walletService, accountNum, kind) =>
  new Promise((resolve, reject) => {
    const request = new api.NextAddressRequest();
    request.setAccount(accountNum);
    request.setKind(kind ? kind : 0);
    request.setGapPolicy(api.NextAddressRequest.GapPolicy.GAP_POLICY_WRAP);
    walletService
      .nextAddress(request, (error, response) => error ? reject(error) : resolve(response));
  })
    .then(response => ({
      ...response,
      publicKey: response.getPublicKey(),
      address: response.getAddress()
    })), "Get Next Address", logOptionNoResponseData());

export const validateAddress = withLogNoData((walletService, address) =>
  new Promise((resolve, reject) => {
    const request = new api.ValidateAddressRequest();
    request.setAddress(address);
    walletService.validateAddress(request, (error, response) => error ? reject(error) : resolve(response));
  }), "Validate Address");

export const decodeTransactionLocal = (rawTx) => {
  var buffer = Buffer.isBuffer(rawTx) ? rawTx : Buffer.from(rawTx, "hex");
  return Promise.resolve(decodeRawTransaction(buffer));
};

// UNMINED_BLOCK_TEMPLATE is a helper const that defines what an unmined block
// looks like (null timestamp, height == -1, etc).
const UNMINED_BLOCK_TEMPLATE = {
  getTimestamp() { return null; },
  getHeight() { return -1; },
  getHash() { return null; }
};

// TODO move these to constants
export const TRANSACTION_TYPE_REGULAR = "Regular";
export const TRANSACTION_TYPE_TICKET_PURCHASE = "Ticket";
export const TRANSACTION_TYPE_VOTE = "Vote";
export const TRANSACTION_TYPE_REVOCATION = "Revocation";
export const TRANSACTION_TYPE_COINBASE = "Coinbase";

// Map from numerical into string transaction type
export const TRANSACTION_TYPES = {
  [api.TransactionDetails.TransactionType.REGULAR]: TRANSACTION_TYPE_REGULAR,
  [api.TransactionDetails.TransactionType.TICKET_PURCHASE]: TRANSACTION_TYPE_TICKET_PURCHASE,
  [api.TransactionDetails.TransactionType.VOTE]: TRANSACTION_TYPE_VOTE,
  [api.TransactionDetails.TransactionType.REVOCATION]: TRANSACTION_TYPE_REVOCATION,
  [api.TransactionDetails.TransactionType.COINBASE]: TRANSACTION_TYPE_COINBASE
};

const StakeTxType = [
  api.TransactionDetails.TransactionType.VOTE,
  api.TransactionDetails.TransactionType.REVOCATION,
  api.TransactionDetails.TransactionType.TICKET_PURCHASE
];

// formatTransaction converts a transaction from the structure of a grpc reply
// into a structure more amenable to use within decrediton. If dec
export function formatTransaction(block, transaction, index) {
  // isStakeTx gets a transaction type and return true if it is a stake tx, false otherwise.
  // @param {int} type.
  const isStakeTx = (type) => StakeTxType.indexOf(type) > -1;

  const inputAmounts = transaction.getDebitsList().reduce((s, input) => s + input.getPreviousAmount(), 0);
  const outputAmounts = transaction.getCreditsList().reduce((s, input) => s + input.getAmount(), 0);
  const amount = outputAmounts - inputAmounts;
  const fee = transaction.getFee();
  const type = transaction.getTransactionType();
  const txType = TRANSACTION_TYPES[type];
  let direction;

  let debitAccounts = [];
  transaction.getDebitsList().forEach((debit) => debitAccounts.push(debit.getPreviousAccount()));

  let creditAddresses = [];
  transaction.getCreditsList().forEach((credit) => creditAddresses.push(credit.getAddress()));

  const isStake = isStakeTx(type);

  if (!isStake) {
    if (amount > 0) {
      direction = TRANSACTION_DIR_RECEIVED;
    } else if (amount < 0 && (fee == Math.abs(amount))) {
      direction = TRANSACTION_DIR_TRANSFERRED;
    } else {
      direction = TRANSACTION_DIR_SENT;
    }
  }

  return {
    txTimestamp: block.getTimestamp(),
    height: block.getHeight(),
    blockHash: block.getHash(),
    index: index,
    hash: transaction.getHash(),
    txHash: reverseHash(Buffer.from(transaction.getHash()).toString("hex")),
    tx: transaction,
    txType,
    debitsAmount: inputAmounts,
    creditsAmount: outputAmounts,
    type,
    amount,
    fee,
    debitAccounts,
    creditAddresses,
    isStake,
    rawTx: Buffer.from(transaction.getTransaction()).toString("hex"),
    direction
  };
}

export function formatUnminedTransaction(transaction, index) {
  return formatTransaction(UNMINED_BLOCK_TEMPLATE, transaction, index);
}

export const streamGetTransactions = withLogNoData((
  walletService, startBlockHeight, endBlockHeight, targetTransactionCount, dataCb
) => new Promise((resolve, reject) => {
  var request = new api.GetTransactionsRequest();
  request.setStartingBlockHeight(startBlockHeight);
  request.setEndingBlockHeight(endBlockHeight);
  request.setTargetTransactionCount(targetTransactionCount);

  let getTx = walletService.getTransactions(request);
  getTx.on("data", (response) => {
    var foundMined = [];
    var foundUnmined = [];

    let minedBlock = response.getMinedTransactions();
    if (minedBlock) {
      foundMined = minedBlock
        .getTransactionsList()
        .map((v, i) => formatTransaction(minedBlock, v, i));
    }

    let unmined = response.getUnminedTransactionsList();
    if (unmined) {
      foundUnmined = unmined
        .map((v, i) => formatUnminedTransaction(v, i));
    }

    dataCb(foundMined, foundUnmined);
  });
  getTx.on("end", () => {
    resolve();
  });
  getTx.on("error", (err) => {
    reject(err);
  });
}), "Get Transactions");

export const getTransactions = (
  walletService, startBlockHeight, endBlockHeight, targetTransactionCount
) => new Promise((resolve, reject) => {
  var mined = [];
  var unmined = [];

  const dataCb = (foundMined, foundUnmined) => {
    mined = mined.concat(foundMined);
    unmined = unmined.concat(foundUnmined);
  };

  streamGetTransactions(
    walletService, startBlockHeight, endBlockHeight, targetTransactionCount, dataCb
  )
    .then(() => resolve({ mined, unmined }))
    .catch(reject);
});

export const getTransaction = (walletService, txHash) =>
  new Promise((resolve, reject) => {
    var request = new api.GetTransactionRequest();
    request.setTransactionHash(strHashToRaw(txHash));
    walletService.getTransaction(request, (err, resp) => {
      if (err) {
        reject(err);
        return;
      }

      // wallet.GetTransaction doesn't return block height/timestamp information
      const block = {
        getHash: resp.getBlockHash,
        getHeight: () => -1,
        getTimestamp: () => -1
      };
      const index = -1; // wallet.GetTransaction doesn't return the index
      const tx = formatTransaction(block, resp.getTransaction(), index);
      resolve(tx);
    });
  });


export const publishUnminedTransactions = log((walletService) => new Promise((resolve, reject) => {
  const req = new api.PublishUnminedTransactionsRequest();
  walletService.publishUnminedTransactions(req, (err) => err ? reject(err) : resolve());
}), "Publish Unmined Transactions");

export const committedTickets = withLogNoData((walletService, ticketHashes) => new Promise((resolve, reject) => {
  const req = new CommittedTicketsRequest();
  req.setTicketsList(ticketHashes);
  walletService.committedTickets(req, (err, tickets) => err ? reject(err) : resolve(tickets));
}), "Committed Tickets");

export const decodeRawTransaction = (rawTx, chainParams) => {
  // console.log(rawTx.toString("hex"))
  if (!(rawTx instanceof Buffer)) {
    throw new Error("rawtx requested for decoding is not a Buffer object");
  }
  if (!chainParams) {
    throw new Error("chainParams can not be undefined");
  }
  var position = 0;

  var tx = {};
  tx.version = rawTx.readUInt32LE(position);
  position += 4;
  var first = rawTx.readUInt8(position);
  position += 1;
  switch (first) {
  case 0xFD:
    tx.numInputs = rawTx.readUInt16LE(position);
    position += 2;
    break;
  case 0xFE:
    tx.numInputs = rawTx.readUInt32LE(position);
    position += 4;
    break;
  default:
    tx.numInputs = first;
  }
  tx.inputs = [];
  for (var i = 0; i < tx.numInputs; i++) {
    var input = {};
    input.opRawHash = rawTx.slice(position, position + 32);
    input.prevTxId = reverseHash(rawToHex(input.opRawHash));
    position += 32;
    input.outputIndex = rawTx.readUInt32LE(position);
    position += 4;
    input.outputTree = rawTx.readUInt8(position);
    position += 1;
    input.sequence = rawTx.readUInt32LE(position);
    position += 4;
    tx.inputs.push(input);
  }

  first = rawTx.readUInt8(position);
  position += 1;
  switch (first) {
  case 0xFD:
    tx.numOutputs = rawTx.readUInt16LE(position);
    position += 2;
    break;
  case 0xFE:
    tx.numOutputs = rawTx.readUInt32LE(position);
    position += 4;
    break;
  default:
    tx.numOutputs = first;
  }

  tx.outputs = [];
  for (var j = 0; j < tx.numOutputs; j++) {
    var output = {};
    output.value = Uint64LE(rawTx.slice(position, position + 8)).toNumber();
    position += 8;
    output.version = rawTx.readUInt16LE(position);
    position += 2;
    // check length of scripts
    var scriptLen;
    first = rawTx.readUInt8(position);
    position += 1;
    switch (first) {
    case 0xFD:
      scriptLen = rawTx.readUInt16LE(position);
      position += 2;
      break;
    case 0xFE:
      scriptLen = rawTx.readUInt32LE(position);
      position += 4;
      break;
    default:
      scriptLen = first;
    }
    output.script = rawTx.slice(position, position + scriptLen);
    const decodedScript = extractPkScriptAddrs(output.version, output.script, chainParams);
    output.addresses ? output.addresses.push(decodedScript) : output.addresses = [ decodedScript ];

    position += scriptLen;
    tx.outputs.push(output);
  }

  tx.lockTime = rawTx.readUInt32LE(position);
  position += 4;
  tx.expiry = rawTx.readUInt32LE(position);
  position += 4;

  return tx;
};

// selializeNoWitnessEncode gets a decoded tx and serialize it.
// it returns the hash of the tx.

// code based at the method btc.Encode from dcrd.
// source: https://github.com/decred/dcrd/blob/b60c60ffe98bcea5becc4e9e4d2a4fe6152401f6/wire/msgtx.go
export const selializeNoWitnessEncode = (decodedTx) => {
  const { inputs, outputs } = decodedTx;
  const neededSize = calculateSerializeSize(decodedTx);
  let rawEncodedTx = new Uint8Array(neededSize);
  let position = 0;
  const version = decodedTx.version | 1 << 16;
  rawEncodedTx.set(putUint32(version), position);
  position += 4;
  const inputCount = inputs.length;
  let { value, n } = writeVarInt(inputCount);
  rawEncodedTx.set(value, position);
  position += n;

  inputs.forEach(input => {
    position = writeTxInPrefix(input, rawEncodedTx, position);
  });

  const outputCount = outputs.length;
  const newValues = writeVarInt(outputCount);
  value = newValues.value;
  n = newValues.n;
  rawEncodedTx.set(value, position);
  position += n;

  outputs.forEach( output => {
    position = writeTxOut(output, rawEncodedTx, position);
  });

  rawEncodedTx.set(putUint32(decodedTx.lockTime), position);
  position += 4;
  rawEncodedTx.set(putUint32(decodedTx.expiry), position);


  const checksum = _blake256(Buffer.from(rawEncodedTx));
  return reverseHash(rawToHex(checksum));
};

function calculateSerializeSize(decodedTx) {
  const { inputs, outputs } = decodedTx;
  // Version 4 bytes + LockTime 4 bytes + Expiry 4 bytes +
  // Serialized varint size for the number of transaction
  // inputs and outputs.
  let n = 12 + VarIntSerializeSize(inputs.length) +
    VarIntSerializeSize(outputs.length);

  inputs.forEach(() => {
    n += serializeSizePrefix();
  });

  outputs.forEach(o => {
    n += serializeSize(o);
  });

  return n;
}
// PutUint8 copies the provided uint8 into a buffer from the free list and
// writes the resulting byte to the given writer.
function putUint8 (data) {
  const arr8 = new Uint8Array(1);
  arr8[0] = data & 0xff;

  return arr8;
}

// PutUint16 serializes the provided uint16 using the given byte order into a
// buffer from the free list and writes the resulting two bytes to the given
// writer.
function putUint16 (data) {
  const arr8 = new Uint8Array(2);
  arr8[0] = data & 0xff;
  arr8[1] = data >> 8 & 0xff;

  return arr8;
}

// putUint32 serializes the provided uint32 using the given byte order into a
// buffer.
function putUint32(data) {
  const arr8 = new Uint8Array(4);
  arr8[0] = data & 0xff;
  arr8[1] = data >> 8 & 0xff;
  arr8[2] = data >> 16 & 0xff;
  arr8[3] = data >> 24 & 0xff;

  return arr8;
}

// PutUint64 serializes the provided uint64 using the given byte order into a
// buffer from the free list and writes the resulting eight bytes to the given
// writer.
function putUint64(data) {
  // javascript can only shift operate 32 bits, therefore we need to break
  // the value in 2 half.
  const arr8 = new Uint8Array(8);
  let binaryData = data.toString(2);
  // complete with 0 until we have 64 bits.
  binaryData = "0".repeat(64 - binaryData.length) + binaryData;

  // get first half of bits.
  const leftBits = binaryData.substring(0, 32);
  const x = parseInt(leftBits, 2);

  arr8[0] = data & 0xff;
  arr8[1] = data >> 8 & 0xff;
  arr8[2] = data >> 16 & 0xff;
  arr8[3] = data >> 24 & 0xff;
  arr8[4] = x >> 32 & 0xff;
  arr8[5] = x >> 40 & 0xff;
  arr8[6] = x >> 48 & 0xff;
  arr8[7] = x >> 56 & 0xff;

  return arr8;
}

const MaxUint16 = 1<<16 - 1;
const MaxUint32 = 1<<32 - 1;

// writeVarInt serializes val to w using a variable number of bytes depending
// on its value.
function writeVarInt(val) {
  if (val < 0xfd) {
    return { value: putUint8(val), n: 1 };
  }

  if (val <= MaxUint16) {
    putUint8(0xfd);
    return { value: putUint16(val), n: 2 + 1 };
  }

  if (val <= MaxUint32) {
    putUint8(0xfe);
    return { value: putUint32(val), n: 4 + 1 };
  }
  putUint8(0xff);
  return { value: putUint64(val), n: 8 + 1 };
}

// VarIntSerializeSize returns the number of bytes it would take to serialize
// val as a variable length integer.
function VarIntSerializeSize(val) {
  // The value is small enough to be represented by itself, so it's
  // just 1 byte.
  if (val < 0xfd) {
    return 1;
  }

  // Discriminant 1 byte plus 2 bytes for the uint16.
  if (val <= MaxUint16) {
    return 3;
  }

  // Discriminant 1 byte plus 4 bytes for the uint32.
  if (val <= MaxUint32) {
    return 5;
  }

  // Discriminant 1 byte plus 8 bytes for the uint64.
  return 9;
}

// SerializeSizePrefix returns the number of bytes it would take to serialize
// the transaction input for a prefix.
function serializeSizePrefix() {
  // Outpoint Hash 32 bytes + Outpoint Index 4 bytes + Outpoint Tree 1 byte +
  // Sequence 4 bytes.
  return 41;
}

// serializeSize returns the number of bytes it would take to serialize the
// the transaction output.
function serializeSize(output) {
  // Value 8 bytes + Version 2 bytes + serialized varint size for
  // the length of PkScript + PkScript bytes.
  return 8 + 2 + VarIntSerializeSize(output.script.length) + output.script.length;
}

// writeOutPoint encodes op to the Decred protocol encoding for an OutPoint
// to w.
function writeOutPoint(input, arr8, position) {
  arr8.set(input.opRawHash, position);
  position += input.opRawHash.length;
  arr8.set(putUint32(input.outputIndex), position);
  position += 4;
  arr8.set(putUint8(input.outputTree), position);
  return (position + 1);
}

// writeTxInPrefixs encodes ti to the Decred protocol encoding for a transaction
// input (TxIn) prefix to w.
function writeTxInPrefix(input, arr8, position) {
  position = writeOutPoint(input, arr8, position);
  arr8.set(putUint32(input.sequence), position);
  return (position + 4);
}

// writeTxOut encodes to into the Decred protocol encoding for a transaction
// output (TxOut) to w.
function writeTxOut(output, arr8, position) {
  arr8.set(putUint64(output.value), position);
  position += 8;

  arr8.set(putUint16(output.version), position);
  position += 2;

  const { n, value } = writeVarInt(output.script.length);

  arr8.set(value, position);
  position += n;

  arr8.set(output.script, position);
  return (position + output.script.length);
}
