use crate::{Contract, ContractExt, FungibleTokenID};
use near_sdk::{assert_one_yocto, env, near_bindgen, AccountId, Promise};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn withdraw_contract_treasury(&mut self, token_id: FungibleTokenID) -> Promise {
    assert_one_yocto();
    self.only_owner(&env::predecessor_account_id());
    self.only_contract_tokens(&token_id);

    let amount = self.contract_treasury.insert(token_id, 0).unwrap_or(0);
    Promise::new(self.owner.clone()).transfer(amount) // transferir tokens
  }

  #[payable]
  pub fn add_guardian(&mut self, guardian: AccountId) {
    assert_one_yocto();
    self.only_owner(&env::predecessor_account_id());

    self.guardians.insert(&guardian);
  }

  #[payable]
  pub fn remove_guardian(&mut self, guardian: AccountId) {
    assert_one_yocto();
    self.only_owner(&env::predecessor_account_id());

    self.guardians.remove(&guardian);
  }

  #[payable]
  pub fn add_contract_token(&mut self, new_contract_token: FungibleTokenID) {
    assert_one_yocto();
    self.only_owner(&env::predecessor_account_id());

    // TODO: create an index of program tokens and assert it's a non-program token

    self.contract_treasury.insert(new_contract_token, 0);
  }

  #[payable]
  pub fn remove_contract_token(&mut self, remove_contract_token: FungibleTokenID) {
    assert_one_yocto();
    self.only_owner(&env::predecessor_account_id());

    // TODO: withdraw the remaining balance
    /* edge-case:
     *  1. The contract has balance in a current contract token
     *  2. The token is removed by this function
     *  3. Some staking program is created with this token as a program token
     *  4. It becomes impossible to withdraw the remaining balance
     *
     *  This is very unlikely to happen, however it would be good to avoid this possibility.
     */

    self.contract_treasury.remove(&remove_contract_token);
  }
}
