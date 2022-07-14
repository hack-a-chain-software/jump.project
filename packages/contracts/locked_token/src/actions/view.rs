use crate::*;

#[near_bindgen]
impl Contract {
  pub fn view_vesting_vector_len(&self, account_id: AccountId) -> U64 {
    match self.vesting_schedules.get(&account_id) {
      Some(vesting_vector) => U64(vesting_vector.len()),
      None => U64(0),
    }
  }

  pub fn view_vesting_paginated(
    &self,
    account_id: AccountId,
    initial_id: U64,
    size: U64,
  ) -> Vec<Vesting> {
    match self.vesting_schedules.get(&account_id) {
      Some(vesting_vector) => vesting_vector
        .iter()
        .skip(initial_id.0 as usize)
        .take(size.0 as usize)
        .collect(),
      None => Vec::new(),
    }
  }

  pub fn view_contract_data(&self) -> ContractConfig {
    self.contract_config.get().unwrap()
  }

  pub fn view_minters_len(&self) -> U64 {
    U64(self.minters.len())
  }

  pub fn view_minters(&self, initial_id: U64, size: U64) -> Vec<AccountId> {
    self
      .minters
      .iter()
      .skip(initial_id.0 as usize)
      .take(size.0 as usize)
      .collect()
  }

  pub fn view_user(&self, account_id: AccountId) -> Option<Account> {
    self.users.get(&account_id)
  }
}
