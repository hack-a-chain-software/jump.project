use near_sdk::{near_bindgen, AccountId};

use crate::{
  staking::StakedNFT,
  types::{NFTCollection, NonFungibleTokenID},
  Contract, ContractExt,
};

use crate::types::{SerializableFungibleTokenBalance, SerializableStakingProgram};

#[near_bindgen]
impl Contract {
  //retornar o staking program / farm -> round_rewards e saldo pra ver quanto tempo vai durar a farm
  pub fn view_staking_program(
    &self,
    collection: NFTCollection,
  ) -> Option<SerializableStakingProgram> {
    self.staking_programs.get(&collection).map(From::from)
  }

  pub fn view_staked_nft_balance(
    &self,
    nft_id: NonFungibleTokenID,
  ) -> SerializableFungibleTokenBalance {
    let collection = &nft_id.0;
    let mut staking_program = self.staking_programs.get(collection).unwrap();

    let staked_nft = staking_program.view_unclaimed_rewards(&nft_id);

    SerializableFungibleTokenBalance(staked_nft.balance)
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
}
