use crate::*;

use near_sdk::utils::{is_promise_success};

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
    #[private]
    pub fn callback_token_transfer_to_project_owner(&mut self, listing_id: U64, old_value: U128, field: String) {
        if is_promise_success() {
            let listing_id = listing_id.0;
            let mut listing = self.listings.get(listing_id).unwrap().into_current();
            listing.revert_failed_project_owner_withdraw(old_value.0, field);
            self.internal_update_listing(listing_id, listing);
        }
    }
}