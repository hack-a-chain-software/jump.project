use crate::*;

use near_sdk::utils::{is_promise_success};

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
  #[private]
  pub fn callback_token_transfer_to_project_owner(
    &mut self,
    listing_id: U64,
    old_value: U128,
    field: String,
  ) {
    if !is_promise_success() {
      let listing_id = listing_id.0;
      let mut listing = self.internal_get_listing(listing_id);
      listing.revert_failed_project_owner_withdraw(old_value.0, field);
      self.internal_update_listing(listing_id, listing);
    }
  }

  #[private]
  pub fn callback_token_transfer_to_investor(
    &mut self,
    investor_id: AccountId,
    listing_id: U64,
    allocations: U64,
    returned_value: U128,
    field: String,
  ) {
    if !is_promise_success() {
      let listing_id = listing_id.0;
      let mut listing = self.internal_get_listing(listing_id);
      let investor = self.internal_get_investor(&investor_id).unwrap();
      investor
        .allocation_count
        .insert(&listing_id, &allocations.0);
      listing.revert_failed_investor_withdraw(returned_value.0, field);
      self.internal_update_listing(listing_id, listing);
    } else {
      let initial_storage = env::storage_usage();
      let investor = self.internal_get_investor(&investor_id).unwrap();
      investor.allocation_count.remove(&listing_id.0);
      investor.track_storage_usage(initial_storage);
      self.internal_update_investor(&investor_id, investor);
    }
  }
}
