use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct UserData {
  pub balance: u128,
  pub user_rps: u128,
  pub unclaimed_rewards: u128,
}
