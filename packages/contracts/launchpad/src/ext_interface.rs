use near_sdk::json_types::{U128, U64};
use near_sdk::{ext_contract, AccountId};

#[ext_contract(ext_fungible_token)]
pub trait FunglibleToken {
  fn ft_transfer(receiver_id: AccountId, amount: U128, memo: Option<String>);

  fn ft_transfer_call(receiver_id: AccountId, amount: U128, memo: Option<String>, msg: String);
}

#[ext_contract(ext_self)]
pub trait SelfCalls {
  fn callback_token_transfer_to_project_owner(listing_id: U64, old_value: U128, field: String);

  fn callback_token_transfer_to_investor(
    investor_id: AccountId,
    listing_id: U64,
    allocations: U64,
    returned_value: U128,
    field: String,
  );
}
