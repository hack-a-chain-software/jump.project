use std::path::Path;
use workspaces::{Contract, Account, AccountId, DevNetwork, Worker};
use workspaces::network::Sandbox;
use std::vec::Vec;
use std::io::Error;
use serde_json::json;
use std::collections::HashMap;
use std::str::{from_utf8};
use futures::future::{join_all};
use near_units::parse_near;

mod methods;

use methods::*;

const OUT_DIR: &str = "../../out";

const FRACTION_BASE: u128 = 10_000;

const SPOON_BLOCK_HEIGHT: u64 = 65_000_000;
const REF_FINANCE_ID: &str = "v2.ref-finance.near";

const TO_NANO: u64 = 1_000_000_000;
const AVERAGE_BLOCK_TIME: u64 = 1_200_000_000;

const GAS_LIMIT: u64 = 300_000_000_000_000;
const DEFAULT_GAS: u64 = 3_000_000_000_000;

const FT_DECIMALS: u8 = 24;

const USER_ACCOUNT_BALANCE: u128 = 5_000_000_000_000_000_000_000_000;
const CONTRACT_ACCOUNT_BALANCE: u128 = 200_000_000_000_000_000_000_000_000;

/// integration test happy case - normal listing
/// aims to test full aplication fliw for a single listing
/// 1. Initialize contracts
/// 2. Assign guardian
/// 3. Create new listing
/// 4. Fund listing
/// 5. Time travel to phase 1 sale
/// 6. Launchpad members buy
/// 7. Non members try to buy and fail
/// 8. Time travel to phase 2 sale
/// 9. everyone buys
/// 10. Time travel to phase 2 end
/// 11. Project owner withdraws
/// 12. Investors withdraw initial release
/// 13. Time travel to cliff period
/// 14. Investors withdraw vested tokens
/// 15. Time travel to after cliff end
/// 16. Investors withdraw full token amount
/// 17. Time travel to dex launch time
/// 18. Launch on dex
#[tokio::main]
async fn main() -> anyhow::Result<()> {
  let worker: Worker<Sandbox> = workspaces::sandbox().await?;

  let root = worker.root_account();

  println!("Worker initialized.");
  // CREATE USER ACCOUNTS
  let owner = create_user_account(&root, &worker, "owner").await;
  let guardian = create_user_account(&root, &worker, "guardian").await;
  let project_owner = create_user_account(&root, &worker, "project_owner").await;
  let investor_1 = create_user_account(&root, &worker, "investor1").await;
  let investor_2 = create_user_account(&root, &worker, "investor2").await;
  let investor_3 = create_user_account(&root, &worker, "investor3").await;

  println!("User accounts created.");

  // 1. Initialize contracts
  // DEPLOY & INITIALIZE FT CONTRACTS

  let ft_wasm = get_wasm("token_contract.wasm")?;
  let ft_price = deploy_contract(&root, &worker, "ft_contract_price", &ft_wasm).await;
  initialize_ft_contract(&worker, &ft_price, &root).await;
  let ft_project = deploy_contract(&root, &worker, "ft_contract_project", &ft_wasm).await;
  initialize_ft_contract(&worker, &ft_project, &project_owner).await;
  let ft_xtoken = deploy_contract(&root, &worker, "ft_contract_xtoken", &ft_wasm).await;
  initialize_ft_contract(&worker, &ft_xtoken, &root).await;

  // SPOON REF.FINANCE FROM MAINNET

  let ref_finance = spoon_contract(REF_FINANCE_ID, &worker).await?;
  owner
    .call(&worker, ref_finance.id(), "new")
    .args_json(json!({
      "owner_id": owner.id(),
      "exchange_fee": 10u32,
      "referral_fee": 10u32
    }))?
    .gas(DEFAULT_GAS)
    .transact()
    .await?;
  // initialize relevant ref state

  // DEPLOY & INITIALIZE LAUNCHPAD CONTRACT

  let launchpad_wasm = get_wasm("launchpad.wasm").unwrap();
  let launchpad = deploy_contract(&root, &worker, "launchpad", &launchpad_wasm).await;

  let token_lock_period: u64 = 60 * 60 * 24 * 14 * TO_NANO;
  let tiers_minimum_tokens: Vec<u128> = vec![1000, 2000, 3000, 4000, 5000, 6000, 7000]
    .into_iter()
    .map(|v| v * FT_DECIMALS as u128)
    .collect();
  let tiers_entitled_allocations: Vec<u64> = vec![1, 2, 3, 4, 5, 6, 7];
  let allowance_phase_2: u64 = 2;

  launchpad
    .call(&worker, "new")
    .args_json(json!({
      "owner": owner.id(),
      "contract_settings": {
        "membership_token": ft_xtoken.id(),
        "token_lock_period": token_lock_period.to_string(),
        "tiers_minimum_tokens": tiers_minimum_tokens.iter().map(|v| v.to_string()).collect::<Vec<String>>(),
        "tiers_entitled_allocations": tiers_entitled_allocations.iter().map(|v| v.to_string()).collect::<Vec<String>>(),
        "allowance_phase_2": allowance_phase_2.to_string(),
        "partner_dex": ref_finance.id(),
      }
    }))?
    .gas(DEFAULT_GAS)
    .transact()
    .await?;

  println!("Contracts deployed and initialized.");

  let accounts = vec![
    &owner,
    &guardian,
    &project_owner,
    &investor_1,
    &investor_2,
    &investor_3,
    launchpad.as_account(),
    ref_finance.as_account(),
  ];

  let contracts = vec![&launchpad, &ref_finance, &ft_price, &ft_project, &ft_xtoken];

  bulk_register_storage(&worker, accounts, contracts).await?;

  println!("Accounts registered to storage");

  // 2. Assign guardian
  owner
    .call(&worker, launchpad.id(), "assign_guardian")
    .args_json(json!({
      "new_guardian": guardian.id()
    }))?
    .deposit(1)
    .transact()
    .await?;

  // 3. Create new listing

  // timestamps
  let half_hour: u64 = 60 * 30;
  let block_info = worker.view_latest_block().await?;
  let current_ts = block_info.timestamp() / TO_NANO;
  let open_sale_1_timestamp_seconds = current_ts + half_hour;
  let open_sale_2_timestamp_seconds = open_sale_1_timestamp_seconds + half_hour;
  let final_sale_2_timestamp_seconds = open_sale_2_timestamp_seconds + half_hour;
  let liquidity_pool_timestamp_seconds = final_sale_2_timestamp_seconds + half_hour;
  let cliff_timestamp_seconds = liquidity_pool_timestamp_seconds + half_hour;
  let end_cliff_timestamp_seconds = cliff_timestamp_seconds + half_hour;

  // token amounts
  let total_amount_sale_project_tokens = 1_000_000_000;
  let liquidity_pool_project_tokens = 500_000_000;
  let token_allocation_size = 1_000;
  let token_allocation_price: u128 = 500;
  let liquidity_pool_price_tokens = 400_000_000;

  // vesting shares
  let fraction_instant_release = 4_000;
  let fraction_cliff_release = 5_000;

  // launchpad fees
  let fee_price_tokens = 100;
  let fee_liquidity_tokens = 100;

  let listing_id: u64 = guardian
    .call(&worker, launchpad.id(), "create_new_listing")
    .args_json(json!({
      "listing_data": {
        "project_owner": project_owner.id(),
        "project_token": ft_project.id(),
        "price_token": ft_price.id(),
        "listing_type": "Public",
        "open_sale_1_timestamp_seconds": open_sale_1_timestamp_seconds.to_string(),
        "open_sale_2_timestamp_seconds": open_sale_2_timestamp_seconds.to_string(),
        "final_sale_2_timestamp_seconds": final_sale_2_timestamp_seconds.to_string(),
        "liquidity_pool_timestamp_seconds": liquidity_pool_timestamp_seconds.to_string(),
        "total_amount_sale_project_tokens": total_amount_sale_project_tokens.to_string(),
        "token_allocation_size": token_allocation_size.to_string(),
        "token_allocation_price": token_allocation_price.to_string(),
        "liquidity_pool_project_tokens": liquidity_pool_project_tokens.to_string(),
        "liquidity_pool_price_tokens": liquidity_pool_price_tokens.to_string(),
        "fraction_instant_release": fraction_instant_release.to_string(),
        "fraction_cliff_release": fraction_cliff_release.to_string(),
        "cliff_timestamp_seconds": cliff_timestamp_seconds.to_string(),
        "end_cliff_timestamp_seconds": end_cliff_timestamp_seconds.to_string(),
        "fee_price_tokens": fee_price_tokens.to_string(),
        "fee_liquidity_tokens": fee_liquidity_tokens.to_string(),
      }
    }))?
    .deposit(1)
    .transact()
    .await?
    .json()?;

  // 4. Fund listing

  ft_transfer_call(
    &worker,
    &project_owner,
    &ft_project,
    launchpad.as_account(),
    total_amount_sale_project_tokens + liquidity_pool_project_tokens,
    json!({
      "type": "FundListing",
      "listing_id": listing_id.to_string()
    })
    .to_string(),
  )
  .await?;

  // 5. Time travel to phase 1 sale
  time_travel(&worker, 60 * 30).await?;

  // 6. Launchpad members buy
  // 7. Non members try to buy and fail

  let seed_size = 1_000_000;
  // seed all investors with price tokens
  ft_transfer(&worker, &root, &ft_price, &investor_1, seed_size).await?;
  ft_transfer(&worker, &root, &ft_price, &investor_2, seed_size).await?;
  ft_transfer(&worker, &root, &ft_price, &investor_3, seed_size).await?;

  // seed all investors with xtokens
  ft_transfer(&worker, &root, &ft_xtoken, &investor_1, seed_size).await?;
  ft_transfer(&worker, &root, &ft_xtoken, &investor_2, seed_size).await?;
  ft_transfer(&worker, &root, &ft_xtoken, &investor_3, seed_size).await?;

  let tier_investor_1 = 2;
  let tier_investor_2 = 5;

  // stake membership tokens
  ft_transfer_call(
    &worker,
    &investor_1,
    &ft_xtoken,
    launchpad.as_account(),
    tiers_minimum_tokens[tier_investor_1 - 1],
    json!({
      "type": "VerifyAccount",
      "membership_tier": tier_investor_1.to_string()
    })
    .to_string(),
  )
  .await?;

  ft_transfer_call(
    &worker,
    &investor_2,
    &ft_xtoken,
    launchpad.as_account(),
    tiers_minimum_tokens[tier_investor_2 - 1],
    json!({
      "type": "VerifyAccount",
      "membership_tier": tier_investor_2.to_string()
    })
    .to_string(),
  )
  .await?;

  // buy allocations

  ft_transfer_call(
    &worker,
    &investor_1,
    &ft_price,
    launchpad.as_account(),
    tiers_entitled_allocations[tier_investor_1 - 1] as u128 * token_allocation_price,
    json!({
      "type": "BuyAllocation",
      "listing_id": listing_id.to_string()
    })
    .to_string(),
  )
  .await?;

  ft_transfer_call(
    &worker,
    &investor_2,
    &ft_price,
    launchpad.as_account(),
    tiers_entitled_allocations[tier_investor_2 - 1] as u128 * token_allocation_price,
    json!({
      "type": "BuyAllocation",
      "listing_id": listing_id.to_string()
    })
    .to_string(),
  )
  .await?;

  ft_transfer_call(
    &worker,
    &investor_3,
    &ft_price,
    launchpad.as_account(),
    tiers_entitled_allocations[tier_investor_2 - 1] as u128 * token_allocation_price,
    json!({
      "type": "BuyAllocation",
      "listing_id": listing_id.to_string()
    })
    .to_string(),
  )
  .await?;

  // assert allocations owned
  let investor_1_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_1, listing_id).await?;
  let investor_2_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_2, listing_id).await?;
  let investor_3_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_3, listing_id).await?;

  let investor_1_allocations = investor_1_allocations.unwrap_or((0.to_string(), 0.to_string()));
  let investor_2_allocations = investor_2_allocations.unwrap_or((0.to_string(), 0.to_string()));
  let investor_3_allocations = investor_3_allocations.unwrap_or((0.to_string(), 0.to_string()));

  assert_eq!(
    investor_1_allocations,
    (
      tiers_entitled_allocations[tier_investor_1 - 1].to_string(),
      0.to_string()
    )
  );
  assert_eq!(
    investor_2_allocations,
    (
      tiers_entitled_allocations[tier_investor_2 - 1].to_string(),
      0.to_string()
    )
  );
  assert_eq!(investor_3_allocations, (0.to_string(), 0.to_string()));

  // assert price token balances
  // launchpad balance must equal cost of all purchased allocations
  let launchpad_balance = ft_balance_of(&worker, &ft_price, launchpad.as_account())
    .await?
    .parse::<u128>()
    .unwrap();
  let investor_1_balance = ft_balance_of(&worker, &ft_price, &investor_1)
    .await?
    .parse::<u128>()
    .unwrap();
  let investor_2_balance = ft_balance_of(&worker, &ft_price, &investor_2)
    .await?
    .parse::<u128>()
    .unwrap();
  let investor_3_balance = ft_balance_of(&worker, &ft_price, &investor_3)
    .await?
    .parse::<u128>()
    .unwrap();

  assert_eq!(
    launchpad_balance,
    (investor_1_allocations.0.parse::<u128>().unwrap()
      + investor_2_allocations.0.parse::<u128>().unwrap()
      + investor_3_allocations.0.parse::<u128>().unwrap())
      * token_allocation_price
  );
  assert_eq!(
    investor_1_balance,
    seed_size - investor_1_allocations.0.parse::<u128>().unwrap() * token_allocation_price
  );
  assert_eq!(
    investor_2_balance,
    seed_size - investor_2_allocations.0.parse::<u128>().unwrap() * token_allocation_price
  );
  assert_eq!(investor_3_balance, seed_size);

  // 8. Time travel to phase 2 sale
  time_travel(&worker, 60 * 30).await?;

  // 9. everyone buys

  let expected_allocations_1: u64 =
    investor_1_allocations.0.parse::<u64>().unwrap() + allowance_phase_2;
  let expected_allocations_2: u64 =
    investor_2_allocations.0.parse::<u64>().unwrap() + allowance_phase_2;
  let expected_allocations_3: u64 =
    investor_3_allocations.0.parse::<u64>().unwrap() + allowance_phase_2;

  ft_transfer_call(
    &worker,
    &investor_1,
    &ft_price,
    launchpad.as_account(),
    allowance_phase_2 as u128 * token_allocation_price,
    json!({
      "type": "BuyAllocation",
      "listing_id": listing_id.to_string()
    })
    .to_string(),
  )
  .await?;

  ft_transfer_call(
    &worker,
    &investor_2,
    &ft_price,
    launchpad.as_account(),
    allowance_phase_2 as u128 * token_allocation_price,
    json!({
      "type": "BuyAllocation",
      "listing_id": listing_id.to_string()
    })
    .to_string(),
  )
  .await?;

  ft_transfer_call(
    &worker,
    &investor_3,
    &ft_price,
    launchpad.as_account(),
    allowance_phase_2 as u128 * token_allocation_price,
    json!({
      "type": "BuyAllocation",
      "listing_id": listing_id.to_string()
    })
    .to_string(),
  )
  .await?;

  // assert allocations owned
  let investor_1_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_1, listing_id).await?;
  let investor_2_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_2, listing_id).await?;
  let investor_3_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_3, listing_id).await?;

  let investor_1_allocations = investor_1_allocations.unwrap_or((0.to_string(), 0.to_string()));
  let investor_2_allocations = investor_2_allocations.unwrap_or((0.to_string(), 0.to_string()));
  let investor_3_allocations = investor_3_allocations.unwrap_or((0.to_string(), 0.to_string()));

  assert_eq!(investor_1_allocations.0, expected_allocations_1.to_string());
  assert_eq!(investor_2_allocations.0, expected_allocations_2.to_string());
  assert_eq!(investor_3_allocations.0, expected_allocations_3.to_string());

  // assert price token balances
  // launchpad balance must equal cost of all purchased allocations
  let launchpad_balance_2 = ft_balance_of(&worker, &ft_price, launchpad.as_account())
    .await?
    .parse::<u128>()
    .unwrap();
  let investor_1_balance_2 = ft_balance_of(&worker, &ft_price, &investor_1)
    .await?
    .parse::<u128>()
    .unwrap();
  let investor_2_balance_2 = ft_balance_of(&worker, &ft_price, &investor_2)
    .await?
    .parse::<u128>()
    .unwrap();
  let investor_3_balance_2 = ft_balance_of(&worker, &ft_price, &investor_3)
    .await?
    .parse::<u128>()
    .unwrap();

  assert_eq!(
    launchpad_balance_2,
    (investor_1_allocations.0.parse::<u128>().unwrap()
      + investor_2_allocations.0.parse::<u128>().unwrap()
      + investor_3_allocations.0.parse::<u128>().unwrap())
      * token_allocation_price
  );
  assert_eq!(
    investor_1_balance_2,
    seed_size - investor_1_allocations.0.parse::<u128>().unwrap() * token_allocation_price
  );
  assert_eq!(
    investor_2_balance_2,
    seed_size - investor_2_allocations.0.parse::<u128>().unwrap() * token_allocation_price
  );
  assert_eq!(
    investor_3_balance_2,
    seed_size - investor_3_allocations.0.parse::<u128>().unwrap() * token_allocation_price
  );

  // 10. Time travel to phase 2 end
  time_travel(&worker, 60 * 30).await?;

  // 11. Project owner withdraws
  let op_listing_data: Option<serde_json::Value> = launchpad
    .view(
      &worker,
      "view_listing",
      json!({"listing_id": listing_id.to_string()})
        .to_string()
        .into_bytes(),
    )
    .await?
    .json()?;
  let listing_data = op_listing_data.unwrap();

  let allocations_sold = listing_data["allocations_sold"]
    .as_str()
    .unwrap()
    .parse::<u128>()
    .unwrap();

  let expected_project_tokens_withdraw =
    total_amount_sale_project_tokens - allocations_sold * token_allocation_size;

  let effective_price_tokens_liquidity = (allocations_sold * liquidity_pool_price_tokens)
    / (total_amount_sale_project_tokens / token_allocation_size);
  println!("{}", effective_price_tokens_liquidity);

  let expected_fee_price_tokens_withdraw =
    ((allocations_sold * token_allocation_price - effective_price_tokens_liquidity) * fee_price_tokens) / FRACTION_BASE;
  let expected_price_tokens_withdraw =
    (allocations_sold * token_allocation_price - effective_price_tokens_liquidity) - expected_fee_price_tokens_withdraw;

  let pre_balance_price: u128 = ft_balance_of(&worker, &ft_price, &project_owner)
    .await?
    .parse()?;
  let pre_balance_project: u128 = ft_balance_of(&worker, &ft_project, &project_owner)
    .await?
    .parse()?;

  let result = project_owner
    .call(&worker, launchpad.id(), "withdraw_tokens_project")
    .args_json(json!({
      "listing_id": listing_id.to_string()
    }))?
    .deposit(1)
    .gas(GAS_LIMIT)
    .transact()
    .await?;

  println!("{:#?}", result.outcomes());

  let after_balance_price: u128 = ft_balance_of(&worker, &ft_price, &project_owner)
    .await?
    .parse()?;
  let after_balance_project: u128 = ft_balance_of(&worker, &ft_project, &project_owner)
    .await?
    .parse()?;

  
  println!("{}", pre_balance_project);
  println!("{}", expected_project_tokens_withdraw);
  println!("{}", after_balance_project);

  // contract is giving back both pre sale and liquidity tokens - fix that
  //  1_499_980_500
  //    999_987_000
  //  1_000_000_000

  assert_eq!(
    pre_balance_price + expected_price_tokens_withdraw,
    after_balance_price
  );
  assert_eq!(
    pre_balance_project + expected_project_tokens_withdraw,
    after_balance_project
  );

  // 12. Investors withdraw initial release

  let expected_withdraw_1 = investor_1_allocations.0.parse::<u128>()? * token_allocation_size;
  let expected_withdraw_2 = investor_2_allocations.0.parse::<u128>()? * token_allocation_size;
  let expected_withdraw_3 = investor_3_allocations.0.parse::<u128>()? * token_allocation_size;

  let pre_balance_investor_1 = ft_balance_of(&worker, &ft_project, &investor_1)
    .await?
    .parse::<u128>()?;
  let pre_balance_investor_2 = ft_balance_of(&worker, &ft_project, &investor_2)
    .await?
    .parse::<u128>()?;
  let pre_balance_investor_3 = ft_balance_of(&worker, &ft_project, &investor_3)
    .await?
    .parse::<u128>()?;

  withdraw_allocations(&worker, &launchpad, &investor_1, listing_id).await?;
  withdraw_allocations(&worker, &launchpad, &investor_2, listing_id).await?;
  withdraw_allocations(&worker, &launchpad, &investor_3, listing_id).await?;

  let after_balance_investor_1 = ft_balance_of(&worker, &ft_project, &investor_1)
    .await?
    .parse::<u128>()?;
  let after_balance_investor_2 = ft_balance_of(&worker, &ft_project, &investor_2)
    .await?
    .parse::<u128>()?;
  let after_balance_investor_3 = ft_balance_of(&worker, &ft_project, &investor_3)
    .await?
    .parse::<u128>()?;

  // assert balances after withdraw
  assert_eq!(
    pre_balance_investor_1 + expected_withdraw_1,
    after_balance_investor_1
  );
  assert_eq!(
    pre_balance_investor_2 + expected_withdraw_2,
    after_balance_investor_2
  );
  assert_eq!(
    pre_balance_investor_3 + expected_withdraw_3,
    after_balance_investor_3
  );

  // assert contract keeping track of withdrawn tokens correctly
  let investor_1_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_1, listing_id).await?;
  let investor_2_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_2, listing_id).await?;
  let investor_3_allocations: Option<(String, String)> =
    view_investor_allocations(&worker, &launchpad, &investor_3, listing_id).await?;

  let investor_1_allocations = investor_1_allocations.unwrap_or((0.to_string(), 0.to_string()));
  let investor_2_allocations = investor_2_allocations.unwrap_or((0.to_string(), 0.to_string()));
  let investor_3_allocations = investor_3_allocations.unwrap_or((0.to_string(), 0.to_string()));

  assert_eq!(investor_1_allocations.1, expected_withdraw_1.to_string());
  assert_eq!(investor_2_allocations.1, expected_withdraw_2.to_string());
  assert_eq!(investor_3_allocations.1, expected_withdraw_3.to_string());

  anyhow::Ok(())
}
