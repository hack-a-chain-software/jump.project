use crate::pool::PgPooledConnection;
use crate::types::json_types::{U128, U64};
use crate::types::listing::{Listing, ListingStatus, SalePhase};
use crate::types::AccountId;
use chrono::{TimeZone, Utc};
use rust_decimal::{prelude::FromPrimitive, Decimal};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct AddGuardianLog {
    new_guardian: AccountId,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RemoveGuardianLog {
    old_guardian: AccountId,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RetrieveTreasuryFundsLog {
    token_type: AccountId,
    quantity: U128,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateListingLog {
    listing_data: Listing,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CancelListingLog {
    listing_id: U64,
}

#[derive(Serialize, Deserialize, Debug)]

pub struct ProjectFundListingLog {
    listing_id: U64,
    tokens_sale: U128,
    tokens_liquidity: U128,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ProjectWithdrawListingLog {
    listing_id: U64,
    project_tokens_withdraw: U128,
    price_tokens_withdraw: U128,
    project_status: ListingStatus,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InvestorBuyAllocationsLog {
    investor_id: AccountId,
    listing_id: U64,
    project_status: ListingStatus,
    sale_phase: SalePhase,
    allocations_purchased: U64,
    tokens_purchased: U128,
    total_allocations_sold: U64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InvestorWithdrawAllocationsLog {
    investor_id: AccountId,
    listing_id: U64,
    project_status: ListingStatus,
    project_tokens_withdrawn: U128,
    price_tokens_withdrawn: U128,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InvestorStakeMembershipLog {
    investor_id: AccountId,
    token_quantity: U128,
    new_membership_level: U64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InvestorUnstakeMembershipLog {
    investor_id: AccountId,
    token_quantity: U128,
    new_membership_level: U64,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "event", content = "data")]
#[serde(rename_all = "snake_case")]
#[non_exhaustive]
pub enum LaunchpadEvent {
    AddGuardian([AddGuardianLog; 1]),
    RemoveGuardian([RemoveGuardianLog; 1]),
    RetrieveTreasuryFunds([RetrieveTreasuryFundsLog; 1]),
    CreateListing([CreateListingLog; 1]),
    CancelListing([CancelListingLog; 1]),
    ProjectFundListing([ProjectFundListingLog; 1]),
    ProjectWithdrawListing([ProjectWithdrawListingLog; 1]),
    InvestorBuyAllocations([InvestorBuyAllocationsLog; 1]),
    InvestorWithdrawAllocations([InvestorWithdrawAllocationsLog; 1]),
    InvestorStakeMembership([InvestorStakeMembershipLog; 1]),
    InvestorUnstakeMembership([InvestorUnstakeMembershipLog; 1]),
}

// &Self::AddGuardian(&[AddGuardianLog { new_guardian }]) => None,

// &Self::RemoveGuardian(&[RemoveGuardian{ old_guardian }]) => None,

// &Self::RetrieveTreasuryFunds {
//     token_type,
//     quantity,
// }] => None,

impl LaunchpadEvent {
    //                                      TODO: change this dummy return value
    pub async fn sql_query(&self, conn: &mut PgPooledConnection) -> Option<u8> {
        match &self {
            &Self::CreateListing([CreateListingLog { listing_data }]) => {
                conn.execute(
                    "
                    insert into listings (
                        listing_id,
                        status,
                        project_owner,
                        project_token,
                        price_token, 

                        open_sale_1_timestamp,
                        open_sale_2_timestamp,
                        final_sale_2_timestamp,
                        liquidity_pool_timestamp,
                        
                        total_amount_sale_project_tokens,
                        token_allocation_size,
                        token_allocation_price,
                        allocations_sold,
                        liquidity_pool_project_tokens,
                        liquidity_pool_price_tokens,
                        fraction_instant_release,
                        fraction_cliff_release,
                        cliff_timestamp,
                        end_cliff_timestamp,
                        fee_price_tokens,
                        fee_liquidity_tokens,
                        dex_id
                    )
                    values (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
                        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
                    )
                ",
                    &[
                        &Decimal::from_u64(listing_data.listing_id).unwrap(),
                        &listing_data.status,
                        &listing_data.project_owner,
                        &listing_data.project_token,
                        &listing_data.price_token,
                        &Utc.timestamp(listing_data.open_sale_1_timestamp.try_into().unwrap(), 0),
                        &Utc.timestamp(listing_data.open_sale_2_timestamp.try_into().unwrap(), 0),
                        &Utc.timestamp(listing_data.final_sale_2_timestamp.try_into().unwrap(), 0),
                        &Utc.timestamp(
                            listing_data.liquidity_pool_timestamp.try_into().unwrap(),
                            0,
                        ),
                        &Decimal::from_u128(listing_data.total_amount_sale_project_tokens).unwrap(),
                        &Decimal::from_u128(listing_data.token_allocation_size).unwrap(),
                        &Decimal::from_u128(listing_data.token_allocation_price).unwrap(),
                        &Decimal::from_u64(listing_data.allocations_sold).unwrap(),
                        &Decimal::from_u128(listing_data.liquidity_pool_project_tokens).unwrap(),
                        &Decimal::from_u128(listing_data.liquidity_pool_price_tokens).unwrap(),
                        &Decimal::from_u128(listing_data.fraction_instant_release).unwrap(),
                        &Decimal::from_u128(listing_data.fraction_cliff_release).unwrap(),
                        &Utc.timestamp(listing_data.cliff_timestamp.try_into().unwrap(), 0),
                        &Utc.timestamp(listing_data.end_cliff_timestamp.try_into().unwrap(), 0),
                        &Decimal::from_u128(listing_data.fee_price_tokens).unwrap(),
                        &Decimal::from_u128(listing_data.fee_liquidity_tokens).unwrap(),
                        &listing_data.dex_id.map(|v| Decimal::from_u64(v)),
                    ],
                )
                .await
                .unwrap();
                None
            }

            // ListingStatus::Cancelled
            &Self::CancelListing([CancelListingLog { listing_id }]) => {
                conn.execute(
                    "update listings set status = 'canceled' where listing_id = $1;",
                    &[&Decimal::from_u64(listing_id.0).unwrap()],
                )
                .await
                .unwrap();

                None
            }

            &Self::ProjectFundListing(
                [ProjectFundListingLog {
                    listing_id,
                    tokens_sale,
                    tokens_liquidity,
                }],
            ) => {
                conn.execute(
                    "update listings set status = 'funded' where listing_id = $1;",
                    &[&Decimal::from_u64(listing_id.0).unwrap()],
                )
                .await
                .unwrap();

                None
            }

            &Self::ProjectWithdrawListing(
                [ProjectWithdrawListingLog {
                    listing_id,
                    project_tokens_withdraw,
                    price_tokens_withdraw,
                    project_status,
                }],
            ) => {
                conn.execute(
                    "
                    update listings
                    set status = $2
                    where listing_id = $1;",
                    &[&Decimal::from_u64(listing_id.0).unwrap(), &project_status],
                )
                .await
                .unwrap();

                None
            }

            &Self::InvestorBuyAllocations(
                [InvestorBuyAllocationsLog {
                    investor_id,
                    listing_id,
                    project_status,
                    sale_phase,
                    allocations_purchased,
                    tokens_purchased,
                    total_allocations_sold,
                }],
            ) => {
                conn.execute(
                    "select investor_buy_allocations($1, $2, $3, $4, $5, $6)",
                    &[
                        investor_id,
                        &Decimal::from_u64(listing_id.0).unwrap(),
                        project_status,
                        &Decimal::from_u64(allocations_purchased.0).unwrap(),
                        &Decimal::from_u128(tokens_purchased.0).unwrap(),
                        &Decimal::from_u64(total_allocations_sold.0).unwrap(),
                    ],
                )
                .await
                .unwrap();

                None
            }

            &Self::InvestorWithdrawAllocations(
                [InvestorWithdrawAllocationsLog {
                    investor_id,
                    listing_id,
                    project_tokens_withdrawn,
                    price_tokens_withdrawn,
                    project_status,
                }],
            ) => {
                conn.execute(
                    "select investor_withdraw_allocations($1, $2, $3)",
                    &[
                        investor_id,
                        &Decimal::from_u64(listing_id.0).unwrap(),
                        project_status,
                        &Decimal::from_u128(project_tokens_withdrawn.0).unwrap(),
                        &Decimal::from_u128(price_tokens_withdrawn.0).unwrap(),
                    ],
                )
                .await
                .unwrap();

                None
            }

            &Self::InvestorStakeMembership(
                [InvestorStakeMembershipLog {
                    investor_id,
                    token_quantity,
                    new_membership_level,
                }],
            ) => {
                conn.execute(
                    "
                    insert into launchpad_investors (account_id, staked_token, last_check)
                    values ($1, $2, now())
                    on conflict (account_id)
                    do
                        update launchpad_investors
                        set staked_token = $2;",
                    &[investor_id, &Decimal::from_u128(token_quantity.0).unwrap()],
                )
                .await
                .unwrap();

                None
            }

            &Self::InvestorUnstakeMembership(
                [InvestorUnstakeMembershipLog {
                    investor_id,
                    token_quantity,
                    new_membership_level,
                }],
            ) => {
                conn.execute(
                    "
                    update launchpad_investors
                    set staked_token = $2  
                    where account_id = $1",
                    &[investor_id, &Decimal::from_u128(token_quantity.0).unwrap()],
                )
                .await
                .unwrap();

                None
            }

            _ => unimplemented!(),
        }
    }
}
