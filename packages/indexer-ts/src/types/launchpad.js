"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVESTOR_UNSTAKE_MEMBERSHIP =
  exports.INVESTOR_STAKE_MEMBERSHIP =
  exports.INVESTOR_WITHDRAW_ALLOCATIONS =
  exports.INVESTOR_BUY_ALLOCATIONS =
  exports.PROJECT_WITHDRAW_LISTING =
  exports.PROJECT_FUND_LISTING =
  exports.CANCEL_LISTING =
  exports.CREATE_LISTING =
  exports.RETRIVE_TREASURY_FUNDS =
  exports.REMOVE_GUARDIAN =
  exports.ADD_GUARDIAN =
    void 0;
/* Define all interested events that will trigger DB actions
 * and all their type interfaces
 * All other events will be discarded
 */
exports.ADD_GUARDIAN = "add_guardian";
exports.REMOVE_GUARDIAN = "remove_guardian";
exports.RETRIVE_TREASURY_FUNDS = "retrieve_treasury_funds";
exports.CREATE_LISTING = "create_listing";
exports.CANCEL_LISTING = "cancel_listing";
exports.PROJECT_FUND_LISTING = "project_fund_listing";
exports.PROJECT_WITHDRAW_LISTING = "project_withdraw_listing";
exports.INVESTOR_BUY_ALLOCATIONS = "investor_buy_allocations";
exports.INVESTOR_WITHDRAW_ALLOCATIONS = "investor_withdraw_allocations";
exports.INVESTOR_STAKE_MEMBERSHIP = "investor_stake_membership";
exports.INVESTOR_UNSTAKE_MEMBERSHIP = "investor_unstake_membership";
