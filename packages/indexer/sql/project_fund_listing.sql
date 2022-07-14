create or replace function project_fund_listing(listing_id u64)
returns void
language sql
as $$
    update listings
    set status = 'funded'
    where listing_id = $1;
$$;
