use crate::constants::DENOM;
use crate::types::*;
use crate::StorageKey;
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{env, Timestamp};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
pub struct RewardsDistribution {
  pub undistributed: u128,
  pub unclaimed: u128,
  pub beneficiary: u128,
  pub rps: u128,
  pub rr: u32,
  pub reward: u128,
}

impl RewardsDistribution {
  pub fn new(balance: u128, reward: u128) -> Self {
    RewardsDistribution {
      undistributed: balance,
      unclaimed: 0,
      beneficiary: 0,
      rps: 0,
      rr: 0,
      reward,
    }
  }

  pub fn distribute(&self, total_seeds: u64, round: u32) -> Self {
    let mut dist = self.clone();
    dist.rr = round;

    let delta_t = dist.rr - self.rr;
    let mut added_reward = (delta_t as u128) * self.reward;

    println!(
      "delta_t = {}; round = {}; added_reward = {}; reward = {}",
      delta_t, round, added_reward, self.reward
    );

    if self.undistributed < added_reward {
      added_reward = self.undistributed;

      let increment_rr = ceil_division(added_reward, self.reward) as u32;

      dist.rr = self.rr + increment_rr;
    }

    dist.undistributed -= added_reward;

    if total_seeds == 0 {
      dist.beneficiary += added_reward;
      dist.rps = 0;
    } else {
      dist.unclaimed += added_reward;
      dist.rps += added_reward * DENOM / total_seeds as u128;
    }

    dist
  }

  pub fn claim(&self, token_rps: u128) -> (Self, u128) {
    let mut dist = self.clone();
    let claimed = (self.rps - token_rps) / DENOM;

    dist.unclaimed -= claimed;

    (dist, claimed)
  }

  pub fn deposit_distribution_funds(&self, amount: u128) -> Self {
    let mut dist = self.clone();

    dist.undistributed += amount;

    dist
  }

  pub fn withdraw_beneficiary(&self) -> (Self, u128) {
    let mut dist = self.clone();
    let beneficiary = self.beneficiary;

    dist.beneficiary = 0;

    (dist, beneficiary)
  }
}

#[derive(BorshSerialize, BorshDeserialize, Serialize)]
pub struct Farm {
  pub round_interval: u32,
  pub start_at: u32,

  pub distributions: HashMap<FungibleTokenID, RewardsDistribution>,

  #[serde(skip)]
  pub nfts_rps: UnorderedMap<NonFungibleTokenID, FungibleTokenBalance>,
}

// TODO: turn this into a macro
fn get_key_closure(collection: NFTCollection) -> impl FnMut() -> StorageKey {
  let mut counter = 0;
  move || {
    counter += 1;
    StorageKey::FarmField {
      collection: collection.clone(),
      counter,
    }
  }
}

impl Farm {
  pub fn new(
    collection: NFTCollection,
    collection_round_reward: FungibleTokenBalance,
    round_interval: u32,
  ) -> Self {
    let mut get_key = get_key_closure(collection);

    let mut distributions = HashMap::new();
    for (token_id, &rewards) in collection_round_reward.iter() {
      distributions.insert(token_id.clone(), RewardsDistribution::new(0, rewards));
    }

    Farm {
      round_interval,
      start_at: 0,
      distributions,
      nfts_rps: UnorderedMap::new(get_key()),
    }
  }

  pub fn deposit_distribution_funds(&mut self, token_id: &FungibleTokenID, amount: u128) {
    let dist = self
      .distributions
      .get(token_id)
      .unwrap()
      .deposit_distribution_funds(amount);

    self.distributions.insert(token_id.clone(), dist);
  }

  pub fn withdraw_beneficiary(&mut self, token_id: &FungibleTokenID) -> u128 {
    let (dist, amount) = self
      .distributions
      .get(&token_id)
      .unwrap()
      .withdraw_beneficiary();

    self.distributions.insert(token_id.clone(), dist);

    amount
  }

  fn round(&self) -> u32 {
    let delta_t = to_sec(env::block_timestamp())
      .checked_sub(self.start_at)
      .unwrap_or(0);

    delta_t / self.round_interval
  }

  pub fn add_nft(&mut self, nft_id: &NonFungibleTokenID) {
    let mut balance = HashMap::new();

    for (ft_id, dist) in self.distributions.iter() {
      balance.insert(ft_id.clone(), dist.rps);
    }

    self.nfts_rps.insert(nft_id, &balance);

    self.distribute();
  }

  pub fn distribute(&mut self) {
    let round = self.round();
    if round == 0 {
      return;
    }

    let total_seeds = self.nfts_rps.len();

    for (k, prev_dist) in self.distributions.clone().iter() {
      let dist = prev_dist.distribute(total_seeds, round);
      self.distributions.insert(k.clone(), dist);
    }
  }

  pub fn claim(&mut self, token_id: &NonFungibleTokenID) -> FungibleTokenBalance {
    let (rewards_map, token_rps) = self.view_unclaimed_rewards(token_id);

    self.nfts_rps.insert(token_id, &token_rps);

    rewards_map
  }

  pub fn view_unclaimed_rewards(
    &mut self,
    token_id: &NonFungibleTokenID,
  ) -> (FungibleTokenBalance, FungibleTokenBalance) {
    self.distribute();

    let mut token_rps = self.nfts_rps.get(token_id).unwrap();
    let mut rewards_map = HashMap::new();

    for (k, prev_dist) in self.distributions.clone().iter() {
      let rps = *token_rps.get(k).unwrap_or(&0);

      let (dist, claimed) = prev_dist.claim(rps);

      token_rps.insert(k.clone(), dist.rps);
      self.distributions.insert(k.clone(), dist);

      rewards_map.insert(k.clone(), claimed);
    }

    (rewards_map, token_rps)
  }
}

const fn to_sec(timestamp: Timestamp) -> u32 {
  (timestamp / 10u64.pow(9)) as u32
}

const fn ceil_division(a: u128, b: u128) -> u128 {
  a / b + (a % b != 0) as u128
}

#[cfg(test)]
mod tests {
  use near_sdk::test_utils::VMContextBuilder;
  use near_sdk::testing_env;
  use near_sdk::AccountId;
  use rstest::rstest;
  use std::str::FromStr;
  use std::vec;

  use super::*;

  fn get_context() -> VMContextBuilder {
    VMContextBuilder::new()
  }

  fn get_token_ids() -> [AccountId; 2] {
    let token_a: AccountId = AccountId::from_str("token_a.testnet").unwrap();
    let token_b: AccountId = AccountId::from_str("token_b.testnet").unwrap();

    [token_a, token_b]
  }

  fn get_distributions() -> [(FungibleTokenID, RewardsDistribution); 5] {
    let [token_a, token_b] = get_token_ids();

    [
      (&token_a, RewardsDistribution::new(100, 10)),
      (&token_b, RewardsDistribution::new(100, 3)),
      (&token_a, RewardsDistribution::new(0, 10)),
      (&token_b, RewardsDistribution::new(11, 4)),
      (&token_a, RewardsDistribution::new(16, 4)),
    ]
    .map(|(id, dist)| (id.clone(), dist))
  }

  fn get_farm(vec_distributions: Vec<(AccountId, RewardsDistribution)>) -> Farm {
    let mut distributions = HashMap::new();
    for (k, v) in vec_distributions {
      distributions.insert(k, v);
    }

    Farm {
      round_interval: 15,
      start_at: 0,
      distributions,
      nfts_rps: UnorderedMap::new(b'd'),
    }
  }

  fn get_nft_ids() -> [NonFungibleTokenID; 3] {
    let account_id = AccountId::from_str("collection_a.testnet").unwrap();
    let collection = NFTCollection::NFTContract { account_id };

    [
      (collection.clone(), "1 #1".to_owned()),
      (collection.clone(), "1 #2".to_owned()),
      (collection, "2 #1".to_owned()),
    ]
  }

  #[rstest]
  #[case(0, 10, 2, (80, 20, 2))]
  #[case(0, 3, 2, (80, 20, 6))]
  #[case(2, 3, 2, (0, 0, 0))]
  #[case(3, 1, 4, (0, 11, 11))]
  #[case(3, 3, 4, (0, 11, 3))]
  #[case(3, 4, 4, (0, 11, 2))]
  fn test_rewards_distribution_distribute(
    #[case] index: usize,
    #[case] total_seeds: u64,
    #[case] rounds: u32,
    #[case] expected: (u128, u128, u128),
  ) {
    let context = get_context();
    testing_env!(context.build());

    let dist = get_distributions()[index].1.clone();

    let new_dist = dist.distribute(total_seeds, rounds);

    assert_eq!(new_dist.undistributed, expected.0);
    assert_eq!(new_dist.unclaimed, expected.1);
    assert_eq!(new_dist.rps / DENOM, expected.2)
  }

  #[rstest]
  #[case(30, 2)]
  #[case(44, 2)]
  #[case(1, 0)]
  #[case(15, 1)]
  fn test_farm_round(#[case] block_seconds: u64, #[case] round: u32) {
    let mut context = get_context();
    context.block_timestamp(block_seconds * 10u64.pow(9));
    testing_env!(context.build());

    let farm = get_farm(vec![]);
    assert_eq!(farm.round(), round);
  }

  #[test]
  fn test_farm_distribute_no_tokens() {
    let mut context = get_context();
    context.block_timestamp(30 * 10u64.pow(9));
    testing_env!(context.build());

    let dists = get_distributions()[0..2].to_vec();

    let mut farm = get_farm(dists.clone());
    farm.distribute();

    for (k, dist) in &dists {
      println!(
        "round_interval = {}; balance = {}; reward = {}",
        farm.round_interval, dist.undistributed, dist.reward
      );

      let current_dist = farm.distributions.get(&k).unwrap();
      assert_eq!(
        current_dist.undistributed,
        dist.undistributed - 2 * dist.reward
      );
      assert_eq!(current_dist.beneficiary, 2 * dist.reward);
      assert_eq!(current_dist.unclaimed, 0);
      assert_eq!(current_dist.rps, 0);
      assert_eq!(current_dist.rr, 2);
    }
  }

  #[test]
  fn test_farm_distribute_single_token() {
    let mut context = get_context();
    context.block_timestamp(44 * 10u64.pow(9));
    testing_env!(context.build());

    let dists = get_distributions()[0..2].to_vec();

    let mut farm = get_farm(dists.clone());

    let [nft_id, _, _] = get_nft_ids();
    farm.add_nft(&nft_id);

    for (k, dist) in &dists {
      let current_dist = farm.distributions.get(&k).unwrap();

      assert_eq!(
        current_dist.undistributed,
        dist.undistributed - 2 * dist.reward
      );
      assert_eq!(current_dist.rps / DENOM, 2 * dist.reward);
      assert_eq!(current_dist.rr, 2);
    }
  }

  #[test]
  fn test_farm_claim() {
    let mut context = get_context();
    context.block_timestamp(30 * 10u64.pow(9));

    let mut farm = get_farm(vec![]);

    let [nft_id, _, _] = get_nft_ids();
    farm.add_nft(&nft_id);

    farm.claim(&nft_id);
  }
}
