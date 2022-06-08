use near_sdk::{ AccountId };
use near_sdk::collections::{ LookupMap };
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize};

use crate::{ StorageKey };
use crate::listing::investor_treasury::{ InvestorTreasury };

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Treasury {
	pub presale_project_token_balance: u128,
	pub total_received_presale_price_token_balance: u128,

	pub liquidity_pool_project_token_balance: u128,
	pub liquidity_pool_price_token_balance: u128,
	
	pub all_investors_project_token_balance: u128,
    #[serde(skip_serializing)]
	pub investors_treasuries: LookupMap<AccountId, InvestorTreasury>,
	
}

impl Treasury {
    pub fn new(listing_id: u64) -> Self {
        Self {
            presale_project_token_balance: 0,
            total_received_presale_price_token_balance: 0,

            liquidity_pool_project_token_balance: 0,
            liquidity_pool_price_token_balance: 0,
            
            all_investors_project_token_balance: 0,
            investors_treasuries: LookupMap::new(StorageKey::InvestorTreasury { listing_id }),
        }
    }

    //add CRUD methods
}