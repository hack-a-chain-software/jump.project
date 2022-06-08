use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct InvestorTreasury {
  // keeps track of how many allocations investor bought
  pub allocations_purchased: u128,
  // keeps track of how many tokens with no vesting period the investor can withdraw
  pub no_vesting_project_tokens_available: u128,
  // keeps track of how many tokens with a vesting period the investor can withdraw
  pub vesting_project_tokens_available: u128,
}

impl InvestorTreasury {
  pub fn new(
    allocations_purchased: u128,
    no_vesting_project_tokens_available: u128,
    vesting_project_tokens_available: u128,
  ) -> Self {
    Self {
      allocations_purchased,
      no_vesting_project_tokens_available,
      vesting_project_tokens_available,
    }
  }

  pub fn remove_no_vesting(&mut self, quantity_to_remove: u128) {
    assert!(self.no_vesting_project_tokens_available >= quantity_to_remove);
    self.no_vesting_project_tokens_available -= quantity_to_remove;
  }

  pub fn remove_vested(&mut self, quantity_to_remove: u128) {
    assert!(self.vesting_project_tokens_available >= quantity_to_remove);
    self.vesting_project_tokens_available -= quantity_to_remove;
  }
  
}
