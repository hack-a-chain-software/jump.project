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
	
    pub cancellation_funds_price_tokens: u128
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
        
            cancellation_funds_price_tokens: 0
        }
    }

    pub fn fund_listing(&mut self, token_sale_amount: u128, token_liquidity_amount: u128) {
        self.presale_project_token_balance = token_sale_amount;
        self.liquidity_pool_project_token_balance = token_liquidity_amount;
    }

    pub fn update_treasury_after_sale(&mut self, lp_project_tokens_excess: u128, lp_price_tokens_to_deposit: u128) {
        self.presale_project_token_balance += lp_project_tokens_excess;
        self.liquidity_pool_project_token_balance -= lp_project_tokens_excess;

        self.total_received_presale_price_token_balance -= lp_price_tokens_to_deposit;
        self.liquidity_pool_price_token_balance += lp_price_tokens_to_deposit;
    }

    pub fn update_treasury_after_cancelation(&mut self) {
        self.presale_project_token_balance += self.all_investors_project_token_balance;
        self.all_investors_project_token_balance = 0;

        self.presale_project_token_balance += self.liquidity_pool_project_token_balance;
        self.liquidity_pool_project_token_balance = 0;
        
        self.cancellation_funds_price_tokens += self.total_received_presale_price_token_balance;
        self.cancellation_funds_price_tokens += self.liquidity_pool_price_token_balance;
        self.total_received_presale_price_token_balance = 0;
        self.liquidity_pool_price_token_balance = 0;
    }

    pub fn withdraw_project_funds(&mut self) -> (u128, u128) {
        let project_tokens = self.presale_project_token_balance;
        let price_tokens = self.total_received_presale_price_token_balance;

        self.presale_project_token_balance = 0;
        self.total_received_presale_price_token_balance = 0;

        (project_tokens, price_tokens)
    }

    
}