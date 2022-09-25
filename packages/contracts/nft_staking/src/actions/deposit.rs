use near_sdk::env;
use crate::{
  actions::transfer::FTRoutePayload, treasury::TreasuryOperation, types::NFTCollection, Contract,
};

impl Contract {
  pub fn deposit_distribution_funds(&mut self, payload: FTRoutePayload, collection: NFTCollection) {
    self.move_treasury(
      TreasuryOperation::DepositToDistribution,
      &payload.sender_id,
      &collection,
      payload.token_id,
      Some(payload.amount),
    );
  }

  pub fn deposit_contract_funds(&mut self, payload: FTRoutePayload) {
    self.move_treasury(
      TreasuryOperation::DepositToContract,
      &payload.sender_id,
      // pass dummy collection as it is not relevant for contract_funds deposit
      &NFTCollection::NFTContract { account_id: env::current_account_id() },
      payload.token_id,
      Some(payload.amount),
    );
  }
}
