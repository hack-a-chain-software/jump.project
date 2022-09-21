use std::collections::HashMap;

use crate::calc::denom_multiplication;
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
      collection_treasury: HashMap::new(),
      token_address,

      farm,
      min_staking_period,
      early_withdraw_penalty,

      staked_nfts: UnorderedMap::new(get_key()),
      stakers_balances: LookupMap::new(get_key()),
      nfts_by_owner: LookupMap::new(get_key()),
    }
  }

  pub fn insert_staked_nft(&mut self, staked_nft: &StakedNFT) {
    let token_id = &staked_nft.token_id;
    let owner_id = &staked_nft.owner_id;

    self.staked_nfts.insert(token_id, &staked_nft);

    let mut nfts_by_owner = self.nfts_by_owner.get(owner_id).unwrap_or_else(|| {
      UnorderedSet::new(StorageKey::NFTsByOwner {
        collection: self.collection.clone(),
        owner_id: owner_id.clone(),
      })
    });
    nfts_by_owner.insert(token_id);

    self.nfts_by_owner.insert(owner_id, &nfts_by_owner);
    self.farm.add_nft(token_id);
  }

  pub fn stake_nft(&mut self, token_id: NonFungibleTokenID, owner_id: AccountId) -> StakedNFT {
    let staked_nft = StakedNFT::new(token_id, owner_id, env::block_timestamp());

    self.insert_staked_nft(&staked_nft);

    staked_nft
  }

  pub fn unstake_nft(&mut self, token_id: &NonFungibleTokenID, owner_id: &AccountId) -> StakedNFT {
    let staked_nft = self.staked_nfts.get(token_id).unwrap();

    self.staked_nfts.remove(token_id);
    let mut nfts_by_owner_set = self.nfts_by_owner.get(owner_id).unwrap();
    nfts_by_owner_set.remove(token_id);
    self.nfts_by_owner.insert(owner_id, &nfts_by_owner_set);

    self.farm.nfts_rps.remove(token_id);

    staked_nft
  }

  pub fn claim_rewards(&mut self, token_id: &NonFungibleTokenID) -> StakedNFT {
    let rewards = self.farm.claim(token_id);
    let mut staked_nft = self.staked_nfts.get(token_id).unwrap();

    staked_nft.update_balance(rewards);
    self.staked_nfts.insert(token_id, &staked_nft);

    staked_nft
  }

  // method replicates claim_rewards without writing to permanent storage
  pub fn view_unclaimed_rewards(&mut self, token_id: &NonFungibleTokenID) -> StakedNFT {
    let rewards = self.farm.view_unclaimed_rewards(token_id).0;

    let mut staked_nft = self.staked_nfts.get(token_id).unwrap();
    staked_nft.update_balance(rewards);

    staked_nft
  }

  // TODO: maybe refactor with a StakedNFT withdraw method?
  // method that allows an investor to withdraw their NFT's balance to their investor balance
  // this is where the early withdraw logic is applied
  pub fn inner_withdraw(&mut self, token_id: &NonFungibleTokenID) -> FungibleTokenBalance {
    let mut staked_nft = self.claim_rewards(token_id);
    let owner_id = &staked_nft.owner_id;

    let staking_duration = env::block_timestamp() - staked_nft.staked_timestamp;
    let early_withdraw = staking_duration < self.min_staking_period;
    let withdraw_rate = if early_withdraw {
      DENOM - self.early_withdraw_penalty
    } else {
      DENOM
    };

    let mut balance = self
      .stakers_balances
      .get(&owner_id)
      .unwrap_or_else(|| HashMap::new());

    let staked_nft_balance = staked_nft.balance.clone();
    for (k, amount) in staked_nft_balance {
      staked_nft.balance.insert(k.clone(), 0);

      let withdrawable_amount = denom_multiplication(amount, withdraw_rate);
      let remainder = amount - withdrawable_amount;

      balance.insert(k.clone(), withdrawable_amount);
      *self.collection_treasury.entry(k).or_insert(0) += remainder;
    }

    self.stakers_balances.insert(&owner_id, &balance);
    self.staked_nfts.insert(&token_id, &staked_nft);

    balance
  }

  // method that allows an investor to withdraw their balance of a specific fungible token
  pub fn outer_withdraw(
    &mut self,
    staker_id: &AccountId,
    token_id: &FungibleTokenID,
    amount: Option<u128>,
  ) -> u128 {
    let mut balance = self
      .stakers_balances
      .get(staker_id)
      .unwrap_or_else(|| HashMap::new());

    let available = balance.entry(token_id.clone()).or_insert(0);
    let amount = amount.unwrap_or(*available);
    assert!(amount <= *available);

    *available -= amount;

    self.stakers_balances.insert(staker_id, &balance);

    amount
  }

  // action to compensate failed outer_withdraw transactions
  pub fn outer_deposit(&mut self, staker_id: &AccountId, token_id: &FungibleTokenID, amount: u128) {
    let mut balance = self
      .stakers_balances
      .get(staker_id)
      .unwrap_or_else(|| HashMap::new());

    *balance.entry(token_id.clone()).or_insert(0) += amount;

    self.stakers_balances.insert(staker_id, &balance);
  }

  pub fn deposit_distribution_funds(&mut self, token_id: &FungibleTokenID, amount: u128) {
    self.farm.deposit_distribution_funds(token_id, amount);
  }

  pub fn withdraw_beneficiary_funds(&mut self, token_id: &FungibleTokenID) -> u128 {
    self.farm.withdraw_beneficiary_funds(&token_id)
  }

  pub fn withdraw_collection_treasury(&mut self, token_id: FungibleTokenID) -> u128 {
    self.collection_treasury.insert(token_id, 0).unwrap()
  }
}

#[cfg(test)]
mod tests {
  use std::{collections::HashMap, str::FromStr};

  use near_sdk::{test_utils::VMContextBuilder, testing_env};

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

    [Farm::new(collection, rps, 1000, 0)]
  }

  fn get_staking_program() -> StakingProgram {
    let [farm] = get_farms();

    StakingProgram::new(
      farm,
      get_collections()[0].clone(),
      get_accounts()[0].clone(),
      get_token_ids()[2].clone(),
      5 * 10u64.pow(9),
      DENOM / 5,
    )
  }

  fn get_nft_id() -> [NonFungibleTokenID; 1] {
    let [collection] = get_collections();

    [(collection.clone(), "#1".to_string())]
  }

  #[test]
  fn test_stake_nft() {
    let [owner_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let nft_id = get_nft_id()[0].clone();

    staking_program.stake_nft(nft_id.clone(), owner_id.clone());

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

  #[test]
  fn test_claim_rewards_empty_balance() {
    let [owner_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let nft_id = get_nft_id()[0].clone();

    let old_nft = staking_program.stake_nft(nft_id.clone(), owner_id);
    let new_nft = staking_program.claim_rewards(&nft_id);

    assert_eq!(old_nft.balance, HashMap::new());
    assert_eq!(new_nft.balance.len(), 3);
  }

  #[test]
  fn test_inner_withdraw() {
    let mut context = get_context();
    context.block_timestamp(10 * 10u64.pow(9));
    testing_env!(context.build());

    let [staker_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let token_id = get_token_ids()[0].clone();
    let nft_id = get_nft_id()[0].clone();

    let mut staked_nft = StakedNFT::new(nft_id.clone(), staker_id, 4 * 10u64.pow(9));
    staked_nft.balance.insert(token_id.clone(), 10);
    staking_program.insert_staked_nft(&staked_nft);

    let withdrawn_balance = staking_program.inner_withdraw(&nft_id);

    assert_eq!(withdrawn_balance.get(&token_id).unwrap(), &10);
  }

  #[test]
  fn test_inner_withdraw_early_withdraw() {
    let mut context = get_context();
    context.block_timestamp(10 * 10u64.pow(9));
    testing_env!(context.build());

    let [staker_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let token_id = get_token_ids()[0].clone();
    let nft_id = get_nft_id()[0].clone();

    let withdrawn_amount = 8;
    let remainder = 2;

    let mut staked_nft = StakedNFT::new(nft_id.clone(), staker_id, 9 * 10u64.pow(9));
    staked_nft
      .balance
      .insert(token_id.clone(), withdrawn_amount + remainder);
    staking_program.insert_staked_nft(&staked_nft);

    let withdrawn_balance = staking_program.inner_withdraw(&nft_id);

    assert_eq!(withdrawn_balance.get(&token_id).unwrap(), &withdrawn_amount);
    assert_eq!(
      staking_program.collection_treasury.get(&token_id).unwrap(),
      &remainder
    );
  }

  #[test]
  #[should_panic]
  fn test_outer_withdraw_overdraw() {
    let [staker_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let token_id = get_token_ids()[0].clone();
    let amount = Some(100);

    staking_program.outer_withdraw(&staker_id, &token_id, amount);
  }

  #[test]
  fn test_outer_withdraw_empty() {
    let [staker_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let token_id = get_token_ids()[0].clone();
    let amount = None;

    // balance_amount = 0

    let withdrawn_amount = staking_program.outer_withdraw(&staker_id, &token_id, amount);

    assert_eq!(withdrawn_amount, 0);

    let balance_amount = *staking_program
      .stakers_balances
      .get(&staker_id)
      .unwrap()
      .get(&token_id)
      .unwrap();

    assert_eq!(balance_amount, 0);
  }

  #[test]
  fn test_outer_withdraw_non_null() {
    let [staker_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let token_id = get_token_ids()[0].clone();
    let amount = Some(100);
    let balance_amount = 200u128;

    let mut balance = HashMap::new();
    balance.insert(token_id.clone(), balance_amount);
    staking_program
      .stakers_balances
      .insert(&staker_id, &balance);

    let withdrawn_amount = staking_program.outer_withdraw(&staker_id, &token_id, amount);

    assert_eq!(Some(withdrawn_amount), amount);
    assert_eq!(
      staking_program
        .stakers_balances
        .get(&staker_id)
        .unwrap()
        .get(&token_id),
      Some(&(balance_amount - withdrawn_amount))
    );
  }

  #[test]
  fn test_outer_deposit() {
    let [staker_id, _] = get_accounts();
    let mut staking_program = get_staking_program();
    let token_id = get_token_ids()[0].clone();
    let amount = 100;

    staking_program.outer_deposit(&staker_id, &token_id, amount);

    assert_eq!(
      staking_program
        .stakers_balances
        .get(&staker_id)
        .unwrap()
        .get(&token_id),
      Some(&amount)
    );
  }
}
