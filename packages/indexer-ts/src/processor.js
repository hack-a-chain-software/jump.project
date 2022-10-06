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
const JSON_EVENT_PREFIX = "EVENT_JSON:";
/* Handles each non failed transaction
 * Checks whether involves interested contract and sends all events for event processing
 * @param streamerMessage Block of indexed data and sends all non failed transactions
 *        to processing
 * @dev  must handle all logic for treating the indexed data
 */
function processTransaction(executionOutcome, blockHeight, sequelize) {
  var _a;
  return __awaiter(this, void 0, void 0, function* () {
    const outcome = executionOutcome.executionOutcome.outcome;
    const executorId = outcome.executorId;
    if (executorId in env_1.INTERESTED_CONTRACTS) {
      for (const [index, log] of outcome.logs.entries()) {
        if (log.startsWith(JSON_EVENT_PREFIX)) {
          let eventJsonString = log.replace(JSON_EVENT_PREFIX, "");
          // event id not guaranteed to be unique
          console.log(
            (_a = executionOutcome.receipt) === null || _a === void 0
              ? void 0
              : _a.receiptId
          );
          // let eventId: EventId = {
          //   blockHeight,
          //   index,
          // };
          // await processEvent(executorId, eventJsonString, eventId, sequelize);
        }
      }
    }
  });
}
exports.processTransaction = processTransaction;
