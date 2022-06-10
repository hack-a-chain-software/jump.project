use near_sdk::{log, AccountId};
use near_sdk::serde::{Serialize};
use near_sdk::serde_json::{json};

use crate::listing::{VListing, ListingStatus, SalePhase};

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
    log_event("create_guardian", new_guardian);
}

pub fn remove_guardian(old_guardian: &AccountId) {
    log_event("old_guardian", old_guardian);
}

/// Guardian actions events
pub fn create_listing(listing_data: VListing) {
    log_event("create_listing", listing_data);
}

pub fn cancel_listing(listing_id: u64) {
    let data = json!({"listing_id": listing_id}).to_string();
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

pub fn project_withdraw_listing(listing_id: u64, project_tokens_withdraw: u128, price_tokens_withdraw: u128, project_status: &ListingStatus) {
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

/// Normal user actions events
pub fn investor_buy_allocation(sale_phase: SalePhase, allocations_purchased: u64) {
    let data = json!({
        "sale_phase": sale_phase,
        "allocations_purchased": allocations_purchased
    });
    log_event("investor_buy_allocation", data.to_string());
}