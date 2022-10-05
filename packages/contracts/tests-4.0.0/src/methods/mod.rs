use serde_json::json;
use workspaces::{operations::CallTransaction, result::ExecutionResult};

use crate::*;

pub mod nft;
pub mod nft_staking;
pub mod token;

pub fn get_wasm(file_name: &str) -> Result<Vec<u8>, Error> {
  std::fs::read(Path::new(OUT_DIR).join(file_name))
}

pub async fn transact_call<'a, 'b>(
  call_transaction: CallTransaction<'a, 'b>,
) -> ExecutionResult<String> {
  call_transaction
    .transact()
    .await
    .unwrap()
    .into_result()
    .unwrap()
}

pub async fn create_user_account(tla: &Account, account_id: &str) -> Account {
  tla
    .create_subaccount(account_id)
    .initial_balance(USER_ACCOUNT_BALANCE)
    .transact()
    .await
    .unwrap()
    .unwrap()
}

pub async fn deploy_contract(tla: &Account, account_id: &str, wasm: &Vec<u8>) -> Contract {
  let contract_account = tla
    .create_subaccount(account_id)
    .initial_balance(CONTRACT_ACCOUNT_BALANCE)
    .transact()
    .await
    .unwrap()
    .unwrap();

  contract_account.deploy(wasm).await.unwrap().unwrap()
}

pub async fn deploy_contract_from_wasm_path(
  tla: &Account,
  account_id: &str,
  wasm_path: &str,
) -> Contract {
  let wasm = get_wasm(wasm_path).unwrap();
  deploy_contract(&tla, account_id, &wasm).await
}

pub async fn spoon_contract(
  contract_id: &str,
  worker: &Worker<Sandbox>,
) -> anyhow::Result<Contract> {
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

pub async fn time_travel(worker: &Worker<Sandbox>, seconds_to_advance: u64) -> anyhow::Result<()> {
  let blocks_to_advance = (seconds_to_advance * TO_NANO) / AVERAGE_BLOCK_TIME;
  worker.fast_forward(blocks_to_advance).await?;
  anyhow::Ok(())
}

// more than required
const STORAGE_DEPOSIT_AMOUNT: u128 = 1250000000000000000000000;
pub async fn register_user(
  contract: &Contract,
  caller: &Account,
  user: &Account,
) -> ExecutionResult<String> {
  transact_call(
    caller
      .call(contract.as_account().id(), "storage_deposit")
      .args_json(json!({ "account_id": user.id() }))
      .deposit(STORAGE_DEPOSIT_AMOUNT),
  )
  .await
}
