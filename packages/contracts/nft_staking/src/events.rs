use crate::actions::guardian::CreateStakingProgramPayload;
use crate::staking::StakedNFT;
use crate::types::{FungibleTokenBalance, NonFungibleTokenID};
use near_sdk::log;
use near_sdk::serde::Serialize;
use near_sdk::serde_json::json;

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
  log_event(
    "unstake_nft",
    json!({ "token_id": nft_id, "withdrawn_balance": balance }),
  );
}