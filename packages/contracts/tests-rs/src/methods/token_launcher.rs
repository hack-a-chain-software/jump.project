use crate::*;
use serde_json::Value;

pub async fn initialize_factory_contract(
    worker: &Worker<impl DevNetwork>,
    contract: &Contract,
    owner: &Account,
  ) -> workspaces::result::CallExecutionDetails {
    contract
      .call(&worker, "new")
      .args_json(json!({
        "owner": owner.id()
      }))
      .unwrap()
      .transact()
      .await
      .unwrap()
  }

  pub async fn register_contract(
    worker: &Worker<impl DevNetwork>,
    owner: &Account, 
    contract: &Contract,
    contract_name: String,
    contract_hash: String,
    contract_cost: u128,
    init_fn_name: String,
    init_fn_params: String)
    -> workspaces::result::CallExecutionDetails{
  owner.call(&worker, &contract.id(), "register_contract").
  args_json(json!({
    "contract_name": contract_name,
    "contract_hash": contract_hash,
    "contract_cost": contract_cost.to_string(),
    "init_fn_name": init_fn_name,
    "init_fn_params": init_fn_params
  })).unwrap()
  .transact()
  .await
  .unwrap()
 }

pub async fn deploy_new_contract(
  worker: &Worker<impl DevNetwork>,
  owner: &Account, 
  contract: &Contract,
  contract_to_be_deployed: String,
  deploy_prefix: String,
  args: Value,)
  -> workspaces::result::CallExecutionDetails{
owner.call(&worker, &contract.id(), "deploy_new_contract").
args_json(json!({
  "contract_to_be_deployed": contract_to_be_deployed,
  "deploy_prefix": deploy_prefix,
  "args": args
})).unwrap()
.deposit(30_000_000_000_000_000_000_000_000)
.gas(300_000_000_000_000)
.transact()
.await
.unwrap()
}
 


  

 