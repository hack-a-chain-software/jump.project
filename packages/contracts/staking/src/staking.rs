use crate::*;

#[near_bindgen]
impl StakingFT {
  // @public - This gets the resolved transaction and stores on the user data
  pub fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, _msg: String) {
    assert_eq!(env::predecessor_account_id(), self.token_address);

    self.update_contract_rps();
    self.update_user_rps(sender_id.clone());

    let user = self
      .user_map
      .get(&sender_id.clone())
      .expect("Error user not found");

    self.user_map.insert(
      &sender_id,
      &UserData {
        balance: user.balance + amount.0,
        unclaimed_rewards: user.unclaimed_rewards,
        user_rps: user.user_rps,
      },
    );
  }

  #[payable]
  pub fn claim(&mut self) -> Promise {
    assert_one_yocto();

    let account_id = env::predecessor_account_id();

    self.update_contract_rps();
    self.update_user_rps(account_id.clone());

    let mut user = self
      .user_map
      .get(&account_id.clone())
      .expect("Error user not found");

    user.unclaimed_rewards = 0;

    self.user_map.insert(&account_id, &user);

    token_contract::ft_transfer(
      account_id.to_string(),
      U128(user.unclaimed_rewards),
      "Claimed #{amount}".to_string(),
      &self.token_address,
      1,
      BASE_GAS,
    )
  }

  #[payable]
  pub fn unstake(&mut self, amount: U128) -> Promise {
    assert_one_yocto();

    self.update_contract_rps();
    self.update_user_rps(env::predecessor_account_id());

    let account_id = env::predecessor_account_id();

    let mut user = self
      .user_map
      .get(&account_id)
      .expect("Error user not found");

    assert!(user.balance > amount.0, "Insuficient Balance");

    user.balance = 0;

    self.user_map.insert(&account_id, &user);

    token_contract::ft_transfer(
      account_id.to_string(),
      amount,
      "Unstaked #{amount} from the contract".to_string(),
      &self.token_address,
      1,
      BASE_GAS,
    )
  }

  #[payable]
  pub fn unstake_all(&mut self) -> Promise {
    assert_one_yocto();
    let account_id = env::predecessor_account_id();
    let user = self
      .user_map
      .get(&account_id)
      .expect("Error user not found");
    self.unstake(U128(user.balance))
  }
}



#[cfg(test)]
mod tests {
  use super::*;
  use crate::tests::{get_context, TOKEN_ACCOUNT, sample_contract};
  use near_sdk::testing_env;
  use near_sdk::MockedBlockchain;


  #[test]
  fn test_stake() {
    let test_account = "test.near".to_string();
    let base_deposit = NEAR_AMOUNT_STORAGE;
    let context = get_context(vec![], false, base_deposit, 0, TOKEN_ACCOUNT.to_string());

    const STAKE_AMOUNT: u128 = 100;
    const MSG: &str = "";

    testing_env!(context);

    let mut contract = sample_contract();

    let user_data = UserData {
      balance: 0,
      user_rps: contract.last_updated_rps,
      unclaimed_rewards: 0,
    };

    contract.user_map.insert(&test_account, &user_data);
    contract.ft_on_transfer(test_account.clone(), U128(STAKE_AMOUNT), MSG.to_string());

    let updated_user_data = contract.user_map.get(&test_account).expect("User has not been found");

    assert_eq!(updated_user_data.balance, 100);
    assert!(updated_user_data.user_rps > 0);
  }
}

