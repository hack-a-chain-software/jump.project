use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct UserData {
  pub balance: u128,
  pub user_rps: u128,
  pub unclaimed_rewards: u128,
}

#[near_bindgen]
impl StakingFT {
  pub fn get_user_data(&self, account_id: AccountId) -> UserData {
    let mut user = self
      .user_map
      .get(&account_id)
      .expect("User has not been found");

    let contract_rps = self.internal_calculate_rps();

    user.unclaimed_rewards = self.internal_calculate_user_rewards(account_id, contract_rps);

    user.user_rps = contract_rps;

    user
  }
}
