use crate::investor::Investor;
use crate::staking::StakingProgram;
use crate::types::*;
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, BorshStorageKey, PanicOnDefault};
use std::vec::Vec;

mod actions;
mod calc;
mod constants;
mod errors;
mod events;
mod ext_interfaces;
mod farm;
mod investor;
mod staking;
mod treasury;
mod types;

#[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize, PanicOnDefault)]
pub struct Contract {
  pub owner: AccountId,
  pub contract_tokens: UnorderedSet<FungibleTokenID>,
  pub contract_treasury: LookupMap<FungibleTokenID, u128>,
  pub guardians: UnorderedSet<AccountId>,
  pub investors: LookupMap<AccountId, Investor>,
  pub staking_programs: LookupMap<NFTCollection, StakingProgram>,
}

#[derive(BorshStorageKey, BorshSerialize)]
enum StorageKey {
  Guardians,
  Investors,
  ContractTokens,
  StakingPrograms,
  ContractTreasury,
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

    let mut contract_tokens_set = UnorderedSet::new(StorageKey::ContractTokens);
    let mut contract_treasury = LookupMap::new(StorageKey::ContractTreasury);
    for token_id in contract_tokens.iter() {
      contract_tokens_set.insert(token_id);
      contract_treasury.insert(token_id, &0u128);
    }

    Self {
      owner: owner_id,
      contract_tokens: contract_tokens_set,
      contract_treasury,
      guardians: UnorderedSet::new(StorageKey::Guardians),
      investors: LookupMap::new(StorageKey::Investors),
      staking_programs: LookupMap::new(StorageKey::StakingPrograms),
    }
  }
}
