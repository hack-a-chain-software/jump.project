use crate::*;

pub async fn view_token_ratio(
  worker: &Worker<Sandbox>,
  contract: &Contract,
) -> anyhow::Result<HashMap<String, String>> {
  anyhow::Ok(
    contract
      .view(
        worker,
        "view_token_ratio",
        json!({}).to_string().into_bytes(),
      )
      .await?
      .json()?,
  )
}
