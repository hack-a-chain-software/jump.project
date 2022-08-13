use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap};
use near_sdk::json_types::{Base58CryptoHash, U128};
use near_sdk::{near_bindgen, BorshStorageKey, env, sys, AccountId, CryptoHash, PanicOnDefault};

use binaries::Binary;
use crate::errors::{ERR_001, ERR_003};
use crate::events::event_new_contract_registered; //, ERR_002};

pub mod actions;
pub mod binaries;
pub mod errors;
pub mod events;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
  pub owner: AccountId,
  /// Map of all the contracts available for deployment - Key: contract_name
  pub binaries: LookupMap<String, Binary>,
  /// Cost of storage for deployment of each contract
  pub storage_cost: LookupMap<Base58CryptoHash, U128>,
  ///AccountID where contract was deployed and the name of the contract
  pub deployed_contracts: LookupMap<AccountId, String>,
}

#[derive(BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
  Binaries,
  DeployedContracts,
  CostPerHash,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(owner: AccountId) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    assert!(
      env::is_valid_account_id(owner.as_bytes()),
      "Invalid owner account"
    );

    Self {
      owner,
      binaries: LookupMap::new(StorageKey::Binaries),
      storage_cost: LookupMap::new(StorageKey::CostPerHash),
      deployed_contracts: LookupMap::new(StorageKey::DeployedContracts),
    }
  }
}

//utils
impl Contract {
  pub fn only_owner(&self) {
    assert_eq!(env::predecessor_account_id(), self.owner, "{}", ERR_001);
  }
}

#[near_bindgen]
impl Contract {
  /// Register the memorry hash of as wasm that was saved on chain
  /// to the factory 'binaries' struct -this allows to access the contract more easily
  pub fn register_contract(
    &mut self,
    contract_name: String,
    contract_hash: Base58CryptoHash,
    contract_cost: U128,
    init_fn_name: String,
    init_fn_params: String,
  ) {
    assert!(
      !self.binaries.contains_key(&contract_name.clone()),
      "{}",
      ERR_003
    );

    let new_binary = Binary::new(
      contract_name.clone(),
      contract_hash.into(),
      contract_cost,
      init_fn_name,
      init_fn_params,
    );

    self.binaries.insert(&contract_name, &new_binary);
    event_new_contract_registered(contract_name.as_str(), contract_hash);
  }
}
