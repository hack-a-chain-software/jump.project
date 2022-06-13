// ### Guardian

// 1. Create new listings;
// 2. Alter listings non critical information before sale starts;

use crate::*;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ListingData {
  pub project_owner: AccountId,
  pub project_token: AccountId,
  pub price_token: AccountId,
  pub open_sale_1_timestamp_seconds: U64,
  pub open_sale_2_timestamp_seconds: U64,
  pub final_sale_2_timestamp_seconds: U64,
  pub liquidity_pool_timestamp_seconds: U64,
  pub total_amount_sale_project_tokens: U128,
  pub token_alocation_size: U128,
  pub token_allocation_price: U128,
  pub liquidity_pool_project_tokens: U128,
  pub liquidity_pool_price_tokens: U128,
  pub fraction_instant_release: U128,
  pub cliff_period_seconds: U64,
}
#[allow(dead_code)]
#[near_bindgen]
impl Contract {
  #[payable]
  pub fn create_new_listing(&mut self, listing_data: ListingData) -> u64 {
    self.assert_owner_or_guardian();
    let initial_storage = env::storage_usage();
    let contract_account_id = env::current_account_id();
    let mut contract_account = self.internal_get_investor(&contract_account_id).unwrap();
    let listing_id = self.internal_create_new_listing(listing_data);
    contract_account.track_storage_usage(initial_storage);
    self.internal_update_investor(&contract_account_id, contract_account);
    listing_id
  }

  #[payable]
  pub fn cancel_listing(&mut self, listing_id: U64) {
    self.assert_owner_or_guardian();
    let initial_storage = env::storage_usage();
    let contract_account_id = env::current_account_id();
    let mut contract_account = self.internal_get_investor(&contract_account_id).unwrap();
    self.internal_cancel_listing(listing_id.0);
    contract_account.track_storage_usage(initial_storage);
    self.internal_update_investor(&contract_account_id, contract_account);
  }

}

#[cfg(test)]
mod tests {

  use crate::tests::*;
  pub use super::*;

  
}