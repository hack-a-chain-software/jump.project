// ### Normal users

// 1. join sale_1 (if they own xJump);
// 2. join sale_2;
// 3. withdraw unlocked project_tokens from a listing they invested in;
// 4. withdraw vested project_tokens from a listing they invested in;
// 5. withdraw price_tokens from a listing they invested in in case the listing is cancelled;

use crate::*;
use crate::ext_interface::{ext_self};
use crate::token_handler::{TokenType, GAS_FOR_FT_TRANSFER_CALLBACK};
use near_sdk::{Promise};

#[near_bindgen]
impl Contract {
  pub fn withdraw_allocations(&mut self, listing_id: u64) -> Promise {
    let account_id = env::predecessor_account_id();
    let mut listing = self.internal_get_listing(listing_id);
    let mut investor = self.internal_get_investor(&account_id).expect(ERR_004);
    // figure if cliff has already passed
    let investor_allocations = investor.allocation_count.get(&listing_id).expect(ERR_302);
    let allocations_to_withdraw; // = (investor_allocations.0, 0);
    let allocations_remaining; // = (0, investor_allocations.1);
    if env::block_timestamp() > listing.cliff_timestamp {
      allocations_to_withdraw = investor_allocations;
      allocations_remaining = [0; 2];
    } else {
      allocations_to_withdraw = [investor_allocations[0], 0];
      allocations_remaining = [0, investor_allocations[1]];
    }
    // cannot remove key right away because promise might fail and
    // storage deposit might be wrongly released
    let investor_allocations = investor
      .allocation_count
      .insert(&listing_id, &allocations_remaining)
      .expect(ERR_302);
    self.internal_update_investor(&account_id, investor);
    listing.withdraw_investor_funds(
      investor_allocations,
      allocations_to_withdraw,
      allocations_remaining,
      account_id,
    )
  }

  #[payable]
  pub fn decrease_membership_tier(&mut self, withdraw_amount: U128) -> Promise {
    assert_one_yocto();
    let account_id = env::predecessor_account_id();
    let mut investor = self.internal_get_investor(&account_id).expect(ERR_004);
    assert!(investor.staked_token >= withdraw_amount.0, "{}", ERR_208);
    assert!(
      env::block_timestamp() - investor.last_check >= self.contract_settings.token_lock_period.0,
      "{}. Will be able to retrieve at timestamp {}",
      ERR_209,
      investor.last_check + self.contract_settings.token_lock_period.0
    );

    investor.staked_token -= withdraw_amount.0;
    self.internal_update_investor(&account_id, investor);

    TokenType::FT {
      account_id: self.contract_settings.membership_token.clone(),
    }
    .transfer_token(account_id.clone(), withdraw_amount.0)
    .then(
      ext_self::ext(env::current_account_id())
        .with_static_gas(GAS_FOR_FT_TRANSFER_CALLBACK)
        .callback_membership_token_transfer_to_investor(account_id, withdraw_amount),
    )
  }
}

/// methods to be called through the token_receiver
impl Contract {
  // add logic to calculate how many user can buy and reduce the allocations
  // they already bought
  pub fn buy_allocation(
    &mut self,
    listing_id: u64,
    price_tokens_sent: u128,
    account_id: AccountId,
    token_type: TokenType
  ) -> u128 {
    let initial_storage = env::storage_usage();
    let mut listing = self.internal_get_listing(listing_id);
    let mut investor = self.internal_get_investor(&account_id).expect(ERR_004);
    assert_eq!(token_type, listing.price_token, "{}", ERR_104);
    let current_sale_phase = listing.get_current_sale_phase();
    let previous_allocations_bought = investor
      .allocation_count
      .get(&listing.listing_id)
      .unwrap_or([0, 0]);
    let investor_allocations = self.check_investor_allowance(
      &investor,
      &current_sale_phase,
      previous_allocations_bought[0],
      &listing,
    );
    let (allocations_bought, leftover) =
      listing.buy_allocation(price_tokens_sent, investor_allocations);

    events::investor_buy_allocation(
      &account_id,
      U64(listing_id),
      current_sale_phase,
      U64(allocations_bought),
      U64(listing.allocations_sold),
    );
    self.internal_update_listing(listing_id, listing);
    let new_allocation_balance = [previous_allocations_bought[0] + allocations_bought; 2];
    investor
      .allocation_count
      .insert(&listing_id, &new_allocation_balance);
    investor.track_storage_usage(initial_storage);
    self.internal_update_investor(&account_id, investor);

    leftover
  }

  pub fn increase_membership_tier(
    &mut self,
    account_id: AccountId,
    token_count: u128,
    membership_tier: usize,
    token_type: AccountId,
  ) -> u128 {
    assert_eq!(
      token_type, self.contract_settings.membership_token,
      "{}",
      ERR_204
    );
    let tokens_needed = self
      .contract_settings
      .tiers_minimum_tokens
      .get(membership_tier - 1)
      .expect(ERR_205)
      .0;
    let mut investor = self.internal_get_investor(&account_id).expect(ERR_004);
    let total_tokens = token_count + investor.staked_token;
    assert!(total_tokens >= tokens_needed, "{}", ERR_206);
    assert!(
      membership_tier as u64
        >= investor.get_current_membership_level(&self.contract_settings.tiers_minimum_tokens),
      "{}",
      ERR_207
    );
    investor.staked_token = tokens_needed;
    investor.update_time_check();
    self.internal_update_investor(&account_id, investor);
    events::investor_stake_membership(&account_id, U128(tokens_needed), U64(membership_tier as u64));
    total_tokens - tokens_needed
  }
}
