use std::collections::HashMap;

use near_sdk::{
  json_types::{U128, U64},
  near_bindgen, AccountId,
};
use serde::{Deserialize, Serialize};

use crate::{
  farm::{Farm, RewardsDistribution},
  staking::StakingProgram,
  types::{FungibleTokenBalance, FungibleTokenID, NFTCollection, NonFungibleTokenID},
  Contract, ContractExt,
};

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

#[near_bindgen]
impl Contract {
  //retornar o staking program / farm -> round_rewards e saldo pra ver quanto tempo vai durar a farm
  pub fn view_staking_program(
    &self,
    collection: NFTCollection,
  ) -> Option<SerializableStakingProgram> {
    self.staking_programs.get(&collection).map(From::from)
  }

  pub fn view_staked_nft_balance(&self, nft_id: NonFungibleTokenID) -> FungibleTokenBalance {
    let collection = &nft_id.0;
    let staking_program = self.staking_programs.get(collection).unwrap();

    let staked_nft = staking_program.staked_nfts.get(&nft_id).unwrap();

    let unclaimed_token_balance = staking_program.farm.unclaimed_token_balance(&nft_id);

    let mut balance = HashMap::new();
    for (ft_id, &claimed) in staked_nft.balance.iter() {
      let unclaimed = *unclaimed_token_balance.get(ft_id).unwrap();

      balance.insert(ft_id.clone(), claimed + unclaimed);
    }

    balance
  }

  //retornar saldos do contract treasury

  pub fn view_guardians(&self, from_index: Option<u16>, limit: Option<u16>) -> Vec<String> {
    let from_index: usize = from_index.map(From::from).unwrap_or(0);
    let limit: usize = limit.map(From::from).unwrap_or(usize::MAX);

    self
      .guardians
      .iter()
      .skip(from_index)
      .take(limit)
      .map(From::from)
      .collect()
  }

  pub fn view_staked(
    &self,
    collection: NFTCollection,
    account_id: Option<AccountId>,
    from_index: Option<u64>,
    limit: Option<u16>,
  ) -> Vec<String> {
    let staking_program = self.staking_programs.get(&collection).unwrap();
    let from_index: u64 = from_index.map(From::from).unwrap_or(0);
    let limit: usize = limit.map(From::from).unwrap_or(usize::MAX);

    match account_id {
      None => staking_program
        .staked_nfts
        .keys()
        .skip(from_index as usize)
        .take(limit)
        .map(|(_, id)| id)
        .collect(),
      Some(owner_id) => {
        match staking_program
        .nfts_by_owner
        .get(&owner_id) {
          Some(nfts) => nfts.iter()
          .skip(from_index as usize)
          .take(limit)
          .map(|(_, id)| id)
          .collect(),
          None => vec![]
        }
        },
    }
  }
}
