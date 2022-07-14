create or replace function investor_buy_allocations(
    investor_id text,
    listing_id text,
    project_status listing_status,
    allocations_purchased u64
)
returns void
as $$
begin;
    -- TODO: we need to create allocations first
    update allocations
    set total_allocation = total_allocation + $4
    where account_id = $1
    and listing_id = $2;

    update listings
    set
        status = $3
        allocations_sold = allocations_sold + $4
    where listing_id = $2;
end;
$$ language plpgsql volatile;
