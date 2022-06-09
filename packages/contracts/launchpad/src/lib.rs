use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedSet, Vector, LookupMap};
use near_sdk::json_types::{U128, U64};
use near_sdk::{
	env, near_bindgen, AccountId, PanicOnDefault, BorshStorageKey,
	utils::{assert_one_yocto},
};
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::serde_json;

use crate::actions::guardian_actions::{ListingData};
use crate::token_handler::{TokenType};

use crate::listing::{VListing, Listing};
use crate::investor::{VInvestor, Investor};
use crate::errors::*;

mod actions;
mod errors;
mod events;
mod ext_interface;
mod investor;
mod listing;
mod token_handler;

const TO_NANO: u64 = 1_000_000_000;
const FRACTION_BASE: u128 = 1_000_000_000;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde( crate = "near_sdk::serde" )]
pub struct ContractSettings {
	membership_token: AccountId,
	n_tiers: u8,
	tiers_minimum_tokens: Vec<U128>,
	fee_price_tokens: U128, // fee taken on price tokens received in the presale %
	fee_liquidity_tokens: U128 // fee taken on project and price tokens sent to liquidity pool %
}

#[derive(BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
	Guardians,
	Listings,
	InvestorTreasury { account_id: AccountId },
	Investors,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
struct Contract {
	pub owner: AccountId,
	pub guardians: UnorderedSet<AccountId>,
	pub listings: Vector<VListing>,
	pub investors: LookupMap<AccountId, VInvestor>,
	pub contract_settings: ContractSettings
}

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
	#[init]
	pub fn new(owner: AccountId, contract_settings: ContractSettings) -> Self {
		assert!(!env::state_exists(), "Already initialized");
		Self {
			owner,
			guardians: UnorderedSet::new(StorageKey::Guardians),
			listings: Vector::new(StorageKey::Listings),
			investors: LookupMap::new(StorageKey::Investors),
			contract_settings,
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
			TokenType::FT {
				account_id: listing_data.project_token,
			},
			TokenType::FT {
				account_id: listing_data.price_token,
			},
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
		let mut listing = self.listings.get(listing_id).expect(ERR_003).into_current();
		listing.cancel_listing();
		self.listings.replace(listing_id, &VListing::V1(listing));
		events::cancel_listing(listing_id);
	}

	pub fn internal_withdraw_project_funds(&mut self, listing: &mut Listing, listing_id: u64) {
		listing.withdraw_project_funds();
		self.listings.replace(listing_id, &VListing::V1(*listing));
	}

	pub fn internal_get_investor(&self, account_id: &AccountId) -> Option<Investor> {
		match self.investors.get(account_id) {
			Some(v) => Some(v.into_current()),
			None => None,
		}
	}

	pub fn internal_deposit_storage_investor(&mut self, account_id: &AccountId, deposit: u128) {
		let investor = match self.internal_get_investor(account_id) {
			Some(mut investor) => {
				investor.deposit_storage_funds(deposit);
				VInvestor::V1(investor)
			}
			None => VInvestor::new(account_id.clone(), deposit),
		};
		self.investors.insert(account_id, &investor);
	}

	pub fn internal_storage_withdraw_investor(
		&mut self,
		account_id: &AccountId,
		amount: u128,
	) -> u128 {
		let mut investor = self.internal_get_investor(&account_id).expect(ERR_004);
		let available = investor.storage_funds_available();
		assert!(
			available > 0,
			"{}. No funds available for withdraw",
			ERR_201
		);
		let mut withdraw_amount = amount;
		if amount == 0 {
			withdraw_amount = available;
		}
		assert!(
			withdraw_amount <= available,
			"{}. Only {} available for withdraw",
			ERR_201,
			available
		);
		investor.withdraw_storage_funds(withdraw_amount);
		self.investors.insert(account_id, &VInvestor::V1(investor));
		withdraw_amount
	}
}

// helper methods
impl Contract {
	pub fn assert_owner(&self) {
		assert_one_yocto();
		assert_eq!(env::predecessor_account_id(), self.owner, "{}", ERR_001);
	}

	pub fn assert_owner_or_guardian(&self) {
		assert_one_yocto();
		let predecessor = env::predecessor_account_id();
		if predecessor != self.owner {
			assert!(self.guardians.contains(&predecessor), "{}", ERR_002);
		}
	}

	pub fn assert_project_owner(&mut self, listing_id: u64) -> Listing {
		assert_one_yocto();
		let listing = self.listings.get(listing_id).expect(ERR_003).into_current();
		listing.assert_owner(&env::predecessor_account_id());
		listing
	}
}
