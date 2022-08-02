use near_sdk::log;
use near_sdk::serde::Serialize;
use near_sdk::serde_json::json;

use crate::{
  actions::guardian::CreateStakingProgramPayload,
  staking::StakedNFT,
  types::{FungibleTokenBalance, NonFungibleTokenID, SerializableFungibleTokenBalance},
};

fn log_event<T: Serialize>(event: &str, data: T) {
  let event = json!({
      "standard": "nft_staking",
      "version": "1.0.0",
      "event": event,
      "data": [data]
  });

  log!("EVENT_JSON:{}", event.to_string());
}

pub fn create_staking_program(payload: CreateStakingProgramPayload) {
  log_event("create_staking_program", payload)
}

pub fn update_staking_program<T: Serialize>(updates: T) {
  log_event("update_staking_program", updates);
}

pub fn stake_nft(staked_nft: &StakedNFT) {
  log_event("stake_nft", staked_nft);
}

pub fn unstake_nft(nft_id: &NonFungibleTokenID, balance: FungibleTokenBalance) {
  let event = json!({
    "token_id": nft_id,
    "withdrawn_balance": SerializableFungibleTokenBalance(balance)
  });

  log_event("unstake_nft", event);
}
