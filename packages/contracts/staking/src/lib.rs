use crate::user_data::UserData;
use core::assert;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
pub use near_sdk::json_types::U128;
pub use near_sdk::serde_json::{self, json, Value};
pub use near_sdk::utils::assert_one_yocto;
use near_sdk::{env, ext_contract, near_bindgen, setup_alloc, AccountId, Gas, Promise};

pub(crate) mod errors;
pub mod rps;
pub mod staking;
pub mod storage;
pub mod user_data;

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
    assert!(!env::state_exists());
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );

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
}

#[cfg(test)]
mod tests {
  use super::*;
  use near_sdk::MockedBlockchain;
  use near_sdk::{testing_env, VMContext};

  pub const CONTRACT_ACCOUNT: &str = "contract.testnet";
  pub const TOKEN_ACCOUNT: &str = "token.testnet";
  pub const SIGNER_ACCOUNT: &str = "signer.testnet";
  pub const OWNER_ACCOUNT: &str = "owner.testnet";

  // mock the context for testing, notice "signer_account_id" that was accessed above from env::
  pub fn get_context(
    input: Vec<u8>,
    is_view: bool,
    attached_deposit: u128,
    account_balance: u128,
    signer_id: AccountId,
  ) -> VMContext {
    VMContext {
      current_account_id: CONTRACT_ACCOUNT.to_string(),
      signer_account_id: signer_id.clone(),
      signer_account_pk: vec![0, 1, 2],
      predecessor_account_id: signer_id.clone(),
      input,
      block_index: 0,
      block_timestamp: 1000,
      account_balance,
      account_locked_balance: 0,
      storage_usage: 0,
      attached_deposit,
      prepaid_gas: 10u64.pow(18),
      random_seed: vec![0, 1, 2],
      is_view,
      output_data_receivers: vec![],
      epoch_height: 19,
    }
  }

  pub fn sample_contract() -> StakingFT {
    StakingFT {
      owner: OWNER_ACCOUNT.to_string(),
      token_address: TOKEN_ACCOUNT.to_string(),
      period_duration: 100,
      user_map: LookupMap::new(b"a".to_vec()),
      last_updated: 0,
      last_updated_rps: 0,
      yield_per_period: 1,
    }
  }

  #[test]
  fn test_constructor() {
    let base_deposit = 0;
    let context = get_context(vec![], false, base_deposit, 0, OWNER_ACCOUNT.to_string());
    testing_env!(context);

    let call_instanciation = StakingFT::initialize_staking(
      OWNER_ACCOUNT.to_string(),
      TOKEN_ACCOUNT.to_string(),
      U128(1),
      U128(100),
    );

    let manual_instanciation = sample_contract();

    assert_eq!(manual_instanciation.owner, call_instanciation.owner);
    assert_eq!(
      manual_instanciation.token_address,
      call_instanciation.token_address
    );
    assert_eq!(
      manual_instanciation.period_duration,
      call_instanciation.period_duration
    );
    assert_eq!(
      manual_instanciation.last_updated,
      call_instanciation.last_updated
    );
    assert_eq!(
      manual_instanciation.last_updated_rps,
      call_instanciation.last_updated_rps
    );
    assert_eq!(
      manual_instanciation.yield_per_period,
      call_instanciation.yield_per_period
    );
  }
}
