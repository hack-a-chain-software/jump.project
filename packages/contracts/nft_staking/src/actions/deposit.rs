use crate::{
  actions::transfer::FTRoutePayload, treasury::TreasuryOperation, types::NFTCollection, Contract,
};

impl Contract {
  pub fn deposit_distribution_funds(&mut self, payload: FTRoutePayload, collection: NFTCollection) {
    self.move_treasury(
      TreasuryOperation::DepositToDistribution,
      &payload.sender_id,
      Some(&collection),
      payload.token_id,
      Some(payload.amount),
    );
  }

  pub fn deposit_contract_funds(&mut self, payload: FTRoutePayload) {
    self.move_treasury(
      TreasuryOperation::DepositToContract,
      &payload.sender_id,
      None,
      payload.token_id,
      Some(payload.amount),
    );
  }
}
