use super::AccountId;
use postgres_types::{FromSql, ToSql};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum SalePhase {
    Phase1,
    Phase2,
}

#[derive(Debug, ToSql, FromSql, Deserialize, Serialize)]
pub enum ListingStatus {
    Unfunded,
    Funded,
    SaleFinalized,
    PoolCreated,
    PoolProjectTokenSent,
    PoolPriceTokenSent,
    LiquidityPoolFinalized,
    Cancelled,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Listing {
    pub listing_id: u64,
    pub project_owner: AccountId,
    pub project_token: AccountId,
    pub price_token: AccountId,
    pub open_sale_1_timestamp: u64,
    pub open_sale_2_timestamp: u64,
    pub final_sale_2_timestamp: u64,
    pub liquidity_pool_timestamp: u64,
    pub total_amount_sale_project_tokens: u128,
    pub token_allocation_size: u128,
    pub token_allocation_price: u128,
    pub allocations_sold: u64,
    pub liquidity_pool_project_tokens: u128,
    pub liquidity_pool_price_tokens: u128,
    pub fraction_instant_release: u128,
    pub fraction_cliff_release: u128,
    pub cliff_timestamp: u64,
    pub end_cliff_timestamp: u64,
    pub fee_price_tokens: u128,
    pub fee_liquidity_tokens: u128,

    pub status: ListingStatus,

    pub dex_id: Option<u64>,
}
