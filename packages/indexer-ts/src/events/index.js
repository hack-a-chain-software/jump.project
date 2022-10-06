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
exports.processEvent = void 0;
const env_1 = require("../env");
const launchpad_1 = require("./launchpad");
function processEvent(executorId, eventJsonString, eventId, sequelize) {
  return __awaiter(this, void 0, void 0, function* () {
    const event = JSON.parse(eventJsonString);
    switch (executorId) {
      case env_1.LAUNCHPAD_CONTRACT: {
        yield (0, launchpad_1.handleLaunchpadEvent)(event, sequelize);
        break;
      }
      case env_1.NFT_STAKING_CONTRACT: {
        break;
      }
      case env_1.XTOKEN_CONTRACT: {
        break;
      }
    }
  });
}
exports.processEvent = processEvent;
/*
Inside each:
    Check if is one of interested events, else discard;
    Coerce JSON to event type, if convertion fails, throw;
    Perform relevant operation.
*/
