use std::collections::HashMap;

use near_sdk::{
  json_types::{U128, U64},
  serde::{Deserialize, Serialize},
  AccountId,
};

use crate::{
  farm::{Farm, RewardsDistribution},
  staking::StakingProgram,
};

use super::tokens::{FungibleTokenBalance, FungibleTokenID, NFTCollection};

#[derive(Serialize)]
pub struct SerializableStakingProgram {
  pub collection: NFTCollection,
  pub collection_owner: AccountId,
  pub collection_treasury: FungibleTokenBalance,
  pub token_address: AccountId,

  pub farm: SerializableFarm,
  pub min_staking_period: U64,
  pub early_withdraw_penalty: U128,
}

impl From<StakingProgram> for SerializableStakingProgram {
  fn from(staking_program: StakingProgram) -> Self {
    Self {
      collection: staking_program.collection,
      collection_owner: staking_program.collection_owner,
      early_withdraw_penalty: U128(staking_program.early_withdraw_penalty),
      min_staking_period: U64(staking_program.min_staking_period),
      token_address: staking_program.token_address,
      collection_treasury: staking_program.collection_treasury,

      farm: staking_program.farm.into(),
    }
  }
}

#[derive(Serialize, Deserialize)]
pub struct SerializableFarm {
  pub round_interval: u32,
  pub start_at: u32,
  pub distributions: HashMap<FungibleTokenID, RewardsDistribution>,
}

impl From<Farm> for SerializableFarm {
  fn from(farm: Farm) -> Self {
    Self {
      round_interval: farm.round_interval,
      start_at: farm.start_at,
      distributions: farm.distributions,
    }
  }
}
