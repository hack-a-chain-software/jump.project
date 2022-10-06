"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERESTED_CONTRACTS =
  exports.XTOKEN_CONTRACT =
  exports.NFT_STAKING_CONTRACT =
  exports.LAUNCHPAD_CONTRACT =
  exports.START_BLOCK =
  exports.S3_BUCKET =
    void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
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
