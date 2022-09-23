use near_sdk::{assert_one_yocto, env, json_types::U128, near_bindgen};

use crate::{
  treasury::TreasuryOperation,
  types::{FungibleTokenID, NFTCollection},
  Contract, ContractExt,
};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn move_collection_funds_to_distribution(
    &mut self,
    collection: NFTCollection,
    token_id: FungibleTokenID,
    amount: U128,
  ) {
    assert_one_yocto();

    self.move_treasury(
      TreasuryOperation::CollectionToDistribution,
      &env::predecessor_account_id(),
      &collection,
      token_id,
      Some(amount.0),
    );
  }
}
