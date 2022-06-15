// ### Guardian

// 1. Create new listings;
// 2. Alter listings non critical information before sale starts;

use crate::*;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
#[cfg_attr(test, derive(Clone))]
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
  pub cliff_timestamp_seconds: U64,
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

  pub fn standard_listing_data() -> ListingData {
    ListingData {
      project_owner: PROJECT_ACCOUNT.parse().unwrap(),
      project_token: TOKEN_ACCOUNT.parse().unwrap(),
      price_token: PRICE_TOKEN_ACCOUNT.parse().unwrap(),
      open_sale_1_timestamp_seconds: U64(1_000_000_000),
      open_sale_2_timestamp_seconds: U64(2_000_000_000),
      final_sale_2_timestamp_seconds: U64(3_000_000_000),
      liquidity_pool_timestamp_seconds: U64(4_000_000_000),
      total_amount_sale_project_tokens: U128(1_000_000),
      token_alocation_size: U128(1_000),
      token_allocation_price: U128(500),
      liquidity_pool_project_tokens: U128(1_000),
      liquidity_pool_price_tokens: U128(800),
      fraction_instant_release: U128(2_000),
      cliff_timestamp_seconds: U64(8_000_000_000),
    }
  }

  /// let result = std::panic::catch_unwind(|| <expected_to_panic_operation_here>).is_err()

  /// create_new_listing
  /// Method must:
  /// 1. Assert caller is owner or guardian
  /// 2. Assert 1 yocto near was deposited
  /// 3. Assert that data for listing is valid:
  ///    (a) Timestamps are sequential;
  ///    (b) fraction_instant_release is within FRACTION_BASE range;
  ///    (c) allocation size preciselly divides total_amount_sale_project_tokens
  ///    (d) (liquidity_pool_project_tokens / liquidity_pool_price_tokens) <=
  ///        (token_allocation_price / token_alocation_size)
  ///        to ensure that price on presale isn't larger than on DEX
  /// 4. Insert listing into trie;
  /// 5. Charge storage fees from contract account;
  #[test]
  fn test_create_new_listing_1() {
    fn closure_generator(caller: AccountId, deposit: u128, seed: u128) -> impl FnOnce() {
      move || {
        testing_env!(get_context(
          vec![],
          deposit,
          0,
          caller,
          0,
          Gas(300u64 * 10u64.pow(12)),
        ));
        let mut contract_inst = init_contract(seed);
        let mut listing = standard_listing_data();
        let current_index = contract_inst.listings.len();
        let listing_id = contract_inst.create_new_listing(listing.clone());
        assert_eq!(current_index, contract_inst.listings.len());

        let inserted_listing = contract_inst
          .listings
          .get(listing_id)
          .unwrap()
          .into_current();
        assert_eq!(
          inserted_listing.open_sale_1_timestamp,
          listing.open_sale_1_timestamp_seconds.0 * TO_NANO
        );
        assert_eq!(
          inserted_listing.open_sale_2_timestamp,
          listing.open_sale_2_timestamp_seconds.0 * TO_NANO
        );
        assert_eq!(
          inserted_listing.final_sale_2_timestamp,
          listing.final_sale_2_timestamp_seconds.0 * TO_NANO
        );
        assert_eq!(
          inserted_listing.liquidity_pool_timestamp,
          listing.liquidity_pool_timestamp_seconds.0 * TO_NANO
        );
        assert_eq!(
          inserted_listing.total_amount_sale_project_tokens,
          listing.total_amount_sale_project_tokens.0
        );
        assert_eq!(
          inserted_listing.token_alocation_size,
          listing.token_alocation_size.0
        );
        assert_eq!(
          inserted_listing.token_allocation_price,
          listing.token_allocation_price.0
        );
        assert_eq!(
          inserted_listing.liquidity_pool_project_tokens,
          listing.liquidity_pool_project_tokens.0
        );
        assert_eq!(
          inserted_listing.liquidity_pool_price_tokens,
          listing.liquidity_pool_price_tokens.0
        );
        assert_eq!(
          inserted_listing.fraction_instant_release,
          listing.fraction_instant_release.0
        );
        // assert_eq!(inserted_listing.cliff_timestamp, listing.cliff_timestamp_seconds.0 * TO_NANO);
      }
    }

    let test_cases = [
      (USER_ACCOUNT.parse().unwrap(), 1, Some(ERR_002.to_string())), // 1. Assert caller is owner or guardian
      (
        OWNER_ACCOUNT.parse().unwrap(),
        0,
        Some("Requires attached deposit of exactly 1 yoctoNEAR".to_string()),
      ), // 2. Assert 1 yocto near was deposited
      (OWNER_ACCOUNT.parse().unwrap(), 1, None),
    ];

    let mut counter = 0;
    IntoIterator::into_iter(test_cases).for_each(|v| {
      run_test_case(closure_generator(v.0, v.1, counter), v.2);
      counter += 1;
    });
  }
}
