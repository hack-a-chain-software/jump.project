use crate::actions::transfer::FTRoutePayload;
use crate::constants::FT_TRANSFER_GAS;
use crate::ext_interfaces::ext_fungible_token;
use crate::staking::{FundsOperation, StakingProgram};
use crate::types::*;
use crate::{Contract, ContractExt};
use near_sdk::json_types::U128;
use near_sdk::{assert_one_yocto, env, near_bindgen, AccountId, Promise};

impl StakingProgram {
  #[inline]
  fn only_collection_owner(&self, account_id: &AccountId) {
    assert_eq!(
      account_id, &self.collection_owner,
      "Only collection owner may call this function",
    );
  }

  #[inline]
  fn only_program_token(&self, token_id: &FungibleTokenID) {
    assert_eq!(
      token_id, &self.token_address,
      "Collection owner may only operate on program token"
    );
  }
}

impl Contract {
  pub fn deposit_distribution_funds(&mut self, payload: FTRoutePayload, collection: NFTCollection) {
    let token_id = payload.token_id;
    let amount = payload.amount;
    let account_id = payload.sender_id;

    let mut staking_program = self.staking_programs.get(&collection).unwrap();
    staking_program.only_collection_owner(&account_id);
    staking_program.only_program_token(&token_id);
    staking_program.deposit_distribution_funds(&token_id, amount);

    self.staking_programs.insert(&collection, &staking_program);
  }
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn move_funds(
    &mut self,
    collection: NFTCollection,
    op: FundsOperation,
    token_id: FungibleTokenID,
  ) {
    assert_one_yocto();
    let account_id = env::predecessor_account_id();

    let mut staking_program = self.staking_programs.get(&collection).unwrap();
    staking_program.only_collection_owner(&account_id);
    staking_program.only_program_token(&token_id);

    staking_program.move_funds(token_id, op);
  }

  #[payable]
  pub fn withdraw_collection_treasury(
    &mut self,
    collection: NFTCollection,
    token_id: FungibleTokenID,
  ) -> Promise {
    assert_one_yocto();
    let account_id = env::predecessor_account_id();

    let mut staking_program = self.staking_programs.get(&collection).unwrap();
    staking_program.only_collection_owner(&account_id);
    staking_program.only_program_token(&token_id);

    let amount = staking_program.withdraw_collection_treasury(token_id.clone());

    ext_fungible_token::ext(token_id)
      .with_static_gas(FT_TRANSFER_GAS)
      .with_attached_deposit(1)
      .ft_transfer(account_id.clone(), U128(amount), None)
  }
}
