import { types } from "near-lake-framework";
import { INTERESTED_CONTRACTS } from "./env";
import { processEvent } from "./events";
import { EventId } from "./types";
import { Sequelize } from "sequelize/types";

const JSON_EVENT_PREFIX = "EVENT_JSON:";

/* Handles each non failed transaction
 * Checks whether involves interested contract and sends all events for event processing
 * @param streamerMessage Block of indexed data and sends all non failed transactions
 *        to processing
 * @dev  must handle all logic for treating the indexed data
 */
export async function processTransaction(
  executionOutcome: types.ExecutionOutcomeWithReceipt,
  blockHeight: number,
  sequelize: Sequelize
) {
  const outcome = executionOutcome.executionOutcome.outcome;
  const executorId = outcome.executorId;

  if (executorId in INTERESTED_CONTRACTS) {
    for (const [index, log] of outcome.logs.entries()) {
      if (log.startsWith(JSON_EVENT_PREFIX)) {
        let eventJsonString = log.replace(JSON_EVENT_PREFIX, "");
        // event id not guaranteed to be unique
        let eventId: EventId = {
          blockHeight,
          index,
        };
        await processEvent(executorId, eventJsonString, eventId, sequelize);
      }
    }
  }
}
