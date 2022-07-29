use crate::actions::transfer::FTRoutePayload;
use crate::{Contract, ContractExt, FungibleTokenID};
use near_sdk::{assert_one_yocto, env, near_bindgen, AccountId, Promise};

impl Contract {
  #[inline]
  fn only_owner(&self, account_id: AccountId) {
    assert_eq!(account_id, self.owner, "Only owner can call this function")
  }

  pub fn deposit_contract_treasury(&mut self, payload: FTRoutePayload) {
    self.only_owner(payload.sender_id);

    let treasury_amount = self.contract_treasury.get(&payload.token_id).unwrap_or(0);

    self
      .contract_treasury
      .insert(&payload.token_id, &(treasury_amount + payload.amount));
  }
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn withdraw_treasury(&mut self) -> Promise {
    self.only_owner(env::predecessor_account_id());
    assert_one_yocto();

    // self.contract_treasury
    Promise::new(self.owner.clone()).transfer(0) // transferir tokens
  }

  #[payable]
  pub fn add_guardian(&mut self, guardian: AccountId) {
    self.only_owner(env::predecessor_account_id());
    assert_one_yocto();

    self.guardians.insert(&guardian);
  }

  #[payable]
  pub fn remove_guardian(&mut self, guardian: AccountId) {
    self.only_owner(env::predecessor_account_id());
    assert_one_yocto();

    self.guardians.remove(&guardian);
  }

  #[payable]
  pub fn add_contract_token(&mut self, new_contract_token: FungibleTokenID) {
    self.only_owner(env::predecessor_account_id());
    assert_one_yocto();

    self.contract_tokens.insert(&new_contract_token);
  }

  #[payable]
  pub fn remove_contract_token(&mut self, remove_contract_token: FungibleTokenID) {
    self.only_owner(env::predecessor_account_id());
    assert_one_yocto();

    self.contract_tokens.remove(&remove_contract_token);
  }
}
