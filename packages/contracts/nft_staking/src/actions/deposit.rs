use crate::{
  actions::token_transfer::FTRoutePayload, funds::deposit::DepositOperation, types::NFTCollection,
  Contract,
};

impl Contract {
  pub fn deposit_collection_funds(&mut self, payload: FTRoutePayload, collection: NFTCollection) {
    self.deposit(
      DepositOperation::CollectionTreasury {
        collection,
        token_id: payload.token_id,
        amount: payload.amount,
      },
      &payload.sender_id,
    );
  }

  pub fn deposit_contract_funds(&mut self, payload: FTRoutePayload) {
    self.deposit(
      DepositOperation::ContractTreasury {
        token_id: payload.token_id,
        amount: payload.amount,
      },
      &payload.sender_id,
    );
  }
}
