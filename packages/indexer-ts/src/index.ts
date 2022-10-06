import { startStream, types } from "near-lake-framework";
import { S3_BUCKET, START_BLOCK } from "./env";
import { sequelizeConnect } from "./connector";
import { processTransaction } from "./processor";

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
async function handleStreamerMessage(
  streamerMessage: types.StreamerMessage
): Promise<void> {
  // const sequelize = await sequelizeConnect();
  for (let shard of streamerMessage.shards) {
    for (let receipt of shard.receiptExecutionOutcomes) {
      let outcome = receipt.executionOutcome.outcome;
      let status: any = outcome.status;
      console.log({
        receipt: receipt.receipt?.receiptId,
        outcome: receipt.executionOutcome.id,
      });
      if (status.Failure !== null && status.Unknown !== null) {
        let blockHeight = streamerMessage.block.header.height;
        // await processTransaction(receipt, blockHeight, sequelize);
      }
    }
  }
}

(async () => {
  await startStream(lakeConfig, handleStreamerMessage);
})();
