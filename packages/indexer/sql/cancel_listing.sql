create or replace function cancel_listing(listing_id u64)
returns void
language sql
as $$
    update listings
    set status = 'canceled'
    where listing_id = $1;
$$;
