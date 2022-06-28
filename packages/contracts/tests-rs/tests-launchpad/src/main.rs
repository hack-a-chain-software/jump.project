use std::path::Path;
use workspaces::prelude::DevAccountDeployer;
use workspaces::{Contract, Account, AccountId, DevNetwork, Worker};
use workspaces::network::Sandbox;
use std::vec::Vec;
use std::io::Error;
use serde_json::json;
use std::collections::HashMap;
use std::str::{from_utf8};
use futures::future::{join_all};
use near_units::parse_near;

const OUT_DIR: &str = "../../out";

const SPOON_BLOCK_HEIGHT: u64 = 65_000_000;
const REF_FINANCE_ID: &str = "v2.ref-finance.near";

const TO_NANO: u64 = 1_000_000_000;

const GAS_LIMIT: u64 = 300_000_000_000_000;
const DEFAULT_GAS: u64 = 3_000_000_000_000;

const NEAR_BASE: u128 = 1_000_000_000_000_000_000_000_000;
const FT_DECIMALS: u8 = 24;

const USER_ACCOUNT_BALANCE: u128 = 5_000_000_000_000_000_000_000_000;
const CONTRACT_ACCOUNT_BALANCE: u128 = 200_000_000_000_000_000_000_000_000;

const DENOM: u128 = 1_000_000_000_000;

fn get_wasm(file_name: &str) -> Result<Vec<u8>, Error> {
  std::fs::read(Path::new(OUT_DIR).join(file_name))
}

async fn create_user_account(
  tla: &Account,
  worker: &Worker<impl DevNetwork>,
  account_id: &str,
) -> Account {
  tla
    .create_subaccount(worker, account_id)
    .initial_balance(USER_ACCOUNT_BALANCE)
    .transact()
    .await
    .unwrap()
    .unwrap()
}

async fn deploy_contract(
  tla: &Account,
  worker: &Worker<impl DevNetwork>,
  account_id: &str,
  wasm: &Vec<u8>,
) -> Contract {
  let contract_account = tla
    .create_subaccount(worker, account_id)
    .initial_balance(CONTRACT_ACCOUNT_BALANCE)
    .transact()
    .await
    .unwrap()
    .unwrap();

  contract_account
    .deploy(worker, wasm)
    .await
    .unwrap()
    .unwrap()
}

async fn initialize_ft_contract(
  worker: &Worker<impl DevNetwork>,
  contract: &Contract,
  owner: &Account,
) -> workspaces::result::CallExecutionDetails {
  contract
    .call(&worker, "initialize")
    .args_json(json!({
      "owner_id": owner.id(),
      "total_supply": "10000000",
      "metadata": {
          "spec": "ft-1.0.0",
          "name": "name",
          "symbol": "NME",
          "icon": null,
          "reference": null,
          "reference_hash": null,
          "decimals": FT_DECIMALS,
      }
    }))
    .unwrap()
    .transact()
    .await
    .unwrap()
}

async fn spoon_contract(contract_id: &str, worker: &Worker<Sandbox>) -> anyhow::Result<Contract> {
  let mainnet = workspaces::mainnet_archival().await?;
  let contract_id: AccountId = contract_id.parse().unwrap();

  Ok(
    worker
      .import_contract(&contract_id, &mainnet)
      .initial_balance(parse_near!("1000000 N"))
      .block_height(SPOON_BLOCK_HEIGHT)
      .transact()
      .await?,
  )
}

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

  // DEPLOY & INITIALIZE FT CONTRACTS

  let ft_wasm = get_wasm("token_contract.wasm")?;
  let fts = [
    ("ft_contract_price", &root),
    ("ft_contract_project", &project_owner),
    ("ft_contract_xtoken", &root),
  ];
  let mut ft_contracts: Vec<Contract> = Vec::with_capacity(3);
  for (i, (id, owner)) in fts.iter().enumerate() {
    ft_contracts.push(deploy_contract(&root, &worker, id, &ft_wasm).await);
    initialize_ft_contract(&worker, &ft_contracts[i], owner).await;
  }

  // SPOON REF.FINANCE FROM MAINNET

  let ref_finance = spoon_contract(REF_FINANCE_ID, &worker).await?;
  owner
    .call(&worker, ref_finance.id(), "new")
    .args_json(json!({
      "owner_id": owner.id(),
      "exchange_fee": 10,
      "referral_fee": 10
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
        "membership_token": ft_contracts[2].id(),
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

  // "guardians should be able to create a staking program"

  //   let collections_rps: HashMap<AccountId, u128> = ft_contracts
  //     .iter()
  //     .map(|contract| (contract.id().clone(), 10))
  //     .collect();

  //   guardian_account
  //     .call(&worker, staking_contract.id(), "create_staking_program")
  //     .args_json(json!({
  //       "payload": {
  //         "collection_address": nft_contract.id(),
  //         "collection_owner": collection_owner_account.id(),
  //         "token_address": ft_contracts[2].id(),
  //         "collection_rps": collections_rps,
  //         "min_staking_period": 86400, // day in seconds
  //         "early_withdraw_penalty": (DENOM / 20).to_string() // 5%
  //       }
  //     }))?
  //     .deposit(1)
  //     .transact()
  //     .await?;

  //   // "collection owners should be able to deposit project token to program's collection treasury"

  //   for account_id in [collection_owner_account.id(), staking_contract.id()] {
  //     collection_owner_account
  //       .call(&worker, &ft_contracts[2].id(), "storage_deposit")
  //       .args_json(json!({ "account_id": account_id }))?
  //       .deposit(12_500_000_000_0000_000_000_000_000_000)
  //       .transact()
  //       .await?;
  //   }

  //   collection_owner_account
  //     .call(&worker, &ft_contracts[2].id(), "ft_transfer")
  //     .args_json(json!({
  //       "receiver_id": staker_account.id(),
  //       "amount": "80",
  //       "memo": {
  //           "type": "CollectionOwnerDeposit",
  //           "collection": {
  //               "type": "NFTContract",
  //               "account_id": staker_account.id()
  //           }
  //       }
  //     }))?
  //     .deposit(1)
  //     .transact()
  //     .await?;

  anyhow::Ok(())
}

