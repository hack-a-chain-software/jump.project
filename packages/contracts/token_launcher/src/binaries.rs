use crate::*;
use near_sdk::json_types::U128;
///TO-DO: Cost of deployment
/// Calculate binary size
///

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Binary {
  pub contract_name: String,
  pub contract_hash: CryptoHash,
  pub deployment_cost: U128,
  pub init_fn_name: String,
  pub init_fn_params: String,
}

impl Binary {
  pub fn new(
    contract_name: String,
    contract_hash: CryptoHash,
    deployment_cost: U128,
    init_fn_name: String,
    init_fn_params: String,
  ) -> Self {
    Self {
      contract_name,
      contract_hash,
      deployment_cost,
      init_fn_name,
      init_fn_params,
    }
  }

  pub fn change_binary(
    &mut self,
    contract_name: String,
    contract_hash: CryptoHash,
    deployment_cost: U128,
    init_fn_name: String,
    init_fn_params: String,
  ) {
    self.contract_name = contract_name;
    self.contract_hash = contract_hash;
    self.deployment_cost = deployment_cost;
    self.init_fn_name = init_fn_name;
    self.init_fn_params = init_fn_params;
  }

  pub fn change_deployment_cost(&mut self, deployment_cost: U128) {
    self.deployment_cost = deployment_cost;
  }
}
