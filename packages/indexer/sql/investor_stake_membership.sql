create or replace function investor_stake_membership(investor_id text, token_quantity u128)
returns void
language sql
as $$
    insert into launchpad_investors (account_id, staked_token, last_check)
    values ($1, $2, now())
    on conflict (account_id) do
        update launchpad_investors
        set staked_token = $2  
        where account_id = $1;
$$;
