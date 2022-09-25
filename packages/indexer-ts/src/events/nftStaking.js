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
exports.handleNftStakingEvent = void 0;
const types_1 = require("../types");
const models_1 = require("../models");
const types_2 = require("../types");
const _1 = require(".");
function handleNftStakingEvent(event, eventId, sequelize) {
  return __awaiter(this, void 0, void 0, function* () {
    switch (event.event) {
      case types_1.CREATE_STAKING_PRGRAM: {
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
              yield models_1.StakingProgram.create(
                {
                  collection_id: data.collection_address,
                  collection_owner_id: data.collection_owner,
                  token_address: data.token_address,
                  min_staking_period: data.min_staking_period,
                  early_withdraw_penalty: data.early_withdraw_penalty,
                  round_interval: data.round_interval,
                },
                { transaction }
              );
              yield transaction.commit();
            } catch (err) {
              yield transaction.rollback();
              console.log(err);
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
      case types_1.UPDATE_STAKING_PROGRAM: {
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
              let entry = yield models_1.StakingProgram.findByPk(
                data.collection_address
              );
              if (data.early_withdraw_penalty)
                entry.early_withdraw_penalty = data.early_withdraw_penalty;
              if (data.min_staking_period)
                entry.min_staking_period = data.min_staking_period;
              entry.save({ transaction });
              yield transaction.commit();
            } catch (_a) {
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
      case types_1.STAKE_NFT: {
        let counter = 0;
        const MAX_COUNT = 3;
        function query() {
          return __awaiter(this, void 0, void 0, function* () {
            let data = event.data[0];
            console.log("STAKE NFT");
            const transaction = yield sequelize.transaction();
            try {
              yield (0, _1.processEventId)(eventId, transaction);
            } catch (err) {
              yield transaction.rollback();
              return;
            }
            try {
              yield models_1.StakedNft.create(
                {
                  nft_id: data.token_id[1],
                  collection_id: data.token_id[0].account_id,
                  owner_id: data.owner_id,
                  staked_timestamp: (0, types_2.unixTsToDate)(
                    data.staked_timestamp
                  ),
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
      case types_1.UNSTAKE_NFT: {
        console.log("UNSTAKE_NFT");
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
              const entry = yield models_1.StakedNft.findOne({
                where: {
                  nft_id: data.token_id[1],
                  collection_id: data.token_id[0].account_id,
                },
              });
              yield entry.destroy({ transaction });
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
exports.handleNftStakingEvent = handleNftStakingEvent;
