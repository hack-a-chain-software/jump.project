use crate::*;

pub async fn withdraw_locked_tokens(
  worker: &Worker<Sandbox>,
  sender: &Account,
  contract: &Contract,
  vesting_id: String,
) -> anyhow::Result<()> {
  sender
    .call(&worker, contract.id(), "withdraw_locked_tokens")
    .args_json(json!({
      "vesting_id": vesting_id
    }))?
    .deposit(1)
    .gas(GAS_LIMIT)
    .transact()
    .await?;
  anyhow::Ok(())
}

pub async fn view_vesting_paginated(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  account: &Account,
) -> anyhow::Result<serde_json::Value> {
  anyhow::Ok(
    contract
      .view(
        worker,
        "view_vesting_paginated",
        json!({
          "account_id": account.id(),
          "initial_id": "0".to_string(),
          "size": "20".to_string()
        })
        .to_string()
        .into_bytes(),
      )
      .await?
      .json()?,
  )
}
