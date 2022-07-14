create or replace function project_withdraw_listing(
    listing_id u64,
    status listing_status
)
returns void
language sql
as $$
    update listings
    set status = $2
    where listing_id = $1;
$$;
