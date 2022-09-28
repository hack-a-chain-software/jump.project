use std::collections::HashMap;

use borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::AccountId;
use serde::Serialize;

use crate::types::{FungibleTokenBalance, NonFungibleTokenID};

#[derive(Serialize, BorshSerialize, BorshDeserialize)]
pub struct StakedNFT {
  pub token_id: NonFungibleTokenID,
  pub owner_id: AccountId,
  pub staked_timestamp: u64,
  pub balance: FungibleTokenBalance,
}

impl StakedNFT {
  pub fn new(token_id: NonFungibleTokenID, owner_id: AccountId, staked_timestamp: u64) -> Self {
    let balance = HashMap::new();

    StakedNFT {
      token_id,
      owner_id,
      staked_timestamp,
      balance,
    }
  }

  pub fn update_balance(&mut self, rewards: FungibleTokenBalance) {
    self.balance = rewards
      .iter()
      .map(|(k, v)| (k.clone(), v + self.balance.get(k).unwrap_or(&0)))
      .collect();
  }

  pub fn withdraw(&mut self) -> FungibleTokenBalance {
    let withdrawn_balance = HashMap::new().clone();

    for (_, v) in self.balance.iter_mut() {
      *v = 0;
    }

    withdrawn_balance
  }
}
