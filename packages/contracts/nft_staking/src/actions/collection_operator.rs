use crate::{
  funds::transfer::TransferOperation,
  types::{FungibleTokenID, NFTCollection},
  Contract, ContractExt,
};

use near_sdk::{assert_one_yocto, env, json_types::U128, near_bindgen};

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
      TransferOperation::CollectionToDistribution,
      &env::predecessor_account_id(),
      &collection,
      token_id,
      Some(amount.0),
    );
  }
}
