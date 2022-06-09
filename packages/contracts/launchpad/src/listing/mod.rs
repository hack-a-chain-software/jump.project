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
	pub allocations_sold: u128,
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
	pub is_treasury_updated: bool, // keeps track of whether treasury has been updated after end of sale or cancellation
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
			allocations_sold: 0,
			liquidity_pool_project_tokens,
			liquidity_pool_price_tokens,
			fraction_instant_release,
			cliff_period,
			listing_treasury: Treasury::new(listing_id),
			status: ListingStatus::Unfunded,
			sale_1_sold_out: None,
			is_treasury_updated: false,
		})
	}

	#[allow(unreachable_patterns)]
	pub fn cancel_listing(&mut self) {
		match self {
			VListing::V1(listing) => listing.cancel_listing(),
			_ => unimplemented!(),
		}
	}

	#[allow(unreachable_patterns)]
	pub fn assert_owner(&self, account_to_validate: AccountId) {
		match self {
			VListing::V1(v) => assert_eq!(v.project_owner, account_to_validate, "{}", ERR_102),
			_ => unimplemented!(),
		}
	}

	#[allow(unreachable_patterns)]
	pub fn withdraw_project_funds(&mut self) {
		match self {
			VListing::V1(v) => v.withdraw_project_funds(),
			_ => unimplemented!(),
		}
	}

	#[allow(unreachable_patterns)]
	pub fn revert_failed_project_owner_withdraw(&mut self, old_value: u128, field: String) {
		match self {
			VListing::V1(v) => v.revert_failed_project_owner_withdraw(old_value, field),
			_ => unimplemented!(),
		}
	}

	#[allow(unreachable_patterns)]
	pub fn assert_funding_token(&self, token_type: TokenType, token_quantity: u128) {
		match self {
			VListing::V1(v) => {
				assert_eq!(token_type, v.project_token, "{}", ERR_104);
				assert_eq!(
					token_quantity,
					v.total_amount_sale_project_tokens + v.liquidity_pool_project_tokens,
					"{}",
					ERR_105
				);
			}
			_ => unimplemented!(),
		}
	}

	#[allow(unreachable_patterns)]
	pub fn fund_listing(&mut self) {
		match self {
			VListing::V1(v) => {
				v.fund_listing();
			},
			_ => unimplemented!(),
		}
	}
}

impl Listing {
	pub fn cancel_listing(&mut self) {
		match &self.status {
			ListingStatus::Unfunded => (),
			_ => {
				assert!(
					env::block_timestamp() > self.open_sale_1_timestamp,
					"{}",
					ERR_101
				)
			}
		}

		self.status = ListingStatus::Cancelled;
	}

	pub fn fund_listing(&mut self) {
		self.listing_treasury.fund_listing(
			self.total_amount_sale_project_tokens,
			self.liquidity_pool_project_tokens,
		)
	}

	fn update_treasury_after_sale(&mut self) {
		if !self.is_treasury_updated {
			match self.status {
				ListingStatus::SaleFinalized | ListingStatus::LiquidityPoolFinalized => {
					let total_allocations = self.total_amount_sale_project_tokens / self.token_alocation_size;
					let excess_project_tokens_liquidity =
						(self.allocations_sold * self.liquidity_pool_project_tokens) / total_allocations;
					let correct_price_tokens_liquidity =
						(self.allocations_sold * self.liquidity_pool_price_tokens) / total_allocations;
					self.listing_treasury.update_treasury_after_sale(
						excess_project_tokens_liquidity,
						correct_price_tokens_liquidity,
					);
				}
				ListingStatus::Cancelled => {
					self.listing_treasury.update_treasury_after_cancelation();
				}
				_ => panic!("{}", ERR_103),
			}
		}
		self.is_treasury_updated = true;
	}

	pub fn withdraw_project_funds(&mut self) {
		match self.status {
			ListingStatus::SaleFinalized
			| ListingStatus::LiquidityPoolFinalized
			| ListingStatus::Cancelled => {
				self.update_treasury_after_sale();
				let withdraw_amounts = self.listing_treasury.withdraw_project_funds();
				self
					.project_token
					.transfer_token(self.project_owner.clone(), withdraw_amounts.0);
				self
					.price_token
					.transfer_token(self.project_owner.clone(), withdraw_amounts.1);
			}
			_ => panic!("{}", ERR_103),
		}
	}

	pub fn revert_failed_project_owner_withdraw(&mut self, old_value: u128, field: String) {
		match field.as_str() {
			"project" => self.listing_treasury.presale_project_token_balance = old_value,
			"price" => {
				self
					.listing_treasury
					.total_received_presale_price_token_balance = old_value
			}
			_ => panic!("wrongly formatted argument"),
		}
	}
}
