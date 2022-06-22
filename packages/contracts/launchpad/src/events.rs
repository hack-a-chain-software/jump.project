use near_sdk::{log, AccountId};
use near_sdk::serde::{Serialize};
use near_sdk::serde_json::{json};
use near_sdk::json_types::{U128};

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

pub fn cancel_listing(listing_id: u64) {
  let data = json!({ "listing_id": listing_id }).to_string();
  log_event("cancel_listing", data);
}

/// Project owner actions events
pub fn project_fund_listing(listing_id: u64, tokens_sale: u128, tokens_liquidity: u128) {
  let data = json!({
      "listing_id": listing_id,
      "tokens_sale": tokens_sale,
      "tokens_liquidity": tokens_liquidity
  });
  log_event("fund_listing", data.to_string());
}

pub fn project_withdraw_listing(
  listing_id: u64,
  project_tokens_withdraw: u128,
  price_tokens_withdraw: u128,
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

pub fn project_withdraw_reverted_error(listing_id: u64, token_quantity: u128, token_type: String) {
  let data = json!({
      "listing_id": listing_id,
      "tokens_withdraw": token_quantity,
      "token_type": token_type
  });
  log_event("reverted_project_withdraw", data.to_string());
}

pub fn investor_buy_allocation(
  investor: &AccountId,
  listing_id: u64,
  sale_phase: SalePhase,
  allocations_purchased: u64,
  total_allocations_sold: u64,
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
  listing_id: u64,
  project_tokens_withdraw: u128,
  price_tokens_withdraw: u128,
  project_status: &ListingStatus,
) {
  let data = json!({
      "listing_id": listing_id,
      "project_tokens_withdraw": project_tokens_withdraw,
      "price_tokens_withdraw": price_tokens_withdraw,
      "project_status": project_status
  });
  log_event("investor_withdraw", data.to_string());
}

pub fn investor_withdraw_reverted_error(listing_id: u64, token_quantity: u128, token_type: String) {
  let data = json!({
      "listing_id": listing_id,
      "tokens_withdraw": token_quantity,
      "token_type": token_type
  });
  log_event("reverted_investor_withdraw", data.to_string());
}
