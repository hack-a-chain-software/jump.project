use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct UserData {
  pub balance: u128,
  pub user_rps: u128,
  pub unclaimed_rewards: u128,
}

#[near_bindgen]
impl StakingFT {
  // @public - This method is a view method to the user data
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

#[cfg(test)]
mod tests {
  use crate::*;
  use crate::tests::{get_context, sample_contract};
  use near_sdk::testing_env;
  use near_sdk::MockedBlockchain;

  #[test]
  // should mock the blockchain data and assert the data that is being returned
  fn test_get_user_data() {
    let test_account = "test.near".to_string();
    let contract_balance = 100;
    let context = get_context(vec![], false, 1, contract_balance, test_account.to_string());

    testing_env!(context);
    let mut contract = sample_contract();

    let user_data = UserData {
      balance: 100,
      user_rps: contract.last_updated_rps,
      unclaimed_rewards: 0,
    };

    contract.user_map.insert(&test_account, &user_data);

    let data = contract.get_user_data(test_account);

    assert_eq!(data.balance, user_data.balance);
    assert_eq!(data.user_rps, user_data.user_rps);
    assert_eq!(data.unclaimed_rewards, user_data.unclaimed_rewards);
  }
}
