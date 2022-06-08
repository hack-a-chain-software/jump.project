use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedSet, Vector};
use near_sdk::json_types::{U128, U64};
use near_sdk::{
	env, log, Gas, near_bindgen, AccountId, 
	PanicOnDefault, PromiseOrValue, BorshStorageKey,
	PromiseResult,
	utils::{assert_one_yocto},
};
use near_sdk::serde::{Serialize, Deserialize};

use crate::actions::guardian_actions::{ListingData};
use crate::token_handler::{TokenType};

use crate::listing::{VListing};
use crate::errors::*;

mod actions;
mod token_handler;
mod errors;
mod events;
mod ext_interface;
mod listing;

const TO_NANO: u64 = 1_000_000_000;

#[derive(BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
	Guardians,
	Listings,
	InvestorTreasury { listing_id: u64 },
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
struct Contract {
	pub owner: AccountId,
	pub guardians: UnorderedSet<AccountId>,
	pub listings: Vector<VListing>,
}

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
	#[init]
	pub fn new(owner: AccountId) -> Self {
		assert!(!env::state_exists(), "Already initialized");
		Self {
			owner,
			guardians: UnorderedSet::new(StorageKey::Guardians),
			listings: Vector::new(StorageKey::Listings),
		}
	}
}

// CRUD methods
impl Contract {
	pub fn internal_create_new_listing(&mut self, listing_data: ListingData) -> u64 {
		let listing_index = self.listings.len();
		let new_listing = VListing::new(
			listing_index,
			listing_data.project_owner,
			TokenType::FT { account_id: listing_data.project_token },
			TokenType::FT { account_id: listing_data.price_token },
			listing_data.open_sale_1_timestamp_seconds.0 * TO_NANO,
			listing_data.open_sale_2_timestamp_seconds.0 * TO_NANO,
			listing_data.final_sale_2_timestamp_seconds.0 * TO_NANO,
			listing_data.liquidity_pool_timestamp_seconds.0 * TO_NANO,
			listing_data.total_amount_sale_project_tokens.0,
			listing_data.token_alocation_size.0,
			listing_data.token_allocation_price.0,
			listing_data.liquidity_pool_project_tokens.0,
			listing_data.liquidity_pool_price_tokens.0,
			listing_data.fraction_instant_release.0,
			listing_data.cliff_period_seconds.0 * TO_NANO,
		);
		self.listings.push(&new_listing);
		events::create_listing(new_listing);
		listing_index
	}

	pub fn internal_cancel_listing(&mut self, listing_id: u64) {
		let mut listing = self.listings.get(listing_id).expect(ERR_003);
		listing.cancel_listing();
		self.listings.replace(listing_id, &listing);
		events::cancel_listing(listing_id);
	}


}

// helper methods
impl Contract {
	pub fn assert_owner(&mut self) {
		assert_one_yocto();
		assert_eq!(env::predecessor_account_id(), self.owner, "{}", ERR_001);
	}

	pub fn assert_owner_or_guardian(&mut self) {
		assert_one_yocto();
		let predecessor = env::predecessor_account_id();
		if predecessor != self.owner {
			assert!(self.guardians.contains(&predecessor), "{}", ERR_002);
		}
	}
}
