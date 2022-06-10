use std::convert::TryInto;
use near_sdk::{AccountId, env, Promise};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize};
use near_sdk::json_types::{U64, U128};

use crate::events;
use crate::ext_interface::{ext_self};
use crate::listing::treasury::{Treasury};
use crate::token_handler::{TokenType, GAS_FOR_FT_TRANSFER_CALLBACK};
use crate::errors::*;

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
	pub allocations_sold: u64,
	pub liquidity_pool_project_tokens: u128, // how many project tokens are going to be added to the lp in dex
	// if presale sells off
	pub liquidity_pool_price_tokens: u128, // how many price tokens are going to be added to the lp in dex
	// if presale sells off
	// in case presale does not sell off, the percentage of sold allocations will mutiple the pool size

	// vesting information
	pub fraction_instant_release: u128, // divide by FRACTION_BASE will multiply token_alocation_size to see
	// how many tokens the investor will receive right at the end of presale
	pub cliff_timestamp: u64, // nanoseconds after end of sale to receive vested tokens

	// structure to storage count of tokens in the
	#[serde(skip_serializing)]
	pub listing_treasury: Treasury,

	// keep track of listing phases and progress
	pub status: ListingStatus,
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
		cliff_timestamp: u64,
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
			cliff_timestamp,
			listing_treasury: Treasury::new(listing_id),
			status: ListingStatus::Unfunded,
			is_treasury_updated: false,
		})
	}

	#[allow(unreachable_patterns)]
	pub fn into_current(self) -> Listing {
		match self {
			VListing::V1(l) => l,
			_ => unimplemented!(),
		}
	}
}

pub enum SalePhase {
	Phase1,
	Phase2,
}

impl Listing {
	pub fn assert_owner(&self, account_id: &AccountId) {
		assert_eq!(self.project_owner, account_id, "{}", ERR_102);
	}

	pub fn assert_funding_token(&self, token_type: TokenType, amount: u128) {
		assert_eq!(self.project_token, token_type, "{}", ERR_104);
		assert_eq!(
			self.total_amount_sale_project_tokens + self.liquidity_pool_project_tokens,
			token_type,
			"{}",
			ERR_104
		);
	}

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
		);
		self.status = ListingStatus::Funded;
		events::project_fund_listing(
			self.listing_id,
			self.total_amount_sale_project_tokens,
			self.liquidity_pool_project_tokens,
		);
	}

	fn update_treasury_after_sale(&mut self) {
		if !self.is_treasury_updated {
			match self.status {
				ListingStatus::SaleFinalized | ListingStatus::LiquidityPoolFinalized => {
					let total_allocations = self.total_amount_sale_project_tokens / self.token_alocation_size;
					let excess_project_tokens_liquidity = (self.allocations_sold as u128
						* self.liquidity_pool_project_tokens)
						/ total_allocations;
					let correct_price_tokens_liquidity =
						(self.allocations_sold as u128 * self.liquidity_pool_price_tokens) / total_allocations;
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
					.transfer_token(self.project_owner.clone(), withdraw_amounts.0)
					.then(
						ext_self::ext(env::current_account_id())
							.with_static_gas(GAS_FOR_FT_TRANSFER_CALLBACK)
							.callback_token_transfer_to_project_owner(
								U64(self.listing_id),
								U128(withdraw_amounts.0),
								"project".to_string(),
							),
					);
				self
					.price_token
					.transfer_token(self.project_owner.clone(), withdraw_amounts.1)
					.then(
						ext_self::ext(env::current_account_id())
							.with_static_gas(GAS_FOR_FT_TRANSFER_CALLBACK)
							.callback_token_transfer_to_project_owner(
								U64(self.listing_id),
								U128(withdraw_amounts.1),
								"price".to_string(),
							),
					);

				events::project_withdraw_listing(
					self.listing_id,
					withdraw_amounts.0,
					withdraw_amounts.1,
					&self.status,
				);
			},
			ListingStatus::Funded => {
				if env::block_timestamp() > self.final_sale_2_timestamp {
					self.status = ListingStatus::SaleFinalized;
					self.withdraw_project_funds()
				} else {
					panic!("{}", ERR_103)
				}
			},
			_ => panic!("{}", ERR_103),
		}
	}

	pub fn revert_failed_project_owner_withdraw(&mut self, old_value: u128, field: String) {
		match field.as_str() {
			"project" => {
				self.listing_treasury.presale_project_token_balance = old_value;
			}
			"price" => {
				self
					.listing_treasury
					.total_received_presale_price_token_balance = old_value
			}
			_ => panic!("wrongly formatted argument"),
		}
		events::project_withdraw_reverted_error(self.listing_id, old_value, field);
	}

	pub fn get_current_sale_phase(&self) -> SalePhase {
		match self.status {
			ListingStatus::Funded => {
				let timestamp = env::block_timestamp();
				if self.open_sale_1_timestamp <= timestamp {
					if self.open_sale_2_timestamp <= timestamp {
						SalePhase::Phase2
					} else {
						SalePhase::Phase1
					}
				} else {
					panic!("ERR_OPERATIONAL")
				}
			}
			_ => panic!("{}", ERR_106),
		}
	}

	pub fn buy_allocation(
		&mut self,
		price_token_amount: u128,
		investor_allowance: u64,
	) -> (u64, u128) {
		let total_allocations = self.total_amount_sale_project_tokens / self.token_alocation_size;
		let available_allocations = total_allocations - self.allocations_sold as u128;
		let try_allocations_buy = self.token_allocation_price / price_token_amount;
		if try_allocations_buy > investor_allowance as u128 {
			try_allocations_buy = investor_allowance as u128;
		}

		let allocations_bought: u64;
		let leftover: u128;
		if try_allocations_buy >= available_allocations {
			allocations_bought = available_allocations.try_into().unwrap();
			leftover = price_token_amount - (allocations_bought as u128 * self.token_allocation_price);
			self.status = ListingStatus::SaleFinalized
		} else {
			allocations_bought = try_allocations_buy.try_into().unwrap();
			leftover = price_token_amount - (allocations_bought as u128 * self.token_allocation_price);
		}
		self.allocations_sold += allocations_bought;
		self.listing_treasury.update_after_investment(
			allocations_bought as u128 * self.token_alocation_size,
			allocations_bought as u128 * self.token_allocation_price,
		);
		(allocations_bought, leftover)
	}

	pub fn withdraw_investor_funds(
		&mut self,
		allocations_to_withdraw: u64,
		investor_id: AccountId,
	) -> Promise {
		match self.status {
			ListingStatus::SaleFinalized
			| ListingStatus::LiquidityPoolFinalized
			| ListingStatus::Cancelled => {
				self.update_treasury_after_sale();
				let withdraw_amounts = self
					.listing_treasury
					.withdraw_investor_funds(allocations_to_withdraw);
				events::investor_withdraw_allocations(
					self.listing_id,
					withdraw_amounts.0,
					withdraw_amounts.1,
					&self.status,
				);
				if withdraw_amounts.0 > 0 {
					self
						.project_token
						.transfer_token(self.project_owner.clone(), withdraw_amounts.0)
						.then(
							ext_self::ext(env::current_account_id())
								.with_static_gas(GAS_FOR_FT_TRANSFER_CALLBACK)
								.callback_token_transfer_to_investor(
									investor_id,
									U64(self.listing_id),
									U64(allocations_to_withdraw),
									U128(withdraw_amounts.0),
									"project".to_string(),
								),
						)
				} else {
					self
						.price_token
						.transfer_token(self.project_owner.clone(), withdraw_amounts.1)
						.then(
							ext_self::ext(env::current_account_id())
								.with_static_gas(GAS_FOR_FT_TRANSFER_CALLBACK)
								.callback_token_transfer_to_investor(
									investor_id,
									U64(self.listing_id),
									U64(allocations_to_withdraw),
									U128(withdraw_amounts.1),
									"price".to_string(),
								),
						)
				}
			},
			ListingStatus::Funded => {
				if env::block_timestamp() > self.final_sale_2_timestamp {
					self.status = ListingStatus::SaleFinalized;
					self.withdraw_investor_funds(allocations_to_withdraw, investor_id)
				} else {
					panic!("{}", ERR_103)
				}
			},
			_ => panic!("{}", ERR_103),
		}
	}

	pub fn revert_failed_investor_withdraw(&mut self, returned_value: u128, field: String) {
		match field.as_str() {
			"project" => {
				self.listing_treasury.all_investors_project_token_balance += returned_value;
			}
			"price" => self.listing_treasury.cancellation_funds_price_tokens += returned_value,
			_ => panic!("wrongly formatted argument"),
		}
		events::investor_withdraw_reverted_error(self.listing_id, returned_value, field);
	}
}
