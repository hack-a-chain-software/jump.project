"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const near_lake_framework_1 = require("near-lake-framework");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const lakeConfig = {
  s3BucketName:
    process.env.NETWORK === "mainnet"
      ? "near-lake-data-mainnet"
      : "near-lake-data-testnet",
  s3RegionName: "eu-central-1",
  startBlockHeight: parseInt(process.env.START_BLOCK) || 63804051,
};
function handleStreamerMessage(streamerMessage) {
  return __awaiter(this, void 0, void 0, function* () {
    for (let shard of streamerMessage.shards) {
      for (let receipt of shard.receiptExecutionOutcomes) {
        console.log(receipt.executionOutcome.outcome);
        break;
      }
    }
  });
}
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield (0,
    near_lake_framework_1.startStream)(lakeConfig, handleStreamerMessage);
  }))();
