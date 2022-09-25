"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERESTED_CONTRACTS =
  exports.XTOKEN_CONTRACT =
  exports.NFT_STAKING_CONTRACT =
  exports.LAUNCHPAD_CONTRACT =
  exports.START_BLOCK =
  exports.S3_BUCKET =
  exports.DB_PORT =
  exports.DB_HOST =
  exports.DB_PASS =
  exports.DB_USER =
  exports.DB_NAME =
    void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
if (
  [
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    process.env.DB_HOST,
    process.env.DB_PORT,
    process.env.NETWORK,
    process.env.START_BLOCK,
    process.env.LAUNCHPAD_CONTRACT,
    process.env.NFT_STAKING_CONTRACT,
    process.env.XTOKEN_CONTRACT,
  ].includes(undefined)
)
  throw "ERROR: Undefined envs";
exports.DB_NAME = process.env.DB_NAME;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASS = process.env.DB_PASS;
exports.DB_HOST = process.env.DB_HOST;
exports.DB_PORT = parseInt(process.env.DB_PORT);
exports.S3_BUCKET =
  process.env.NETWORK === "mainnet"
    ? "near-lake-data-mainnet"
    : "near-lake-data-testnet";
exports.START_BLOCK = parseInt(process.env.START_BLOCK);
exports.LAUNCHPAD_CONTRACT = process.env.LAUNCHPAD_CONTRACT;
exports.NFT_STAKING_CONTRACT = process.env.NFT_STAKING_CONTRACT;
exports.XTOKEN_CONTRACT = process.env.XTOKEN_CONTRACT;
exports.INTERESTED_CONTRACTS = [
  exports.LAUNCHPAD_CONTRACT,
  exports.NFT_STAKING_CONTRACT,
  exports.XTOKEN_CONTRACT,
];
