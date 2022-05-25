use crate::errors::ERR_001;
use crate::*;

#[near_bindgen]
impl StakingFT {
  // @public - This initializes the storage for the user
  #[payable]
  pub fn register_storage(&mut self, account_id: AccountId) {
    assert!(
      env::attached_deposit() == NEAR_AMOUNT_STORAGE,
      "{}",
      ERR_001
    );

    if let Some(_i) = self.user_map.get(&account_id) {
      panic!("User Already Registered")
    }

    self.user_map.insert(
      &account_id,
      &UserData {
        balance: 0,
        unclaimed_rewards: 0,
        user_rps: self.last_updated_rps,
      },
    );
  }

  pub fn unregister_storage(&mut self) -> Promise {
    let account_id = env::predecessor_account_id();

    self.claim();
    self.unstake_all();
    self.user_map.remove(&account_id);

    Promise::new(account_id).transfer(NEAR_AMOUNT_STORAGE)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::tests::{get_context, OWNER_ACCOUNT, TOKEN_ACCOUNT};
  use near_sdk::testing_env;
  use near_sdk::MockedBlockchain;

  #[test]
  fn test_register_storage_happy() {
    let test_account = "test.near".to_string();
    let base_deposit = NEAR_AMOUNT_STORAGE;
    let context = get_context(vec![], false, base_deposit, 0, OWNER_ACCOUNT.to_string());
    testing_env!(context);

    let mut contract = StakingFT::initialize_staking(
      OWNER_ACCOUNT.to_string(),
      TOKEN_ACCOUNT.to_string(),
      U128(1),
      U128(100),
    );

    contract.register_storage(test_account.clone());

    let user_data = contract
      .user_map
      .get(&test_account)
      .expect("User not registered");

    assert_eq!(user_data.balance, 0);
    assert_eq!(user_data.unclaimed_rewards, 0);
    assert_eq!(user_data.user_rps, contract.last_updated_rps);
  }

  #[test]
  #[should_panic(expected = "The contract needs exactly 0.01 NEAR to initialize your data")]
  fn test_register_storage_unhappy_different_near_amount() {
    let test_account = "test.near".to_string();
    let base_deposit = NEAR_AMOUNT_STORAGE + 1;
    let context = get_context(vec![], false, base_deposit, 0, OWNER_ACCOUNT.to_string());
    testing_env!(context);

    let mut contract = StakingFT::initialize_staking(
      OWNER_ACCOUNT.to_string(),
      TOKEN_ACCOUNT.to_string(),
      U128(1),
      U128(100),
    );

    contract.register_storage(test_account.clone());
  }

  #[test]
  #[should_panic(expected = "User Already Registered")]
  fn test_register_storage_unhappy_user_already_registered() {
    let test_account = "test.near".to_string();
    let base_deposit = NEAR_AMOUNT_STORAGE;
    let context = get_context(vec![], false, base_deposit, 0, OWNER_ACCOUNT.to_string());
    testing_env!(context);

    let mut contract = StakingFT::initialize_staking(
      OWNER_ACCOUNT.to_string(),
      TOKEN_ACCOUNT.to_string(),
      U128(1),
      U128(100),
    );

    contract.register_storage(test_account.clone());

    contract.register_storage(test_account.clone());
  }
}
