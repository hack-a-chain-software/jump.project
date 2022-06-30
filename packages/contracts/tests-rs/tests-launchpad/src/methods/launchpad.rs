use crate::*;

pub async fn view_investor_allocations(
  worker: &Worker<Sandbox>,
  contract: &Contract,
  account: &Account,
  listing_id: u64,
) -> anyhow::Result<Option<(String, String)>> {
  anyhow::Ok(
    contract
      .view(
        worker,
        "view_investor_allocation",
        json!({
          "account_id": account.id(),
          "listing_id": listing_id.to_string()
        })
        .to_string()
        .into_bytes(),
      )
      .await?
      .json()?,
  )
}

pub async fn withdraw_allocations (worker: &Worker<Sandbox>,
contract: &Contract,
account: &Account,
listing_id: u64,
) -> anyhow::Result<()> {
  account.call(&worker, contract.id(), "withdraw_allocations")
  .args_json(json!({
    "listing_id": listing_id.to_string()
  }))?
  .deposit(1)
  .gas(GAS_LIMIT)
  .transact()
  .await?;
  anyhow::Ok(())
}