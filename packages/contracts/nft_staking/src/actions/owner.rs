use crate::{
  constants::{COMPENSATE_GAS, FT_TRANSFER_GAS},
  errors::ERR_INSUFFICIENT_CONTRACT_TREASURY,
  ext_interfaces::{ext_fungible_token, ext_self},
  funds::deposit::DepositOperation,
  Contract, ContractExt, FungibleTokenID,
};
use near_sdk::{assert_one_yocto, env, json_types::U128, near_bindgen, AccountId, Promise};

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn withdraw_contract_treasury(&mut self, token_id: FungibleTokenID, amount: U128) -> Promise {
    let caller_id = env::predecessor_account_id();

    assert_one_yocto();
    self.only_owner(&caller_id);
    self.only_contract_tokens(&token_id);

    let balance = self.contract_treasury.entry(token_id.clone()).or_insert(0);
    assert!(*balance >= amount.0, "{ERR_INSUFFICIENT_CONTRACT_TREASURY}");
    *balance -= amount.0;

    ext_fungible_token::ext(token_id.clone())
      .with_static_gas(FT_TRANSFER_GAS)
      .with_attached_deposit(1)
      .ft_transfer(caller_id, amount, None)
      .then(
        ext_self::ext(env::current_account_id())
          .with_static_gas(COMPENSATE_GAS)
          .compensate_withdraw_treasury(DepositOperation::ContractTreasury, token_id, amount),
      )
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
