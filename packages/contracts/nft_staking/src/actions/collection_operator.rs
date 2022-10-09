use crate::{
  funds::transfer::TransferOperation,
  types::{FungibleTokenID, NFTCollection},
  Contract, ContractExt,
};

use near_sdk::{assert_one_yocto, env, json_types::U128, near_bindgen};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn transfer(
    &mut self,
    operation: TransferOperation,
    collection: NFTCollection,
    token_id: FungibleTokenID,
    amount: Option<U128>,
  ) {
    assert_one_yocto();

    let operator = env::predecessor_account_id();

    self.transfer_funds(
      operation,
      &operator,
      &collection,
      token_id,
      amount.map(|x| x.0),
    );
  }
}
