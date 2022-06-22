// ### Project owner

// 1. Send funds to their listing in order to fill out the treasury and allow the presale to start;
// 2. Withdraw the price token received after the end of presale (must discount the needed price_token for the dex liquidity pool);
// 3. Withdraw remaining project_tokens after the end of presale;
// 4. Withdraw all funds in case of cancelled listing;
use crate::*;

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn withdraw_tokens_project(&mut self, listing_id: U64) {
    let listing_id = listing_id.0;
    let listing = self.assert_project_owner(listing_id);
    self.internal_withdraw_project_funds(listing, listing_id);
  }

  #[payable]
  pub fn add_investor_private_sale_whitelist(
    &mut self,
    listing_id: U64,
    account_id: AccountId,
    allocations: U64,
  ) {
    let listing_id = listing_id.0;
    let listing = self.assert_project_owner(listing_id);
    let project_owner_id = env::current_account_id();
    let initial_storage = env::storage_usage();
    let mut project_owner_account = self.internal_get_investor(&project_owner_id).unwrap();

    assert!(
      matches!(listing.listing_type, ListingType::Private),
      "{}",
      ERR_107
    );
    let previous_allowance = listing.check_private_sale_investor_allowance(&account_id);
    listing.update_private_sale_investor_allowance(&account_id, previous_allowance + allocations.0);
    project_owner_account.track_storage_usage(initial_storage);
    self.internal_update_investor(&project_owner_id, project_owner_account);
  }

  #[payable]
  pub fn alter_investor_private_sale_whitelist(
    &mut self,
    listing_id: U64,
    account_id: AccountId,
    allocations: U64,
  ) {
    let listing_id = listing_id.0;
    let listing = self.assert_project_owner(listing_id);
    let project_owner_id = env::current_account_id();
    let initial_storage = env::storage_usage();
    let mut project_owner_account = self.internal_get_investor(&project_owner_id).unwrap();

    assert!(
      matches!(listing.listing_type, ListingType::Private),
      "{}",
      ERR_107
    );
    listing.update_private_sale_investor_allowance(&account_id, allocations.0);
    project_owner_account.track_storage_usage(initial_storage);
    self.internal_update_investor(&project_owner_id, project_owner_account);
  }
}

/// Actions to be called through token_receiver functions
impl Contract {
  pub fn fund_listing(&mut self, listing_id: u64, token_quantity: u128, token_type: TokenType) {
    let mut listing = self.internal_get_listing(listing_id);

    listing.assert_funding_token(token_type, token_quantity);

    listing.fund_listing();
    self.internal_update_listing(listing_id, listing);
  }
}
