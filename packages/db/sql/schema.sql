create domain ftext as text
check (length(value) > 0)
not null;

create domain account_id as ftext;

create domain u64 as numeric(20) -- TODO: testar se eu não errei por 1 (ou log_2(10))
default 0
check (value >= 0)
not null;

create domain nullable_u64 as numeric(20)
check (value >= 0);

create domain u128 as numeric(40)
default 0
check (value >= 0)
not null;


/* Esses aq eu n tenho ideia */

create table if not exists launchpad_investors (
    account_id account_id primary key,
    staked_token u128,
    last_check timestamptz
);

create table if not exists listings (
    listing_id u64 primary key,
    project_owner account_id references launchpad_investors (account_id),
    project_token account_id,
    price_token account_id, 

    open_sale_1_timestamp timestamptz,
    open_sale_2_timestamp timestamptz,
    final_sale_2_timestamp timestamptz,
    liquidity_pool_timestamp timestamptz,
    
    total_ammount_sale_project_tokens u128,
    token_allocation_size u128,
    token_allocation_price u128,
    allocations_sold u64,
    liquidity_pool_project_tokens u128,
    liquidity_pool_price_tokens u128,
    fraction_instant_release u128,
    fraction_cliff_release u128,
    cliff_timestamp timestamptz,
    end_cliff_timestamp timestamptz,
    fee_price_tokens u128,
    fee_liquidity_tokens u128,
    status ftext, -- TODO: mudar pra enum
    dex_id nullable_u64
);

create table if not exists allocations (
    account_id account_id primary key,
    listing_id u64 references listings (listing_id),

    quantity_withdrawn u128,
    total_quantity u128,
    total_allocation u64
);

/* STATUS
pub enum ListingStatus {
  Unfunded,      // project has not yet deposited initial funds to start the offer
  Funded,        // project has received all resources
  SaleFinalized, // sale is finalized, either by selling off or selling over the minum threshold and
  // the final_sale_2_timestamp arriving
  PoolCreated,
  PoolProjectTokenSent,
  PoolPriceTokenSent,
  LiquidityPoolFinalized, // liquidity pool has been sent to dex
  Cancelled,              // either target not met or manual cancel, everyone can withdraw assets
}
*/

/* Esses aqui eu tenho */

create table if not exists nft_investors (
    account_id account_id primary key,
    storage_deposit u128,
    storage_used u128
);

create table if not exists staking_programs (
    collection_id account_id primary key,
    collection_owner_id account_id,
    collection_treasury u128[] not null,
    token_address account_id,

    min_staking_period u64,
    early_withdraw_penalty u128,
    farm jsonb not null -- TODO: modelar isso direito
);

create table if not exists staked_nfts (
    nft_id ftext,
    collection_id account_id references staking_programs (collection_id),
    primary key (collection_id, nft_id),

    owner_id account_id references nft_investors (account_id),
    balance u128[],

    staked_timestamp timestamptz
);
