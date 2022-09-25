use near_sdk::{near_bindgen, AccountId};

use crate::{
  staking::StakedNFT,
  types::{FungibleTokenBalance, NFTCollection, NonFungibleTokenID, SerializableStakingProgram},
  Contract, ContractExt,
};

#[near_bindgen]
impl Contract {
  pub fn view_staking_program(
    &self,
    collection: NFTCollection,
  ) -> Option<SerializableStakingProgram> {
    self.staking_programs.get(&collection).map(From::from)
  }

  pub fn view_staked_nft_balance(&self, nft_id: NonFungibleTokenID) -> FungibleTokenBalance {
    let collection = &nft_id.0;
    let mut staking_program = self.staking_programs.get(collection).unwrap();

    let staked_nft = staking_program.view_unclaimed_rewards(&nft_id);

    staked_nft.balance
  }

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
      Some(owner_id) => match staking_program.nfts_by_owner.get(&owner_id) {
        Some(nfts) => nfts
          .iter()
          .skip(from_index as usize)
          .take(limit)
          .map(|(_, id)| id)
          .collect(),
        None => vec![],
      },
    }
  }

  pub fn view_staked_nft(&self, nft_id: NonFungibleTokenID) -> Option<StakedNFT> {
    let collection = &nft_id.0;

    self
      .staking_programs
      .get(collection)
      .and_then(|staking_program| staking_program.staked_nfts.get(&nft_id))
  }

  pub fn view_inner_balance(
    &self,
    collection: NFTCollection,
    account_id: AccountId,
  ) -> FungibleTokenBalance {
    let staking_program = self.staking_programs.get(&collection).unwrap();

    let balance = staking_program.stakers_balances.get(&account_id).unwrap();

    balance
  }

  pub fn view_contract_tokens(&self) -> FungibleTokenBalance {
    self.contract_treasury.clone()
  }
}
