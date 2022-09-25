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
exports.processEventId = exports.processEvent = void 0;
const env_1 = require("../env");
const launchpad_1 = require("./launchpad");
const nftStaking_1 = require("./nftStaking");
const xToken_1 = require("./xToken");
const models_1 = require("../models");
function processEvent(executorId, eventJsonString, eventId, sequelize) {
  return __awaiter(this, void 0, void 0, function* () {
    const event = JSON.parse(eventJsonString);
    switch (executorId) {
      case env_1.LAUNCHPAD_CONTRACT: {
        yield (0, launchpad_1.handleLaunchpadEvent)(event, eventId, sequelize);
        break;
      }
      case env_1.NFT_STAKING_CONTRACT: {
        yield (0,
        nftStaking_1.handleNftStakingEvent)(event, eventId, sequelize);
        break;
      }
      case env_1.XTOKEN_CONTRACT: {
        yield (0, xToken_1.handleXTokenEvent)(event, eventId, sequelize);
        break;
      }
    }
  });
}
exports.processEvent = processEvent;
/* Method to insert evetnIds into table
 * must be called on every event write to DB
 */
function processEventId(eventId, transaction) {
  return __awaiter(this, void 0, void 0, function* () {
    yield models_1.ProcessedEvent.create(
      {
        block_height: eventId.blockHeight,
        transaction_hash: eventId.transactionHash,
        event_index: eventId.eventIndex,
      },
      { transaction }
    );
  });
}
exports.processEventId = processEventId;
