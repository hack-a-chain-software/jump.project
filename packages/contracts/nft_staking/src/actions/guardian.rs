use crate::events;
use crate::farm::Farm;
use crate::staking::StakingProgram;
use crate::treasury;
use crate::types::*;
use crate::{Contract, ContractExt};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{assert_one_yocto, env, near_bindgen, AccountId};
use serde_json::json;
use std::collections::HashMap;

impl Contract {
  #[inline]
  fn only_guardians(&self, account_id: AccountId) {
    assert!(
      self.guardians.contains(&account_id),
      "Only guardians can call this function"
    );
  }

  #[inline]
  fn only_contract_tokens(&self, token_id: &FungibleTokenID) {
    assert!(
      self.contract_tokens.contains(token_id),
      "Guardians can only operate on contract tokens"
    )
  }

  #[inline]
  fn only_non_contract_tokens(&self, token_id: &FungibleTokenID) {
    assert!(
      !self.contract_tokens.contains(token_id),
      "Staking program token cannot be a contract token"
    );
  }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct CreateStakingProgramPayload {
  pub collection_address: AccountId,
  pub collection_owner: AccountId,
  pub token_address: AccountId,
  pub collection_rps: HashMap<FungibleTokenID, u128>,
  pub min_staking_period: u64,
  pub early_withdraw_penalty: u128,
  pub round_interval: u32,
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn create_staking_program(&mut self, payload: CreateStakingProgramPayload) {
    let event_payload = payload.clone();

    self.only_guardians(env::predecessor_account_id());
    self.only_non_contract_tokens(&payload.token_address);
    assert_one_yocto();

    let collection = NFTCollection::NFTContract {
      account_id: payload.collection_address.clone(),
    };

    assert!(!self.staking_programs.contains_key(&collection), "collection already");

    let farm = Farm::new(
      collection.clone(),
      payload.collection_rps,
      payload.round_interval,
    );

    let staking_program = StakingProgram::new(
      farm,
      collection.clone(),
      payload.collection_owner,
      payload.token_address,
      payload.min_staking_period,
      payload.early_withdraw_penalty,
    );

    self.staking_programs.insert(&collection, &staking_program);

    events::create_staking_program(event_payload);
  }

  #[payable]
  pub fn alter_withdraw_penalty(&mut self, collection: NFTCollection, new_penalty: U128) {
    self.only_guardians(env::predecessor_account_id());
    assert_one_yocto();

    let mut staking_program = self.staking_programs.get(&collection).unwrap();

    staking_program.early_withdraw_penalty = new_penalty.0;
    self.staking_programs.insert(&collection, &staking_program);

    events::update_staking_program(json!({ "early_withdraw_penalty": new_penalty.0 }));
  }

  #[payable]
  pub fn alter_staking_period(&mut self, collection: NFTCollection, new_period: u64) {
    self.only_guardians(env::predecessor_account_id());
    assert_one_yocto();

    let mut staking_program = self.staking_programs.get(&collection).unwrap();

    staking_program.min_staking_period = new_period;
    self.staking_programs.insert(&collection, &staking_program);

    events::update_staking_program(json!({ "min_staking_period": new_period }));
  }

  #[payable]
  pub fn move_contract_funds_to_collection(
    &mut self,
    collection: NFTCollection,
    token_id: FungibleTokenID,
    amount: U128,
  ) {
    self.only_guardians(env::predecessor_account_id());
    self.only_contract_tokens(&token_id);
    assert_one_yocto();

    self.realocate_treasury(
      &collection,
      token_id,
      treasury::Operation::ContractToCollection,
      amount.0,
    );
  }

  #[payable]
  pub fn move_collection_funds_to_contract(
    &mut self,
    collection: NFTCollection,
    token_id: FungibleTokenID,
    amount: U128,
  ) {
    self.only_guardians(env::predecessor_account_id());
    self.only_contract_tokens(&token_id);
    assert_one_yocto();

    self.realocate_treasury(
      &collection,
      token_id,
      treasury::Operation::CollectionToContract,
      amount.0,
    );
  }
}
