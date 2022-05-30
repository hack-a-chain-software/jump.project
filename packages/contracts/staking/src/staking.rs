use crate::*;

#[near_bindgen]
impl StakingFT {
  // @public - This is the staking function of the contract that the user will interact to stake
  // JUMP tokens into the the staking pool
  #[allow(unused_variables)]
  pub fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, msg: String) {
    assert_eq!(env::predecessor_account_id(), self.token_address);

    self.update_contract_rps();
    self.update_user_rps(sender_id.clone());

    let user = self
      .user_map
      .get(&sender_id.clone())
      .expect("User has not been found");

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
  // @public - This is the claim function of the contract that the user will interact to retrieve
  // his rewards from the staking pool
  pub fn claim(&mut self) -> Promise {
    assert_one_yocto();

    let account_id = env::predecessor_account_id();

    self.update_contract_rps();
    self.update_user_rps(account_id.clone());

    let mut user = self
      .user_map
      .get(&account_id.clone())
      .expect("User has not been found");

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
  // @public - This is the unstake function of the contract that the user will interact in order to
  // withdraw the funds that he staked inside the staking pool
  pub fn unstake(&mut self, amount: U128) -> Promise {
    assert_one_yocto();

    self.update_contract_rps();
    self.update_user_rps(env::predecessor_account_id());

    let account_id = env::predecessor_account_id();

    let mut user = self
      .user_map
      .get(&account_id)
      .expect("User has not been found");

    assert!(user.balance >= amount.0, "Insuficient Balance");

    user.balance -= amount.0;

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
  // @public - This is the unstake all function of the contract that the user will hit in order to
  // retrieve all his funds that he has deposited so far
  pub fn unstake_all(&mut self) -> Promise {
    assert_one_yocto();

    let account_id = env::predecessor_account_id();

    let user = self
      .user_map
      .get(&account_id)
      .expect("User has not been found");

    self.unstake(U128(user.balance))
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::tests::{get_context, sample_contract, TOKEN_ACCOUNT};
  use near_sdk::testing_env;
  use near_sdk::MockedBlockchain;

  #[test]
  // should deposit data into the the staking pool and update the user balance and rps as expected
  fn test_stake() {
    let test_account = "test.near".to_string();
    let context = get_context(vec![], false, 1, 100, TOKEN_ACCOUNT.to_string());

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

    let updated_user_data = contract
      .user_map
      .get(&test_account)
      .expect("User has not been found");

    assert_eq!(updated_user_data.balance, 100);
    assert_eq!(updated_user_data.user_rps, contract.last_updated_rps);
  }

  #[test]
  // should withdraw an ammount of tokens from the staking pool and update its balance and its rps
  fn test_unstake() {
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

    assert_eq!(contract.user_map.get(&test_account).unwrap().balance, 100);

    contract.unstake(U128(50));

    let updated_user_data = contract
      .user_map
      .get(&test_account)
      .expect("User has not been found");

    assert_eq!(updated_user_data.balance, 50);
    assert_eq!(updated_user_data.user_rps, contract.last_updated_rps);
  }

  #[test]
  #[should_panic(expected = "Insuficient Balance")]
  // should not unstake more money than you got
  fn test_unstake_insuficient_balance() {
    let test_account = "test.near".to_string();
    let contract_balance = 100;
    let context = get_context(vec![], false, 1, contract_balance, test_account.to_string());

    testing_env!(context);

    let mut contract = sample_contract();

    let user_data = UserData {
      balance: 0,
      user_rps: contract.last_updated_rps,
      unclaimed_rewards: 0,
    };
    contract.user_map.insert(&test_account, &user_data);
    contract.unstake(U128(50));
  }

  #[test]
  #[should_panic(expected = "User has not been found")]
  // should not unstake tokens when the contract didn't find a user on the map
  fn test_unstake_user_not_found() {
    let test_account = "test.near".to_string();
    let contract_balance = 100;
    let context = get_context(vec![], false, 1, contract_balance, test_account.to_string());

    testing_env!(context);

    let mut contract = sample_contract();
    contract.unstake(U128(50));
  }

  #[test]
  #[should_panic(expected = "User has not been found")]
  // should not unstake_all tokens when the contract didn't find a user on the map
  fn test_unstake_all_user_not_found() {
    let test_account = "test.near".to_string();
    let contract_balance = 100;
    let context = get_context(vec![], false, 1, contract_balance, test_account.to_string());

    testing_env!(context);

    let mut contract = sample_contract();
    contract.unstake_all();
  }

  #[test]
  #[should_panic(expected = "User has not been found")]
  // should not claim rewards for a unregistered user
  fn test_claim_user_not_found() {
    let test_account = "test.near".to_string();
    let contract_balance = 100;
    let context = get_context(vec![], false, 1, contract_balance, test_account.to_string());

    testing_env!(context);

    let mut contract = sample_contract();
    contract.claim();

    let updated_user_data = contract
      .user_map
      .get(&test_account)
      .expect("User has not been found");

    assert_eq!(updated_user_data.balance, 50);
    assert_eq!(updated_user_data.user_rps, contract.last_updated_rps);
  }

  #[test]
  // should withdraw all the money that the user on the balance value!
  fn test_unstake_all() {
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
    contract.unstake_all();

    let updated_user_data = contract
      .user_map
      .get(&test_account)
      .expect("User has not been found");

    assert_eq!(updated_user_data.balance, 0);
    assert_eq!(updated_user_data.user_rps, contract.last_updated_rps);
  }

  #[test]
  // should claim all the user rewards that he has stored on his accout for the JUMP Tokens
  fn test_claim() {
    let test_account = "test.near".to_string();
    let context = get_context(vec![], false, 1, 0, test_account.to_string());
    testing_env!(context);

    let mut contract = sample_contract();

    let user_data = UserData {
      balance: 100,
      user_rps: contract.last_updated_rps,
      unclaimed_rewards: 100,
    };
    contract.user_map.insert(&test_account, &user_data);
    contract.claim();

    let updated_user_data = contract
      .user_map
      .get(&test_account)
      .expect("User has not been found");

    assert_eq!(updated_user_data.unclaimed_rewards, 0);
    assert_eq!(updated_user_data.balance, 100);
    assert_eq!(updated_user_data.user_rps, contract.last_updated_rps);
  }
}
