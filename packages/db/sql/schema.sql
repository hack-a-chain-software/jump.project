create domain u64 as numeric(21)
default 0
check (value >= 0 and value <= 18446744073709551615)
not null;

create domain nullable_u64 as numeric(21)
check (value >= 0 and value <= 18446744073709551615);

create domain u128 as numeric(40)
default 0
check (value >= 0 and value <= 340282366920938463463374607431768211455)
not null;

/* Esses aq eu n tenho ideia */

create table if not exists launchpad_investors (
    account_id text primary key,
    staked_token u128,
    last_check timestamptz
);

create type listing_status as enum (
    'unfunded',
    'funded',
    'sale_finalized',
    'pool_created',
    'pool_project_token_sent',
    'pool_price_token_sent',
    'liquidity_pool_finalized',
    'cancelled'
);

create table if not exists listings (
    listing_id u64 primary key,
    status listing_status not null,
    project_owner text references launchpad_investors (account_id),
    project_token text not null,
    price_token text not null, 

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
    dex_id nullable_u64
);

create table if not exists allocations (
    account_id text primary key,
    listing_id u64 references listings (listing_id),

    quantity_withdrawn u128,
    total_quantity u128,
    total_allocation u64
);

/* Esses aqui eu tenho */

create table if not exists nft_investors (
    account_id text primary key,
    storage_deposit u128,
    storage_used u128
);

create table if not exists staking_programs (
    collection_id text primary key,
    collection_owner_id text not null,
    collection_treasury numeric(40)[] not null,
    token_address text not null,

    min_staking_period u64,
    early_withdraw_penalty u128,
    farm jsonb not null -- TODO: modelar isso direito
);

create table if not exists staked_nfts (
    nft_id text not null,
    collection_id text references staking_programs (collection_id),
    primary key (collection_id, nft_id),

    owner_id text references nft_investors (account_id),
    balance numeric(40)[],

    staked_timestamp timestamptz
);
