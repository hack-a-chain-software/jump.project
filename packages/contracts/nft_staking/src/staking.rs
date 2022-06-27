use crate::constants::DENOM;
use crate::farm::Farm;
use crate::types::*;
use crate::StorageKey;
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, AccountId};

#[derive(Serialize, Deserialize)]
pub enum FundsOperation {
  TreasuryToDistribution { amount: u128 },
  DistributionToTreasury,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct StakedNFT {
  pub token_id: NonFungibleTokenID,
  pub owner_id: AccountId,
  pub staked_timestamp: u64,

  pub balance: FungibleTokenBalance,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct StakingProgram {
  pub collection: NFTCollection,
  pub collection_owner: AccountId,
  pub collection_treasury: FungibleTokenBalance,
  pub token_address: AccountId,

  pub farm: Farm,
  pub min_staking_period: u64,
  pub early_withdraw_penalty: u128,

  pub staked_nfts: UnorderedMap<NonFungibleTokenID, StakedNFT>,
  pub stakers_balances: LookupMap<AccountId, FungibleTokenBalance>,
  pub nfts_by_owner: LookupMap<AccountId, UnorderedSet<NonFungibleTokenID>>,
}

// TODO: turn this into a macro
fn get_key_closure(collection: NFTCollection) -> impl FnMut() -> StorageKey {
  let mut counter = 0;
  move || {
    counter += 1;
    StorageKey::StakingProgramField {
      collection: collection.clone(),
      counter,
    }
  }
}

impl StakingProgram {
  pub fn new(
    farm: Farm,
    collection: NFTCollection,
    collection_owner: AccountId,
    token_address: FungibleTokenID,
    min_staking_period: u64,
    early_withdraw_penalty: u128,
  ) -> Self {
    let mut get_key = get_key_closure(collection.clone());

    StakingProgram {
      collection,
      collection_owner,
      collection_treasury: UnorderedMap::new(get_key()),
      farm,
      token_address,
      min_staking_period,
      early_withdraw_penalty,

      staked_nfts: UnorderedMap::new(get_key()),
      stakers_balances: LookupMap::new(get_key()),
      nfts_by_owner: LookupMap::new(get_key()),
    }
  }

  pub fn stake_nft(&mut self, token_id: NonFungibleTokenID, owner_id: &AccountId) {
    let staked_nft = StakedNFT {
      token_id: token_id.clone(),
      owner_id: owner_id.clone(),
      staked_timestamp: env::block_timestamp(),
      balance: UnorderedMap::new(StorageKey::StakedNFT(token_id.clone())),
    };

    self.staked_nfts.insert(&token_id, &staked_nft);

    let mut nfts_by_owner = self.nfts_by_owner.get(&owner_id).unwrap_or_else(|| {
      UnorderedSet::new(StorageKey::NFTsByOwner {
        collection: self.collection.clone(),
        owner_id: owner_id.clone(),
      })
    });

    nfts_by_owner.insert(&token_id);
    self.nfts_by_owner.insert(&owner_id, &nfts_by_owner);

    self.farm.add_nft(&token_id);
  }

  pub fn unstake_nft(&mut self, token_id: &NonFungibleTokenID, owner_id: &AccountId) {
    self.staked_nfts.remove(token_id);
    self.nfts_by_owner.get(owner_id).unwrap().remove(token_id);
    self.farm.nfts_rps.remove(token_id);
  }

  pub fn claim_rewards(&mut self, token_id: &NonFungibleTokenID) -> StakedNFT {
    let rewards = self.farm.claim(token_id);

    let mut staked_nft = self.staked_nfts.get(token_id).unwrap();
    for (k, v) in rewards {
      let amount = staked_nft.balance.get(&k).unwrap_or(0);
      staked_nft.balance.insert(&k, &(amount + v));
    }
    self.staked_nfts.insert(token_id, &staked_nft);

    staked_nft
  }

  // maybe refactor with a StakedNFT withdraw method?
  pub fn inner_withdraw(&mut self, token_id: &NonFungibleTokenID) -> FungibleTokenBalance {
    let mut staked_nft = self.claim_rewards(token_id);
    let owner_id = &staked_nft.owner_id;

    let staking_duration = env::block_timestamp() - staked_nft.staked_timestamp;
    let early_withdraw = staking_duration < self.min_staking_period;
    let withdraw_rate = if early_withdraw {
      DENOM - self.early_withdraw_penalty / DENOM
    } else {
      1
    };

    let mut balance = self.stakers_balances.get(&owner_id).unwrap_or_else(|| {
      UnorderedMap::new(StorageKey::StakerBalance {
        collection: self.collection.clone(),
        owner_id: owner_id.clone(),
      })
    });
    for (k, amount) in staked_nft.balance.to_vec() {
      balance.insert(&k, &(amount * withdraw_rate));
      staked_nft.balance.insert(&k, &0);
    }

    self.stakers_balances.insert(&owner_id, &balance);
    self.staked_nfts.insert(&token_id, &staked_nft);

    balance
  }

  pub fn outer_withdraw(&mut self, staker_id: &AccountId, token_id: &FungibleTokenID) -> u128 {
    let mut balance = self.stakers_balances.get(staker_id).unwrap();
    let amount = balance.get(token_id).unwrap_or(0);

    balance.insert(token_id, &0);
    self.stakers_balances.insert(staker_id, &balance);

    amount
  }

  pub fn deposit_distribution_funds(&mut self, token_id: &FungibleTokenID, amount: u128) {
    self.farm.deposit_distribution_funds(token_id, amount);
  }

  pub fn withdraw_collection_treasury(&mut self, token_id: &FungibleTokenID) -> u128 {
    let amount = self.collection_treasury.get(&token_id).unwrap();

    self.collection_treasury.insert(&token_id, &0);

    amount
  }

  pub fn move_funds(&mut self, token_id: &FungibleTokenID, op: FundsOperation) {
    let balance = self.collection_treasury.get(token_id).unwrap_or(0);
    match op {
      FundsOperation::TreasuryToDistribution { amount } => {
        assert!(balance > amount, "Insufficent funds in treasury.");
        self
          .collection_treasury
          .insert(token_id, &(balance - amount));
        self.farm.deposit_distribution_funds(token_id, amount);
      }

      FundsOperation::DistributionToTreasury => {
        let amount = self.farm.withdraw_beneficiary(token_id);
        self
          .collection_treasury
          .insert(token_id, &(balance + amount));
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use near_sdk::test_utils::VMContextBuilder;
  use std::{collections::HashMap, str::FromStr};

  use super::*;

  fn get_context() -> VMContextBuilder {
    VMContextBuilder::new()
  }

  fn get_token_ids() -> [AccountId; 3] {
    ["token_a.testnet", "token_b.testnet", "token_c.testnet"]
      .map(|account_id| AccountId::from_str(account_id).unwrap())
  }

  fn get_accounts() -> [AccountId; 2] {
    ["owner.near", "skrr.near"].map(|account_id| AccountId::from_str(account_id).unwrap())
  }

  fn get_collections() -> [NFTCollection; 1] {
    let [_, account_id] = get_accounts();

    [NFTCollection::NFTContract { account_id }]
  }

  fn get_farms() -> [Farm; 1] {
    let mut rps = HashMap::new();
    for token_id in get_token_ids() {
      rps.insert(token_id, 5);
    }

    let [collection] = get_collections();

    [Farm::new(collection, rps, 1)]
  }

  #[test]
  fn test_stake_nft() {
    let [farm] = get_farms();
    let [collection] = get_collections();
    let [owner_id, _] = get_accounts();
    let [_, _, token_id] = get_token_ids();

    let mut staking_program = StakingProgram::new(
      farm,
      collection.clone(),
      owner_id.clone(),
      token_id,
      5,
      DENOM / 20,
    );

    let nft_id = (collection, "#1".to_string());

    staking_program.stake_nft(nft_id.clone(), &owner_id);

    assert!(staking_program
      .nfts_by_owner
      .get(&owner_id)
      .unwrap()
      .contains(&nft_id));

    assert_eq!(
      staking_program.staked_nfts.get(&nft_id).unwrap().token_id,
      nft_id,
    );
  }
}
