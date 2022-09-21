use crate::events;
use crate::farm::Farm;
use crate::staking::StakingProgram;
use crate::treasury::TreasuryOperation;
use crate::types::*;
use crate::{Contract, ContractExt};
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{assert_one_yocto, env, near_bindgen, AccountId};
use serde_json::json;
use std::collections::HashMap;

#[derive(Clone, Serialize, Deserialize)]
pub struct CreateStakingProgramPayload {
  pub collection_address: AccountId,
  pub collection_owner: AccountId,
  pub token_address: AccountId,
  pub collection_rps: HashMap<FungibleTokenID, U128>,
  pub min_staking_period: U64,
  pub early_withdraw_penalty: U128,
  pub round_interval: u64, // amount of miliseconds between rounds
  pub start_in: u64,       // amount of miliseconds until the farm starts
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn create_staking_program(&mut self, payload: CreateStakingProgramPayload) {
    let event_payload = payload.clone();

    assert_one_yocto();
    self.only_guardians(&env::predecessor_account_id());
    self.only_non_contract_tokens(&payload.token_address);

    let collection = NFTCollection::NFTContract {
      account_id: payload.collection_address,
    };

    assert!(
      !self.staking_programs.contains_key(&collection),
      "staking program already created"
    );

    let collection_rps = payload
      .collection_rps
      .iter()
      .map(|(k, v)| (k.clone(), v.0))
      .collect();

    let start_at = env::block_timestamp_ms() + payload.start_in;

    let farm = Farm::new(
      collection.clone(),
      collection_rps,
      payload.round_interval,
      start_at,
    );

    let staking_program = StakingProgram::new(
      farm,
      collection.clone(),
      payload.collection_owner,
      payload.token_address,
      payload.min_staking_period.0,
      payload.early_withdraw_penalty.0,
    );

    self.staking_programs.insert(&collection, &staking_program);

    events::create_staking_program(event_payload);
  }

  #[payable]
  pub fn alter_withdraw_penalty(&mut self, collection: NFTCollection, new_penalty: U128) {
    assert_one_yocto();
    self.only_guardians(&env::predecessor_account_id());

    let mut staking_program = self.staking_programs.get(&collection).unwrap();

    staking_program.early_withdraw_penalty = new_penalty.0;
    self.staking_programs.insert(&collection, &staking_program);

    events::update_staking_program(json!({ "early_withdraw_penalty": new_penalty.0 }));
  }

  #[payable]
  pub fn alter_staking_period(&mut self, collection: NFTCollection, new_period: u64) {
    assert_one_yocto();
    self.only_guardians(&env::predecessor_account_id());

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
    assert_one_yocto();

    self.move_treasury(
      TreasuryOperation::ContractToCollection {
        amount: Some(amount.0),
      },
      &env::predecessor_account_id(),
      &collection,
      token_id,
    );
  }

  #[payable]
  pub fn move_collection_funds_to_contract(
    &mut self,
    collection: NFTCollection,
    token_id: FungibleTokenID,
    amount: U128,
  ) {
    assert_one_yocto();

    self.move_treasury(
      TreasuryOperation::CollectionToContract {
        amount: Some(amount.0),
      },
      &env::predecessor_account_id(),
      &collection,
      token_id,
    );
  }
}
