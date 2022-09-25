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
const env_1 = require("./env");
const connector_1 = require("./connector");
const processor_1 = require("./processor");
const models_1 = require("./models");
/* Amount of blocks to reparse after rebooting indexer
 * from shutdown
 */
const BLOCK_REDUNDANCY = 100;
/* Handles each indexed block
 * @param streamerMessage Block of indexed data and sends all non failed transactions
 *        to processing
 * @dev  must handle all logic for treating the indexed data
 */
function closureHandleStreamerMessage(sequelize) {
  return function handleStreamerMessage(streamerMessage) {
    return __awaiter(this, void 0, void 0, function* () {
      const blockHeight = streamerMessage.block.header.height;
      if (blockHeight % 100 == 0) console.log(blockHeight);
      for (const shard of streamerMessage.shards) {
        for (const receipt of shard.receiptExecutionOutcomes) {
          const outcome = receipt.executionOutcome.outcome;
          const status = outcome.status;
          if (
            receipt.executionOutcome.blockHash ==
            "FHSJu1sCVd5FyvKsi2YXNwhoym45nDn9FbU52jqShFps"
          ) {
            console.log(receipt.executionOutcome.blockHash);
            console.log(receipt.executionOutcome);
            yield (0, processor_1.processTransaction)(
              receipt,
              blockHeight,
              sequelize
            );
          }
          // if (status.Failure !== null && status.Unknown !== null) {
          // await processTransaction(receipt, blockHeight, sequelize);
          // }
        }
      }
    });
  };
}
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = yield (0, connector_1.sequelizeConnect)();
    // get highest block in DB
    const lastProcessedTransaction = yield models_1.ProcessedEvent.findOne({
      attributes: [
        [sequelize.fn("min", sequelize.col("block_height")), "block_height"],
      ],
      raw: true,
    });
    // const lastProcessedBlock = lastProcessedTransaction.block_height
    //   ? parseInt(lastProcessedTransaction.block_height) - BLOCK_REDUNDANCY
    //   : START_BLOCK;
    const lastProcessedBlock = 102302400;
    const lakeConfig = {
      s3BucketName: env_1.S3_BUCKET,
      s3RegionName: "eu-central-1",
      startBlockHeight: lastProcessedBlock,
    };
    yield (0,
    near_lake_framework_1.startStream)(lakeConfig, closureHandleStreamerMessage(sequelize));
  }))();
/* testar contratos do zero:
 * 1. deployar contratos novos
 * 2. indexar
 * 3. buildar site
 * 4. interagir para testar stakeNft e xTokenDeposit
 */
