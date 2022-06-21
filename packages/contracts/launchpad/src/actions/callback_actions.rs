use crate::*;
use crate::listing::{ListingStatus};
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
    fee: Option<U128>,
  ) {
    let listing_id = listing_id.0;
    let mut listing = self.internal_get_listing(listing_id);

    if !is_promise_success() {
      listing.revert_failed_project_owner_withdraw(old_value.0, field);
    } else if field == "price".to_string() {
      self.internal_add_to_treasury(&listing.price_token, fee.unwrap().0);
    }

    self.internal_update_listing(listing_id, listing);
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
      let mut investor = self.internal_get_investor(&investor_id).unwrap();
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
        let mut investor = self.internal_get_investor(&investor_id).unwrap();
        investor.allocation_count.remove(&listing_id.0);
        investor.track_storage_usage(initial_storage);
        self.internal_update_investor(&investor_id, investor);
      }
    }
  }

  #[private]
  pub fn callback_membership_token_transfer_to_investor(
    &mut self,
    investor_id: AccountId,
    amount: U128
  ) {
    if !is_promise_success() {
      // revert changes to listing treasury and to investor's allocations
      let mut investor = self.internal_get_investor(&investor_id).unwrap();
      investor.staked_token += amount.0;
      self.internal_update_investor(&investor_id, investor);
    }
  }

  #[private]
  pub fn callback_dex_launch_create_pool(
    &mut self,
    listing_id: U64,
    original_deposit: U128
  ) -> PromiseOrValue<bool> {
    let mut listing = self.internal_get_listing(listing_id.0);
    listing.dex_lock_time = 0;
    assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
    match env::promise_result(0) {
      PromiseResult::NotReady => unreachable!(),
      PromiseResult::Successful(value) => {
        assert_eq!(listing.status, ListingStatus::SaleFinalized, "{}", ERR_401);
        if let Ok(parsed_value) = serde_json::from_slice::<u64>(&value) {
          listing.dex_id = Some(parsed_value);
          listing.status = ListingStatus::PoolCreated;
          self.internal_update_listing(listing_id.0, listing);
        } else {
          panic!("{}", ERR_402);
        }
        PromiseOrValue::Value(true)
      },
      PromiseResult::Failed => {
        self.internal_update_listing(listing_id.0, listing);
        PromiseOrValue::Promise(
          Promise::new(env::signer_account_id()).transfer(original_deposit.0)
        )
      }
    }
  }

  #[private]
  pub fn callback_dex_deposit_project_token(
    &mut self,
    listing_id: U64,
    original_deposit: U128,
    launchpad_fee: U128,
  ) {
    let mut listing = self.internal_get_listing(listing_id.0);
    listing.dex_lock_time = 0;
    assert_eq!(listing.status, ListingStatus::PoolCreated, "{}", ERR_401);
    
    if !is_promise_success() {
      listing.undo_withdraw_liquidity_project_token(original_deposit.0);
    } else {
      listing.status = ListingStatus::PoolProjectTokenSent;
      self.internal_add_to_treasury(&listing.project_token,launchpad_fee.0);
    }

    self.internal_update_listing(listing_id.0, listing);
  }

  #[private]
  pub fn callback_dex_deposit_price_token(
    &mut self,
    listing_id: U64,
    original_deposit: U128,
    launchpad_fee: U128,
  ) {
    let mut listing = self.internal_get_listing(listing_id.0);
    listing.dex_lock_time = 0;
    assert_eq!(listing.status, ListingStatus::PoolProjectTokenSent, "{}", ERR_401);

    if !is_promise_success() {
      listing.undo_withdraw_liquidity_price_token(original_deposit.0);
    } else {
      listing.status = ListingStatus::PoolPriceTokenSent;
      self.internal_add_to_treasury(&listing.price_token,launchpad_fee.0);
    }

    self.internal_update_listing(listing_id.0, listing);
  }

  #[private]
  pub fn callback_dex_add_liquidity(
    &mut self,
    listing_id: U64,
    original_deposit: U128
  ) -> PromiseOrValue<bool> {
    let mut listing = self.internal_get_listing(listing_id.0);
    listing.dex_lock_time = 0;
    if !is_promise_success() {
      self.internal_update_listing(listing_id.0, listing);
      PromiseOrValue::Promise(
        Promise::new(env::signer_account_id()).transfer(original_deposit.0)
      )
    } else {
      assert_eq!(listing.status, ListingStatus::PoolPriceTokenSent, "{}", ERR_401);
      listing.status = ListingStatus::LiquidityPoolFinalized;
      self.internal_update_listing(listing_id.0, listing);
      PromiseOrValue::Value(true)
    }
  }
}
