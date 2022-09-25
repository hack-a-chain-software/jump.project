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
exports.processTransaction = void 0;
const env_1 = require("./env");
const events_1 = require("./events");
const JSON_EVENT_PREFIX = "EVENT_JSON:";
/* Handles each non failed transaction
 * Checks whether involves interested contract and sends all events for event processing
 * @param streamerMessage Block of indexed data and sends all non failed transactions
 *        to processing
 * @dev  must handle all logic for treating the indexed data
 */
function processTransaction(executionOutcome, blockHeight, sequelize) {
  return __awaiter(this, void 0, void 0, function* () {
    const outcome = executionOutcome.executionOutcome.outcome;
    const executorId = outcome.executorId;
    if (env_1.INTERESTED_CONTRACTS.includes(executorId)) {
      // console.log(executorId);
      for (const [eventIndex, log] of outcome.logs.entries()) {
        if (log.startsWith(JSON_EVENT_PREFIX)) {
          const eventJsonString = log.replace(JSON_EVENT_PREFIX, "");
          const transactionHash = executionOutcome.executionOutcome.id;
          const eventId = {
            blockHeight: blockHeight.toString(),
            transactionHash,
            eventIndex: eventIndex.toString(),
          };
          yield (0, events_1.processEvent)(
            executorId,
            eventJsonString,
            eventId,
            sequelize
          );
        }
      }
    }
  });
}
exports.processTransaction = processTransaction;
