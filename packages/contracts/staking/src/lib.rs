mod structs;
use core::assert;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
pub use near_sdk::json_types::U128;
pub use near_sdk::serde_json::{self, json, Value};
pub use near_sdk::utils::assert_one_yocto;
use near_sdk::{env, ext_contract, near_bindgen, setup_alloc, AccountId, Gas, Promise};
use structs::UserData;

#[ext_contract(token_contract)]
pub trait FungibleToken {
  fn ft_transfer(receiver_id: AccountId, amount: U128, memo: String);
}

setup_alloc!();

pub const FRACTION_BASE: u128 = 10_000;
pub const BASE_GAS: Gas = 5_000_000_000_000;
pub const NEAR_AMOUNT_STORAGE: u128 = 10000000000000000000000;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct StakingFT {
  owner: AccountId,
  token_address: AccountId,
  yield_per_period: u128,
  period_duration: u128,
  last_updated: u128,
  last_updated_rps: u128,
  user_map: LookupMap<AccountId, UserData>,
}

impl Default for StakingFT {
  // Prevents Initialization
  fn default() -> Self {
    panic!("Should be initialized before usage")
  }
}

#[near_bindgen]
impl StakingFT {
  // @public - This initializes the state of the contract
  #[init]
  pub fn initialize_staking(
    owner: AccountId,
    token_address: AccountId,
    yield_per_period: U128,
    period_duration: U128,
  ) -> Self {
    assert_eq!(!env::state_exists(), false);

    Self {
      owner,
      token_address,
      period_duration: period_duration.0,
      user_map: LookupMap::new(b"a".to_vec()),
      last_updated: env::block_timestamp() as u128,
      last_updated_rps: 0,
      yield_per_period: yield_per_period.0,
    }
  }

  pub fn get_user_data(&self, account_id: AccountId) -> UserData {
    let mut user = self
      .user_map
      .get(&account_id)
      .expect("Error user not found");

    let contract_rps = self.internal_calculate_rps();

    user.unclaimed_rewards = self.internal_calculate_user_rewards(account_id, contract_rps);

    user.user_rps = contract_rps;

    user
  }

  // @private - Calculates the blockchain RPS
  fn internal_calculate_rps(&self) -> u128 {
    let timestamp = env::block_timestamp() as u128;
    ((timestamp - self.last_updated) / self.period_duration) * self.yield_per_period 
  }

  // @private - Calculates the user unclaimed rewards
  fn internal_calculate_user_rewards(&self, account_id: AccountId, contract_rps: u128) -> u128 {
    let user = self
      .user_map
      .get(&account_id)
      .expect("Error user not found");

    user.unclaimed_rewards + ((user.balance * (contract_rps - user.user_rps)) / FRACTION_BASE)
  }

  // @private - This updates the contract RPS and can only be called by the contract
  fn update_contract_rps(&mut self) {
    let timestamp = env::block_timestamp() as u128;
    self.last_updated_rps = self.internal_calculate_rps();
    self.last_updated = timestamp;
  }

  // @private - This updates the user RPS and can only be called by the contract
  fn update_user_rps(&mut self, account_id: AccountId) {
    let user = self
      .user_map
      .get(&account_id.clone())
      .expect("Error user not found");

    self.user_map.insert(
      &account_id,
      &UserData {
        balance: user.balance,
        unclaimed_rewards: self
          .internal_calculate_user_rewards(account_id.clone(), self.last_updated_rps),
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

  // @public - This initializes the storage for the user
  #[payable]
  pub fn register_storage(&mut self, account_id: AccountId) {
    assert!(
      env::attached_deposit() == NEAR_AMOUNT_STORAGE,
      "The contract needs 0.01 NEAR to initialize your data"
    );

    if let Some(i) = self.user_map.get(&account_id) {
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

  // @public - This gets the resolved transaction and stores on the user data
  pub fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, msg: String) {
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
  use near_sdk::MockedBlockchain;
  use near_sdk::{testing_env, VMContext};

  // mock the context for testing, notice "signer_account_id" that was accessed above from env::
  fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
    VMContext {
      current_account_id: "alice_near".to_string(),
      signer_account_id: "bob_near".to_string(),
      signer_account_pk: vec![0, 1, 2],
      predecessor_account_id: "carol_near".to_string(),
      input,
      block_index: 0,
      block_timestamp: 0,
      account_balance: 0,
      account_locked_balance: 0,
      storage_usage: 0,
      attached_deposit: 0,
      prepaid_gas: 10u64.pow(18),
      random_seed: vec![0, 1, 2],
      is_view,
      output_data_receivers: vec![],
      epoch_height: 19,
    }
  }
}
