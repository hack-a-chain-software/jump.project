use super::Event;
use crate::pool::PgPooledConnection;
use crate::types::json_types::{U128, U64};
use crate::types::staking::{split_ids, FungibleTokenBalance, NonFungibleTokenId};
use crate::types::AccountId;
use async_trait::async_trait;
use chrono::{TimeZone, Utc};
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateStakingProgramLog {
    pub collection_address: AccountId,
    pub collection_owner: AccountId,
    pub token_address: AccountId,
    pub collection_rps: FungibleTokenBalance,
    pub min_staking_period: U64,
    pub early_withdraw_penalty: U128,
    pub round_interval: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateStakingProgramLog {
    pub collection_address: AccountId,
    pub early_withdraw_penalty: Option<U128>,
    pub min_staking_period: Option<U64>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StakeNftLog {
    pub token_id: NonFungibleTokenId,
    pub owner_id: AccountId,
    pub staked_timestamp: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UnstakeNftLog {
    pub token_id: NonFungibleTokenId,
    pub withdrawn_balance: U128,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "event", content = "data")]
#[serde(rename_all = "snake_case")]
#[non_exhaustive]
pub enum NftStakingEvent {
    CreateStakingProgram([CreateStakingProgramLog; 1]),
    UpdateStakingProgram([UpdateStakingProgramLog; 1]),
    StakeNft([StakeNftLog; 1]),
    UnstakeNft([UnstakeNftLog; 1]),
}

#[async_trait]
impl Event for NftStakingEvent {
    async fn sql_query(&self, conn: &mut PgPooledConnection) {
        match &self {
            Self::CreateStakingProgram(
                [CreateStakingProgramLog {
                    collection_address,
                    collection_owner,
                    token_address,
                    collection_rps,
                    min_staking_period,
                    early_withdraw_penalty,
                    round_interval,
                }],
            ) => {
                conn.query(
                    "
                    insert into staking_programs (
                        collection_id,
                        collection_owner,
                        token_address,
                        min_staking_period,
                        early_withdraw_penalty,
                        round_interval
                    )
                    values ($1, $2, $3, $4, $5, $6, $7)
                ",
                    &[
                        collection_address,
                        collection_owner,
                        token_address,
                        &Decimal::from_u64(min_staking_period.0).unwrap(),
                        &Decimal::from_u128(early_withdraw_penalty.0).unwrap(),
                        round_interval,
                    ],
                )
                .await
                .unwrap();
            }

            &Self::UpdateStakingProgram(
                [UpdateStakingProgramLog {
                    collection_address,
                    early_withdraw_penalty,
                    min_staking_period,
                }],
            ) => {
                conn.query(
                    "
                    update staking_programs
                    set
                        early_withdraw_penalty = coallesce($2, early_withdraw_penalty)
                        min_staking_period = coallesce($3, min_staking_period)
                    where collection_id = $1",
                    &[
                        collection_address,
                        &early_withdraw_penalty.and_then(|v| Decimal::from_u128(v.0)),
                        &min_staking_period.and_then(|v| Decimal::from_u64(v.0)),
                    ],
                )
                .await
                .unwrap();
            }

            Self::StakeNft(
                [StakeNftLog {
                    token_id,
                    owner_id,
                    staked_timestamp,
                }],
            ) => {
                let (collection_id, nft_id) = split_ids(token_id);

                conn.query(
                    "
                    insert into staked_nfts (
                        nft_id,
                        collection_id,
                        owner_id,
                        staked_timestamp
                    )
                    values ($1, $2, $3, $4, $5)
                ",
                    &[
                        nft_id,
                        collection_id,
                        owner_id,
                        &Utc.timestamp(*staked_timestamp as i64, 0),
                    ],
                )
                .await
                .unwrap();
            }

            Self::UnstakeNft(
                [UnstakeNftLog {
                    token_id,
                    withdrawn_balance,
                }],
            ) => {
                let (collection_id, nft_id) = split_ids(token_id);

                conn.query(
                    "
                    delete from staked_nfts
                    where nft_id = $1
                    and collection_id = $2
                ",
                    &[nft_id, collection_id],
                )
                .await
                .unwrap();
            }
        }
    }
}
