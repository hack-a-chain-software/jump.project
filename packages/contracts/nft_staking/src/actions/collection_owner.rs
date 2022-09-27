use crate::constants::FT_TRANSFER_GAS;
use crate::ext_interfaces::ext_fungible_token;
use crate::treasury::TreasuryOperation;
use crate::types::*;
use crate::{Contract, ContractExt};
use near_sdk::json_types::U128;
use near_sdk::{assert_one_yocto, env, near_bindgen, Promise};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn move_beneficiary_funds_to_collection(
    &mut self,
    collection: NFTCollection,
    token_id: FungibleTokenID,
  ) {
    assert_one_yocto();

    self.move_treasury(
      TreasuryOperation::BeneficiaryToCollection,
      &env::predecessor_account_id(),
      &collection,
      token_id,
      None,
    );
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
