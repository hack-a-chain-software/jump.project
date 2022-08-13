use crate::{
  *,
  errors::{ERR_301, ERR_302},
};

#[near_bindgen]
impl Contract {
  pub fn view_deployment_cost(&self, contract_name: String) -> U128 {
    let binary = self.binaries.get(&contract_name).expect(ERR_301);
    binary.deployment_cost
  }

  pub fn view_storage_cost(&self, contract_name: String) -> U128 {
    let binary = self.binaries.get(&contract_name).expect(ERR_301);
    let storage_cost = self
      .storage_cost
      .get(&binary.contract_hash.into())
      .expect("Could not find this contract cost of deployment");
    storage_cost
  }

  pub fn view_storage_cost_near(&self, contract_name: String) -> U128 {
    let binary = self.binaries.get(&contract_name).expect(ERR_301);
    let storage_cost = self
      .storage_cost
      .get(&binary.contract_hash.into())
      .expect("Could not find this contract cost of deployment");
    U128(storage_cost.0 * env::storage_byte_cost())
  }

  pub fn view_binary(&self, contract_name: String) -> Binary {
    let binary = self.binaries.get(&contract_name).expect(ERR_301);
    binary
  }

  pub fn view_deployed_contract(&self, account: AccountId) -> String {
    let contract_type = self.deployed_contracts.get(&account).expect(ERR_302);
    contract_type
  }
}
