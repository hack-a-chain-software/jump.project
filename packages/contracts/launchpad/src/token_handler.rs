use near_sdk::{AccountId, Promise, Gas};
use near_sdk::json_types::{U128};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize};

use crate::ext_interface::{ext_fungible_token};

pub const GAS_FOR_FT_TRANSFER: Gas = Gas(20_000_000_000_000);

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum TokenType {
  FT { account_id: AccountId },
}

impl TokenType {
  pub fn transfer_token(&self, receiver_id: AccountId, quantity: u128) -> Promise {
    match self {
      FT => ext_fungible_token::ext(receiver_id.clone())
        .with_static_gas(GAS_FOR_FT_TRANSFER)
        .with_attached_deposit(1)
        .ft_transfer(receiver_id, U128(quantity), None),
      _ => unimplemented!()
    }
  }
}
