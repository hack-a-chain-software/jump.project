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
    total_allocations: [U64; 2],
    allocations_remaining: [U64; 2],
    returned_value: U128,
    field: String,
  ) {
    if !is_promise_success() {
      // revert changes to listing treasury and to investor's allocations
      let listing_id = listing_id.0;
      let total_allocations = [total_allocations[0].0, total_allocations[1].0];
      let mut listing = self.internal_get_listing(listing_id);
      let investor = self.internal_get_investor(&investor_id).unwrap();
      investor
        .allocation_count
        .insert(&listing_id, &total_allocations);
      listing.revert_failed_investor_withdraw(returned_value.0, field);
      self.internal_update_listing(listing_id, listing);
    } else {
      // if no more allocations remaining, remove allocations storage
      // and return storage funds to investor instance
      if allocations_remaining != [U64(0); 2] {
        let initial_storage = env::storage_usage();
        let investor = self.internal_get_investor(&investor_id).unwrap();
        investor.allocation_count.remove(&listing_id.0);
        investor.track_storage_usage(initial_storage);
        self.internal_update_investor(&investor_id, investor);
      }
    }
  }
}
