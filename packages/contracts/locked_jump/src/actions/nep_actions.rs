use crate::*;

#[near_bindgen]
impl FungibleTokenCore for Contract {
  #[payable]
  fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
    let initial_storage = env::storage_usage();
    self.only_minter(&env::predecessor_account_id());
    let mut account = self.internal_get_account(&receiver_id).expect(ERR_001);
    self
      .ft_functionality
      .ft_transfer(receiver_id.clone(), amount, memo);
    self.internal_add_vesting(&receiver_id, amount.0);
    account.track_storage_usage(initial_storage);
    self.internal_update_account(&receiver_id, &account);
  }

  #[payable]
  fn ft_transfer_call(
    &mut self,
    receiver_id: AccountId,
    amount: U128,
    memo: Option<String>,
    msg: String,
  ) -> PromiseOrValue<U128> {
    let initial_storage = env::storage_usage();
    self.only_minter(&env::predecessor_account_id());
    let mut account = self.internal_get_account(&receiver_id).expect(ERR_001);
    self.internal_add_vesting(&receiver_id, amount.0);
    account.track_storage_usage(initial_storage);
    self.internal_update_account(&receiver_id, &account);
    let promise = self
      .ft_functionality
      .ft_transfer_call(receiver_id, amount, memo, msg);

    promise
  }

  fn ft_total_supply(&self) -> U128 {
    self.ft_functionality.ft_total_supply()
  }

  fn ft_balance_of(&self, account_id: AccountId) -> U128 {
    self.ft_functionality.ft_balance_of(account_id)
  }
}

#[near_bindgen]
impl FungibleTokenResolver for Contract {
  #[private]
  fn ft_resolve_transfer(
    &mut self,
    sender_id: AccountId,
    receiver_id: AccountId,
    amount: U128,
  ) -> U128 {
    let (used_amount, burned_amount) =
      self
        .ft_functionality
        .internal_ft_resolve_transfer(&sender_id, receiver_id, amount);
    if burned_amount > 0 {
      self.on_tokens_burned(sender_id, burned_amount);
    }
    used_amount.into()
  }
}

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
  fn ft_metadata(&self) -> FungibleTokenMetadata {
    self.locked_token_metadata.get().unwrap()
  }
}
