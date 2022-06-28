use near_sdk::{log, AccountId};
use near_sdk::serde::{Serialize};
use near_sdk::serde_json::{json};
use near_sdk::json_types::{U128, U64};

use crate::listing::{VListing, ListingStatus, SalePhase};
use crate::token_handler::{TokenType};

fn log_event<T: Serialize>(event: &str, data: T) {
  let event = json!({
      "standard": "jump_launchpad",
      "version": "1.0.0",
      "event": event,
      "data": [data]
  });

  log!("EVENT_JSON:{}", event.to_string());
}

/// Owner actions events
pub fn add_guardian(new_guardian: &AccountId) {
  let data = json!({ "new_guardian": new_guardian });
  log_event("create_guardian", data);
}

pub fn remove_guardian(old_guardian: &AccountId) {
  let data = json!({ "old_guardian": old_guardian });
  log_event("remove_guardian", data);
}

pub fn retrieve_treasury_funds(token_type: &TokenType, quantity: U128) {
  let data = json!({ "token_type": token_type, "quantity": quantity });
  log_event("retrieve_treasury_funds", data);
}

/// Guardian actions events
pub fn create_listing(listing_data: VListing) {
  let data = json!({ "listing_data": listing_data }).to_string();
  log_event("create_listing", data);
}

pub fn cancel_listing(listing_id: U64) {
  let data = json!({ "listing_id": listing_id }).to_string();
  log_event("cancel_listing", data);
}

/// Project owner actions events
pub fn project_fund_listing(listing_id: U64, tokens_sale: U128, tokens_liquidity: U128) {
  let data = json!({
      "listing_id": listing_id,
      "tokens_sale": tokens_sale,
      "tokens_liquidity": tokens_liquidity
  });
  log_event("fund_listing", data.to_string());
}

pub fn project_withdraw_listing(
  listing_id: U64,
  project_tokens_withdraw: U128,
  price_tokens_withdraw: U128,
  project_status: &ListingStatus,
) {
  let data = json!({
      "listing_id": listing_id,
      "project_tokens_withdraw": project_tokens_withdraw,
      "price_tokens_withdraw": price_tokens_withdraw,
      "project_status": project_status
  });
  log_event("project_withdraw", data.to_string());
}

/// Investor action events
pub fn investor_buy_allocation(
  investor: &AccountId,
  listing_id: U64,
  sale_phase: SalePhase,
  allocations_purchased: U64,
  total_allocations_sold: U64,
) {
  let data = json!({
      "investor": investor,
      "listing_id": listing_id,
      "sale_phase": sale_phase,
      "allocations_purchased": allocations_purchased,
      "total_allocations_sold": total_allocations_sold,
  });
  log_event("investor_buy_allocation", data.to_string());
}

pub fn investor_withdraw_allocations(
  listing_id: U64,
  project_tokens_withdrew: U128,
  price_tokens_withdrew: U128,
  project_status: &ListingStatus,
) {
  let data = json!({
      "listing_id": listing_id,
      "project_tokens_withdrew": project_tokens_withdrew,
      "price_tokens_withdrew": price_tokens_withdrew,
      "project_status": project_status
  });
  log_event("investor_withdraw", data.to_string());
}

pub fn investor_stake_membership(
  account_id: &AccountId,
  token_quantity: U128,
  new_membership_level: U64
) {
  let data = json!({
      "account_id": account_id,
      "token_quantity": token_quantity,
      "new_membership_level": new_membership_level
  });
  log_event("stake_membership", data.to_string());
}

pub fn investor_unstake_membership(
  account_id: &AccountId,
  token_quantity: U128,
  new_membership_level: U64
) {
  let data = json!({
      "account_id": account_id,
      "token_quantity": token_quantity,
      "new_membership_level": new_membership_level
  });
  log_event("unstake_membership", data.to_string());
}
