use near_sdk::{log, AccountId};
use near_sdk::serde::{Serialize};
use near_sdk::serde_json::{json};

use crate::listing::{VListing};

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

