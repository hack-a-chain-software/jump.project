create or replace function investor_withdraw_allocations(
    investor_id text,
    listing_id text,
    project_status listing_status,
    project_tokens_withdrawn u128
)
returns void
as $$
begin;
    update allocations
    set quantity_withdrawn = quantity_withdrawn + $4
    where account_id = $1
    and listing_id = $2;

    update listings
    set status = $3
    where listing_id = $2;
end;
$$ language plpgsql volatile;
