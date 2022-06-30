use std::path::Path;
use workspaces::prelude::DevAccountDeployer;
use workspaces::{Contract, Account, AccountId, DevNetwork, Worker};
use workspaces::network::Sandbox;
use std::vec::Vec;
use std::io::Error;
use serde_json::json;
use std::collections::HashMap;
use futures::future::{join_all};

const OUT_DIR: &str = "../out";

// const GAS_LIMIT: u64 = 300000000000000;
const DEFAULT_GAS: u64 = 3000000000000;

const NEAR_BASE: u128 = 1_000_000_000_000_000_000_000_000;

const USER_ACCOUNT_BALANCE: u128 = 5_000_000_000_000_000_000_000_000;
const CONTRACT_ACCOUNT_BALANCE: u128 = 20_000_000_000_000_000_000_000_000;
// 20_463_268_563_207_853_000_000_000
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
    .call(&worker, "new")
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
          "decimals": 24,
      }
    }))
    .unwrap()
    .transact()
    .await
    .unwrap()
}

// messy messy hack because the API sucks
async fn get_tla_balance(tla: &Account, worker: &Worker<impl DevNetwork>) {
  let mut accounts_futures = vec![];
  for _ in 0..100 {
    accounts_futures.push(worker.dev_create_account());
  }

  let accounts_results = join_all(accounts_futures).await;

  let accounts = accounts_results.iter().map(|r| r.as_ref().unwrap());

  let mut transaction_futures = vec![];
  for account in accounts {
    transaction_futures.push(account.transfer_near(&worker, tla.id(), 100 * NEAR_BASE));
  }

  join_all(transaction_futures).await;
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  let worker: Worker<Sandbox> = workspaces::sandbox().await?;
  let tla = worker.dev_create_account().await?;

  get_tla_balance(&tla, &worker).await; // I didn't want to do this, but I had no choice

  println!("Worker initialized.");

  // CREATE USER ACCOUNTS
  let owner_account = create_user_account(&tla, &worker, "owner").await;
  let guardian_account = create_user_account(&tla, &worker, "guardian").await;
  let collection_owner_account = create_user_account(&tla, &worker, "collection").await;
  let staker_account = create_user_account(&tla, &worker, "staker").await;

  println!("User accounts created.");

  // DEPLOY & INITIALIZE FT CONTRACTS

  let ft_wasm = get_wasm("token_contract.wasm")?;
  let fts = [
    ("ft_contract_a", &owner_account),
    ("ft_contract_a", &owner_account),
    ("ft_contract_c", &collection_owner_account),
  ];
  let mut ft_contracts: Vec<Contract> = vec![];
  for (i, (id, owner)) in fts.iter().enumerate() {
    ft_contracts[i] = deploy_contract(&tla, &worker, id, &ft_wasm).await;
    initialize_ft_contract(&worker, &ft_contracts[i], owner).await;
  }

  // DEPLOY NFT CONTRACT

  let nft_wasm = get_wasm("nft_contract.wasm").unwrap();
  let nft_contract = deploy_contract(&tla, &worker, "nft", &nft_wasm).await;

  // DEPLOY & INITIALIZE STAKING CONTRACT

  let staking_wasm = get_wasm("nft_staking.wasm").unwrap();
  let staking_contract = deploy_contract(&tla, &worker, "staking", &staking_wasm).await;

  let contract_tokens: Vec<AccountId> = ft_contracts
    .iter()
    .map(|contract| contract.id().clone())
    .collect();

  staking_contract
    .call(&worker, "new")
    .args_json(json!({
      "owner_id": owner_account.id(),
      "contract_tokens": contract_tokens
    }))?
    .gas(DEFAULT_GAS)
    .transact()
    .await?;

  println!("Contracts deployed and initialized.");

  // "guardians should be able to create a staking program"

  let collections_rps: HashMap<AccountId, u128> = ft_contracts
    .iter()
    .map(|contract| (contract.id().clone(), 10))
    .collect();

  guardian_account
    .call(&worker, staking_contract.id(), "create_staking_program")
    .args_json(json!({
      "payload": {
        "collection_address": nft_contract.id(),
        "collection_owner": collection_owner_account.id(),
        "token_address": ft_contracts[2].id(),
        "collection_rps": collections_rps,
        "min_staking_period": 86400, // day in seconds
        "early_withdraw_penalty": (DENOM / 20).to_string() // 5%
      }
    }))?
    .deposit(1)
    .transact()
    .await?;

  // "collection owners should be able to deposit project token to program's collection treasury"

  for account_id in [collection_owner_account.id(), staking_contract.id()] {
    collection_owner_account
      .call(&worker, &ft_contracts[2].id(), "storage_deposit")
      .args_json(json!({ "account_id": account_id }))?
      .deposit(12_500_000_000_0000_000_000_000_000_000)
      .transact()
      .await?;
  }

  collection_owner_account
    .call(&worker, &ft_contracts[2].id(), "ft_transfer")
    .args_json(json!({
      "receiver_id": staker_account.id(),
      "amount": "80",
      "memo": {
          "type": "CollectionOwnerDeposit",
          "collection": {
              "type": "NFTContract",
              "account_id": staker_account.id()
          }
      }
    }))?
    .deposit(1)
    .transact()
    .await?;

  anyhow::Ok(())
}
