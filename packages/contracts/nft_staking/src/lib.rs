use crate::investor::Investor;
use crate::staking::StakingProgram;
use crate::types::*;
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, BorshStorageKey, PanicOnDefault};
use std::collections::HashMap;
use std::vec::Vec;

mod actions;
mod auth;
mod calc;
mod constants;
mod errors;
mod events;
mod ext_interfaces;
mod farm;
mod funds;
mod investor;
mod staking;
mod types;

#[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize, PanicOnDefault)]
pub struct Contract {
  pub owner: AccountId,
  pub contract_treasury: FungibleTokenBalance,
  pub guardians: UnorderedSet<AccountId>,
  pub investors: LookupMap<AccountId, Investor>,
  pub staking_programs: LookupMap<NFTCollection, StakingProgram>,
}

#[derive(BorshStorageKey, BorshSerialize)]
enum StorageKey {
  Guardians,
  Investors,
  StakingPrograms,
  StakingProgramField {
    collection: NFTCollection,
    counter: u8,
  },
  FarmField {
    collection: NFTCollection,
    counter: u8,
  },
  NFTsByOwner {
    collection: NFTCollection,
    owner_id: AccountId,
  },
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(owner_id: AccountId, contract_tokens: Vec<FungibleTokenID>) -> Self {
    assert!(!env::state_exists(), "Already initialized");

    let mut contract_treasury = HashMap::new();
    for token_id in contract_tokens.iter() {
      contract_treasury.insert(token_id.clone(), 0u128);
    }

    Self {
      owner: owner_id,
      contract_treasury,
      guardians: UnorderedSet::new(StorageKey::Guardians),
      investors: LookupMap::new(StorageKey::Investors),
      staking_programs: LookupMap::new(StorageKey::StakingPrograms),
    }
  }
}
