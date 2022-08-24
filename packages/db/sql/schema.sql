/* X token */
create table if not exists x_token_ratios (
    key_column bigserial primary key,
    time_event timestamptz,
    base_token_amount numeric(40),
    x_token_amount numeric(40)
);

/* Launchpad */

create table if not exists launchpad_investors (
    account_id text primary key,
    staked_token numeric(40),
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
    listing_id numeric(21) primary key,
    public boolean default true,
    status listing_status not null,
    project_owner text,
    project_token text not null,
    price_token text not null, 

    open_sale_1_timestamp timestamptz,
    open_sale_2_timestamp timestamptz,
    final_sale_2_timestamp timestamptz,
    liquidity_pool_timestamp timestamptz,
    
    total_amount_sale_project_tokens numeric(40),
    token_allocation_size numeric(40),
    token_allocation_price numeric(40),
    allocations_sold numeric(21),
    liquidity_pool_project_tokens numeric(40),
    liquidity_pool_price_tokens numeric(40),
    fraction_instant_release numeric(40),
    fraction_cliff_release numeric(40),
    cliff_timestamp timestamptz,
    end_cliff_timestamp timestamptz,
    fee_price_tokens numeric(40),
    fee_liquidity_tokens numeric(40),
    dex_id numeric(21)
);

create table if not exists listings_metadata (
    listing_id numeric(21) primary key references listings (listing_id),
    project_name text,
    description_token text,
    description_project text,
    discord text,
    twitter text,
    telegram text,
    website text,
    whitepaper text
);

create table if not exists allocations (
    account_id text not null,
    listing_id numeric(21) references listings (listing_id),
    primary key (account_id, listing_id),

    quantity_withdrawn numeric(40),
    total_quantity numeric(40),
    total_allocation numeric(21)
);

/* NFT Staking */

create table if not exists staking_programs (
    collection_id text primary key,
    collection_owner_id text not null,
    token_address text not null,
    min_staking_period numeric(21),
    early_withdraw_penalty numeric(40),
    round_interval numeric(21)
);

create table if not exists staking_programs_metadata (
    collection_id text primary key references staking_programs (collection_id),
    collection_image text,
    collection_modal_image text
);

create table if not exists staked_nfts (
    nft_id text not null,
    collection_id text references staking_programs (collection_id),
    primary key (collection_id, nft_id),

    owner_id text,

    staked_timestamp timestamptz
);

create or replace function investor_buy_allocations(
    investor_id text,
    listing_id_var numeric(21),
    project_status listing_status,
    allocations_purchased numeric(21),
    tokens_purchased numeric(40),
    total_allocations_sold numeric(21)
)
returns void
as $$
begin
    insert into allocations (account_id, listing_id, total_allocation, total_quantity, quantity_withdrawn)
    values ($1, $2, $4, $5, 0)
    on conflict (account_id, listing_id)
    do
        update
        set
            total_allocation = allocations.total_allocation + $4,
            total_quantity = allocations.total_quantity + $5;

    update listings
    set
        status = $3,
        allocations_sold = $6
    where listing_id = $2;
end
$$
language plpgsql volatile;
