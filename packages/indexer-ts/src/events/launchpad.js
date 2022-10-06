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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLaunchpadEvent = void 0;
const big_js_1 = __importDefault(require("big.js"));
const types_1 = require("../types");
const models_1 = require("../models");
function handleLaunchpadEvent(event, sequelize) {
  return __awaiter(this, void 0, void 0, function* () {
    switch (event.event) {
      case types_1.CREATE_LISTING: {
        let data = event.data[0];
        let objectData = data.listing_data.V1;
        yield sequelize.transaction((transaction) =>
          __awaiter(this, void 0, void 0, function* () {
            yield models_1.Listing.create(
              {
                listing_id: objectData.listing_id,
                public: objectData.listing_type == "Public",
                listing_status: objectData.status,
                project_owner: objectData.project_owner,
                project_token: objectData.project_token.FT.account_id,
                price_token: objectData.project_token.FT.account_id,
                open_sale_1_timestamp: objectData.open_sale_1_timestamp,
                open_sale_2_timestamp: objectData.open_sale_2_timestamp,
                final_sale_2_timestamp: objectData.final_sale_2_timestamp,
                liquidity_pool_timestamp: objectData.liquidity_pool_timestamp,
                total_amount_sale_project_tokens:
                  objectData.total_amount_sale_project_tokens,
                token_allocation_size: objectData.token_allocation_size,
                token_allocation_price: objectData.token_allocation_price,
                allocations_sold: objectData.allocations_sold,
                liquidity_pool_project_tokens:
                  objectData.liquidity_pool_project_tokens,
                liquidity_pool_price_tokens:
                  objectData.liquidity_pool_price_tokens,
                fraction_instant_release: objectData.fraction_instant_release,
                fraction_cliff_release: objectData.fraction_cliff_release,
                cliff_timestamp: objectData.cliff_timestamp,
                end_cliff_timestamp: objectData.end_cliff_timestamp,
                fee_price_tokens: objectData.fee_price_tokens,
                fee_liquidity_tokens: objectData.fee_liquidity_tokens,
                dex_id: objectData.dex_id,
              },
              { transaction }
            );
          })
        );
        break;
      }
      case types_1.CANCEL_LISTING: {
        let data = event.data[0];
        let entryPk = data.listing_id;
        let entry = yield models_1.Listing.findByPk(entryPk);
        yield sequelize.transaction((transaction) =>
          __awaiter(this, void 0, void 0, function* () {
            entry.listing_status = "cancelled";
            yield entry.save({ transaction });
          })
        );
        break;
      }
      case types_1.PROJECT_FUND_LISTING: {
        let data = event.data[0];
        let entryPk = data.listing_id;
        let entry = yield models_1.Listing.findByPk(entryPk);
        yield sequelize.transaction((transaction) =>
          __awaiter(this, void 0, void 0, function* () {
            entry.listing_status = "funded";
            yield entry.save({ transaction });
          })
        );
        break;
      }
      case types_1.PROJECT_WITHDRAW_LISTING: {
        let data = event.data[0];
        let entryPk = data.listing_id;
        let entry = yield models_1.Listing.findByPk(entryPk);
        yield sequelize.transaction((transaction) =>
          __awaiter(this, void 0, void 0, function* () {
            entry.listing_status = data.project_status;
            yield entry.save({ transaction });
          })
        );
        break;
      }
      case types_1.INVESTOR_BUY_ALLOCATIONS: {
        let data = event.data[0];
        let listingPk = data.listing_id;
        let listing = yield models_1.Listing.findByPk(listingPk);
        let entry = yield models_1.Allocation.findOne({
          where: {
            account_id: data.investor_id,
            listing_id: data.listing_id,
          },
        });
        yield sequelize.transaction((transaction) =>
          __awaiter(this, void 0, void 0, function* () {
            if (entry === null) {
              yield models_1.Allocation.create(
                {
                  account_id: data.investor_id,
                  listing_id: data.listing_id,
                  total_allocation: data.allocations_purchased,
                  total_quantity: data.tokens_purchased,
                  quantity_withdrawn: "0",
                },
                { transaction }
              );
            } else {
              entry.set({
                total_allocation: new big_js_1.default(entry.total_allocation)
                  .plus(new big_js_1.default(data.allocations_purchased))
                  .toFixed(),
                total_quantity: new big_js_1.default(entry.total_quantity)
                  .plus(new big_js_1.default(data.tokens_purchased))
                  .toFixed(),
              });
              yield entry.save({ transaction });
            }
            listing.set({
              listing_status: data.project_status,
              allocations_sold: data.total_allocations_sold,
            });
            yield listing.save({ transaction });
          })
        );
        break;
      }
      case types_1.INVESTOR_WITHDRAW_ALLOCATIONS: {
        const data = event.data[0];
        const listingPk = data.listing_id;
        const listing = yield models_1.Listing.findByPk(listingPk);
        const entry = yield models_1.Allocation.findOne({
          where: {
            account_id: data.investor_id,
            listing_id: data.listing_id,
          },
        });
        yield sequelize.transaction((transaction) =>
          __awaiter(this, void 0, void 0, function* () {
            entry.quantity_withdrawn = new big_js_1.default(
              entry.quantity_withdrawn
            )
              .plus(new big_js_1.default(data.project_tokens_withdrawn))
              .toFixed();
            entry.save({ transaction });
            listing.listing_status = data.project_status;
            listing.save({ transaction });
          })
        );
        break;
      }
    }
  });
}
exports.handleLaunchpadEvent = handleLaunchpadEvent;
