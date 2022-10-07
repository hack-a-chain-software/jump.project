import { startStream, types } from "near-lake-framework";
import { S3_BUCKET, START_BLOCK } from "./env";
import { sequelizeConnect } from "./connector";
import { processTransaction } from "./processor";
import { Sequelize } from "sequelize/types";

/* Sets environment to run indexer on
 * @param s3BucketName defines which S3 bucket to read data from
 *        can choose between testnet and mainnet in main implementations
 *        or custom bucket
 * @param startBlockHeight
 */
const lakeConfig: types.LakeConfig = {
  s3BucketName: S3_BUCKET,
  s3RegionName: "eu-central-1",
  startBlockHeight: START_BLOCK,
};

/* Handles each indexed block
 * @param streamerMessage Block of indexed data and sends all non failed transactions
 *        to processing
 * @dev  must handle all logic for treating the indexed data
 */
function closureHandleStreamerMessage(sequelize: Sequelize) {
  return async function handleStreamerMessage(
    streamerMessage: types.StreamerMessage
  ): Promise<void> {
    const blockHeight = streamerMessage.block.header.height;
    if (blockHeight % 100 == 0) console.log(blockHeight);

    for (const shard of streamerMessage.shards) {
      for (const receipt of shard.receiptExecutionOutcomes) {
        const outcome = receipt.executionOutcome.outcome;
        const status: any = outcome.status;
        if (status.Failure !== null && status.Unknown !== null) {
          await processTransaction(receipt, blockHeight, sequelize);
        }
      }
    }
  };
}

(async () => {
  const sequelize = await sequelizeConnect();
  await startStream(lakeConfig, closureHandleStreamerMessage(sequelize));
})();
