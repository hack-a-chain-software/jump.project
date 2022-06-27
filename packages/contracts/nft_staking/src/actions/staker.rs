use crate::actions::transfer::NFTRoutePayload;
use crate::constants::{FT_TRANSFER_GAS, NFT_TRANSFER_GAS};
use crate::ext_interfaces::{ext_fungible_token, ext_non_fungible_token};
use crate::staking::StakingProgram;
use crate::types::*;
use crate::{Contract, ContractExt};
use near_sdk::json_types::U128;
use near_sdk::{assert_one_yocto, env, near_bindgen, AccountId, Promise};

impl StakingProgram {
  #[inline]
  fn assert_is_token_owner(&self, caller_id: &AccountId, token_id: &NonFungibleTokenID) {
    assert!(
      self
        .nfts_by_owner
        .get(&caller_id)
        .map(|nfts| nfts.contains(token_id))
        .unwrap_or(false),
      "Only the token's owner may operate it."
    );
  }
}

impl Contract {
  pub fn stake(&mut self, payload: NFTRoutePayload) {
    let initial_storage = env::storage_usage();
    let token_id = payload.token_id;
    let owner_id = payload.sender_id; // payload.previous_owner_id;
    let collection = payload.collection;

    let mut staking_program = self.staking_programs.get(&collection).unwrap();
    staking_program.stake_nft(token_id, &owner_id);
    self.staking_programs.insert(&collection, &staking_program);

    self.track_storage_usage(&owner_id, initial_storage);
  }
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn unstake(&mut self, token_id: NonFungibleTokenID) -> Promise {
    assert_one_yocto();

    let initial_storage = env::storage_usage();
    let caller_id = env::predecessor_account_id();
    let collection = token_id.0.clone();
    let mut staking_program = self.staking_programs.get(&collection).unwrap();
    staking_program.assert_is_token_owner(&caller_id, &token_id);

    staking_program.inner_withdraw(&token_id);

    staking_program.unstake_nft(&token_id, &caller_id);
    self.staking_programs.insert(&collection, &staking_program);

    self.track_storage_usage(&caller_id, initial_storage);

    match collection.clone() {
      NFTCollection::NFTContract { account_id } => ext_non_fungible_token::ext(account_id)
        .with_static_gas(NFT_TRANSFER_GAS)
        .with_attached_deposit(1)
        .nft_transfer(caller_id.clone(), token_id.1.clone(), None, None),
    }
  }

  #[payable]
  pub fn withdraw_reward(
    &mut self,
    collection: NFTCollection,
    token_id: FungibleTokenID,
    amount: Option<U128>,
  ) -> Promise {
    assert_one_yocto();

    let initial_storage = env::storage_usage();
    let caller_id = env::predecessor_account_id();
    let mut staking_program = self.staking_programs.get(&collection).unwrap();

    let available = staking_program.outer_withdraw(&caller_id, &token_id);
    let amount = amount.map(|x| x.0).unwrap_or(available);
    assert!(amount <= available, "");

    self.track_storage_usage(&caller_id, initial_storage);

    ext_fungible_token::ext(token_id)
      .with_static_gas(FT_TRANSFER_GAS)
      .with_attached_deposit(1)
      .ft_transfer(caller_id.clone(), U128(amount), None)
  }

  #[payable]
  pub fn claim_reward(&mut self, collection: NFTCollection, token_id: NonFungibleTokenID) {
    assert_one_yocto();

    let initial_storage = env::storage_usage();
    let caller_id = env::predecessor_account_id();
    let mut staking_program = self.staking_programs.get(&collection).unwrap();
    staking_program.assert_is_token_owner(&caller_id, &token_id);

    staking_program.claim_rewards(&token_id);
    self.staking_programs.insert(&collection, &staking_program);

    self.track_storage_usage(&caller_id, initial_storage);
  }

  pub fn view_staked(
    &self,
    collection: NFTCollection,
    account_id: Option<AccountId>,
  ) -> Vec<String> {
    let staking_program = self.staking_programs.get(&collection).unwrap();

    match account_id {
      None => staking_program
        .staked_nfts
        .iter()
        .map(|((_, id), _)| id)
        .collect(),

      Some(owner_id) => staking_program
        .nfts_by_owner
        .get(&owner_id)
        .unwrap()
        .iter()
        .map(|(_, id)| id)
        .collect(),
    }
  }
}
