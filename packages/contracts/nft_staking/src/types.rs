use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::AccountId;

// Acova and Jump
pub type FungibleTokenID = AccountId;

pub type FungibleTokenBalance = UnorderedMap<FungibleTokenID, u128>;

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
#[serde(tag = "type")]
pub enum NFTCollection {
  NFTContract { account_id: AccountId },
}

pub type NonFungibleTokenID = (NFTCollection, String);
