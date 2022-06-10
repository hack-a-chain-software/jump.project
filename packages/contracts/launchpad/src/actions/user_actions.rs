// ### Normal users

// 1. join sale_1 (if they own xJump);
// 2. join sale_2;
// 3. withdraw unlocked project_tokens from a listing they invested in;
// 4. withdraw vested project_tokens from a listing they invested in;
// 5. withdraw price_tokens from a listing they invested in in case the listing is cancelled;

use crate::*;

#[near_bindgen]
impl Contract {}

/// methods to be called through the token_receiver
impl Contract {
  // add logic to calculate how many user can buy and reduce the allocations
  // they already bought
  pub fn buy_allocation(
    &mut self,
    listing_id: u64,
    price_tokens_sent: u128,
    account_id: AccountId,
  ) -> u128 {
    let listing = self.internal_get_listing(listing_id);
    let investor = self.internal_get_investor(&account_id).expect(ERR_004);
    let current_sale_phase = listing.get_current_sale_phase();
    let previous_allocations_bought = investor
      .allocation_count
      .get(&listing.listing_id)
      .unwrap_or(0);
    let investor_allocations =
      self.check_investor_allowance(&listing, &investor, &current_sale_phase, previous_allocations_bought);
    let (allocations_bought, leftover) =
      listing.buy_allocation(price_tokens_sent, investor_allocations);
    self.internal_update_listing(listing_id, listing);
    investor
      .allocation_count
      .insert(&listing_id, &(previous_allocations_bought + allocations_bought));
    events::investor_buy_allocation(current_sale_phase, allocations_bought);
    leftover
  }
}
