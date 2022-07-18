create or replace function investor_buy_allocations(
    investor_id text,
    listing_id text,
    project_status listing_status,
    allocations_purchased u64,
    tokens_purchased u128
    total_allocations_sold u64,
)
returns void
as $$
begin;
    -- TODO: we need to create allocations first
    insert into allocations (account_id, listing_id, total_allocation, total_quantity, quantity_withdrawn)
    values ($1, $2, $4, $5, 0)
    on conflict (account_id, listing_id)
    do
        update allocations
        set
            total_allocation = total_allocation + $4
            total_quantity = total_quantity + $5;

    update listings
    set
        status = $3
        allocations_sold = $6
    where listing_id = $2;
end;
$$ language plpgsql volatile;
