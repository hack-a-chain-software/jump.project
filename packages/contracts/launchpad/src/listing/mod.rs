use near_sdk::{AccountId, env};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize};
use crate::listing::treasury::{Treasury};
use crate::token_handler::{TokenType};
use crate::errors::*;

mod investor_treasury;
mod treasury;

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum VListing {
	V1(Listing),
}

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum ListingStatus {
	Unfunded,      // project has not yet deposited initial funds to start the offer
	Funded,        // project has received all resources
	SaleFinalized, // sale is finalized, either by selling off or selling over the minum threshold and
	// the final_sale_2_timestamp arriving
	LiquidityPoolFinalized, // liquidity pool has been sent to dex
	Cancelled,              // either target not met or manual cancel, everyone can withdraw assets
}

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Listing {
	pub listing_id: u64,
	pub project_owner: AccountId,
	pub project_token: TokenType,
	pub price_token: TokenType,
	// timestamp information
	pub open_sale_1_timestamp: u64,
	pub open_sale_2_timestamp: u64,
	pub final_sale_2_timestamp: u64,
	pub liquidity_pool_timestamp: u64,

	// financial information
	pub total_amount_sale_project_tokens: u128, //quantity of tokens that will be sold to investors
	pub token_alocation_size: u128, // quantity of tokens that each allocation is composed of
	pub token_allocation_price: u128, //amount of price tokens that need to be paid to buy 1 project allocation
	pub liquidity_pool_project_tokens: u128, // how many project tokens are going to be added to the lp in dex
	// if presale sells off
	pub liquidity_pool_price_tokens: u128, // how many price tokens are going to be added to the lp in dex
	// if presale sells off
	// in case presale does not sell off, the percentage of sold allocations will mutiple the pool size

	// vesting information
	pub fraction_instant_release: u128, // divide by FRACTION_BASE will multiply token_alocation_size to see
	// how many tokens the investor will receive right at the end of presale
	pub cliff_period: u64, // nanoseconds after end of sale to receive vested tokens

	// structure to storage count of tokens in the
	#[serde(skip_serializing)]
	pub listing_treasury: Treasury,

	// keep track of listing phases and progress
	pub status: ListingStatus,
	pub sale_1_sold_out: Option<bool>, // keeps track of whether sale_1 sold out to calculate vesting period
}

impl VListing {
	pub fn new(
		listing_id: u64,
		project_owner: AccountId,
		project_token: TokenType,
		price_token: TokenType,
		open_sale_1_timestamp: u64,
		open_sale_2_timestamp: u64,
		final_sale_2_timestamp: u64,
		liquidity_pool_timestamp: u64,
		total_amount_sale_project_tokens: u128,
		token_alocation_size: u128,
		token_allocation_price: u128,
		liquidity_pool_project_tokens: u128,
		liquidity_pool_price_tokens: u128,
		fraction_instant_release: u128,
		cliff_period: u64,
	) -> Self {
		// assert correct timestamps
		assert!(open_sale_1_timestamp < open_sale_2_timestamp);
		assert!(open_sale_2_timestamp < final_sale_2_timestamp);
		assert!(final_sale_2_timestamp < liquidity_pool_timestamp);

		// assert allocations are a divisor of total projetct tokens
		assert_eq!(total_amount_sale_project_tokens % token_alocation_size, 0);
		Self::V1(Listing {
			listing_id,
			project_owner,
			project_token,
			price_token,
			open_sale_1_timestamp,
			open_sale_2_timestamp,
			final_sale_2_timestamp,
			liquidity_pool_timestamp,

			total_amount_sale_project_tokens,
			token_alocation_size,
			token_allocation_price,
			liquidity_pool_project_tokens,
			liquidity_pool_price_tokens,
			fraction_instant_release,
			cliff_period,
			listing_treasury: Treasury::new(listing_id),
			status: ListingStatus::Unfunded,
			sale_1_sold_out: None,
		})
	}

	#[allow(unreachable_patterns)]
	pub fn cancel_listing(&mut self) {
		match self {
			VListing::V1(listing) => listing.cancel_listing(),
			_ => unimplemented!(),
		}
	}
}

impl Listing {
	pub fn cancel_listing(
		&mut self,
	) {
		match &self.status {
			ListingStatus::Unfunded => (),
			_ => {
				assert!(env::block_timestamp() > self.open_sale_1_timestamp, "{}", ERR_101)
			}
		}

		self.status = ListingStatus::Cancelled;
	}
}
