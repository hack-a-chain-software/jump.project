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
exports.handleXTokenEvent = void 0;
const types_1 = require("../types");
const models_1 = require("../models");
const types_2 = require("../types");
const _1 = require(".");
function handleXTokenEvent(event, eventId, sequelize) {
  return __awaiter(this, void 0, void 0, function* () {
    switch (event.event) {
      case types_1.PROFIT_DEPOSIT: {
        console.log("HERE");
        let counter = 0;
        const MAX_COUNT = 3;
        function query() {
          return __awaiter(this, void 0, void 0, function* () {
            let data = event.data[0];
            const transaction = yield sequelize.transaction();
            try {
              yield (0, _1.processEventId)(eventId, transaction);
            } catch (err) {
              yield transaction.rollback();
              return;
            }
            try {
              yield models_1.xTokenRatio.create(
                {
                  time_event: (0, types_2.unixTsToDate)(data.timestamp),
                  base_token_amount: data.base_token_treasury_after_deposit,
                  x_token_amount: data.x_token_supply_after_deposit,
                },
                { transaction }
              );
              yield transaction.commit();
            } catch (err) {
              console.log(err);
              yield transaction.rollback();
              if (counter < MAX_COUNT) {
                counter += 1;
                yield (0, types_2.sleep)(2000, counter);
                yield query();
              }
            }
          });
        }
        yield query();
        break;
      }
    }
  });
}
exports.handleXTokenEvent = handleXTokenEvent;
