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

#[cfg(test)]
mod tests {

  use crate::tests::*;

  /// withdraw_tokens_project
  /// Method must:
  /// 1. Assert caller is project owner
  /// 2. Assert 1 yocto near was deposited
  /// 3. Assert listing is either Cancelled or SaleFinalized
  /// 4. if sale is finalized:
  ///    a. reduce price tokens in treasury to 0;
  ///    b. reduce leftover project tokens in treasury to 0;
  ///    c. send ft_transfer promise for price tokens
  ///       with failsafe callback
  ///    d. send ft_transfer promise for leftover project tokens
  ///       with failsafe callback
  ///    c. emit withdrawal event
  /// 5. is sale is cancelled:
  ///    a. reduce project tokens in treasury to 0;
  ///    b. send ft_transfer promise for leftover project tokens
  ///       with failsafe callback
  ///    c. emit withdrawal event
  #[test]
  fn test_withdraw_tokens_project() {
    fn closure_generator(
      caller: AccountId,
      deposit: u128,
      status: ListingStatus,
      sold_out: bool,
      timestamp_passed: bool,
      seed: u128,
    ) -> impl FnOnce() {
      move || {
        let timestamp = if timestamp_passed {
          standard_listing_data().final_sale_2_timestamp_seconds.0 + 10
        } else {
          standard_listing_data().final_sale_2_timestamp_seconds.0 - 10
        };

        testing_env!(get_context(
          vec![],
          deposit,
          0,
          caller,
          timestamp * TO_NANO,
          Gas(300u64 * 10u64.pow(12)),
        ));

        let mut contract = init_contract(seed);
        contract.listings.push(&standard_listing(contract.listings.len()));
        let mut listing = contract.listings.get(0).unwrap().into_current();
        let total_allocations =
          listing.total_amount_sale_project_tokens / listing.token_alocation_size;
        listing.status = status.clone();

        match listing.status {
          ListingStatus::Cancelled => {
            listing.fund_listing();
            listing.cancel_listing()
          }
          ListingStatus::SaleFinalized
          | ListingStatus::PoolProjectTokenSent
          | ListingStatus::PoolPriceTokenSent
          | ListingStatus::PoolCreated
          | ListingStatus::LiquidityPoolFinalized => {
            listing.fund_listing();
            listing.allocations_sold = if sold_out {
              total_allocations.try_into().unwrap()
            } else {
              (total_allocations / 2).try_into().unwrap()
            };
          }
          _ => (),
        }
        listing.status = status;
        contract.listings.replace(0, &VListing::V1(listing));

        contract.withdraw_tokens_project(U64(0));

        let listing = contract.internal_get_listing(0);
        assert_eq!(listing.listing_treasury.presale_project_token_balance, 0);
        assert_eq!(
          listing
            .listing_treasury
            .total_received_presale_price_token_balance,
          0
        );

        let project_tokens = (listing.allocations_sold as u128
          * listing.total_amount_sale_project_tokens)
          / total_allocations;
        let price_tokens = listing.allocations_sold as u128 * listing.token_allocation_price;
        let withdraw_fee = (listing.fee_price_tokens * price_tokens) / FRACTION_BASE;

        let receipts = get_created_receipts();
        assert_eq!(receipts.len(), 4);
        assert_eq!(receipts[0].receiver_id, listing.project_token.ft_get_account_id());
        assert_eq!(receipts[0].actions.len(), 1);
        match receipts[0].actions[0].clone() {
          VmAction::FunctionCall {
            function_name,
            args,
            gas: _,
            deposit,
          } => {
            assert_eq!(function_name, "ft_transfer");
            println!("{}", json!(args)["amount"]);
            panic!();
            // assert_eq!(json!(args)["amount"], U128(project_tokens));
            assert_eq!(deposit, 1);
          },
          _ => panic!()
        }

        assert_eq!(receipts[1].receiver_id, CONTRACT_ACCOUNT.parse().unwrap());
        assert_eq!(receipts[1].actions.len(), 1);
        match receipts[1].actions[0].clone() {
          VmAction::FunctionCall {
            function_name,
            args: _,
            gas: _,
            deposit,
          } => {
            assert_eq!(function_name, "callback_token_transfer_to_project_owner");
            assert_eq!(deposit, 0);
          }
          _ => panic!(),
        }

        assert_eq!(receipts[2].receiver_id, listing.price_token.ft_get_account_id());
        assert_eq!(receipts[2].actions.len(), 1);
        match receipts[2].actions[0].clone() {
          VmAction::FunctionCall {
            function_name,
            args,
            gas: _,
            deposit,
          } => {
            assert_eq!(function_name, "ft_transfer");
            println!("{}", json!(args)["amount"]);
            // assert_eq!(json!(args)["amount"], U128(price_tokens - withdraw_fee));
            assert_eq!(deposit, 1);
          }
          _ => panic!(),
        }

        assert_eq!(receipts[3].receiver_id, CONTRACT_ACCOUNT.parse().unwrap());
        assert_eq!(receipts[3].actions.len(), 1);
        match receipts[3].actions[0].clone() {
          VmAction::FunctionCall {
            function_name,
            args: _,
            gas: _,
            deposit,
          } => {
            assert_eq!(function_name, "callback_token_transfer_to_project_owner");
            assert_eq!(deposit, 0);
          }
          _ => panic!(),
        }
        let logs = get_logs();
        assert_eq!(logs.len(), 1);

        let event_log = logs.get(0).unwrap();
        let serde_blob: serde_json::Value =
          serde_json::from_str(event_log.chars().skip(11).collect::<String>().as_str()).unwrap();

        // assert_eq!(serde_blob["standard"], "jump_launchpad");
        // assert_eq!(serde_blob["version"], "1.0.0");
        // assert_eq!(serde_blob["event"], "create_guardian");
        // assert_eq!(
        //   serde_blob["data"][0]["new_guardian"],
        //   guardian_account.to_string()
        // );
      }
    }

    let test_cases = [
      // 1. Assert caller is owner or guardian
      (
        USER_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::SaleFinalized,
        true,
        true,
        Some(ERR_102.to_string()),
      ),
      // 2. Assert 1 yocto near was deposited
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        0,
        ListingStatus::SaleFinalized,
        true,
        true,
        Some("Requires attached deposit of exactly 1 yoctoNEAR".to_string()),
      ),
      // 3. Assert listing is either Cancelled or SaleFinalized
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::Unfunded,
        true,
        true,
        Some(ERR_103.to_string()),
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::Funded,
        true,
        false,
        Some(ERR_103.to_string()),
      ),
      // 4. if sale is finalized:
      //    a. reduce price tokens in treasury to 0;
      //    b. reduce leftover project tokens in treasury to 0;
      //    c. send ft_transfer promise for price tokens
      //       with failsafe callback
      //    d. send ft_transfer promise for leftover project tokens
      //       with failsafe callback
      //    c. emit withdrawal event
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::Funded,
        true,
        true,
        None,
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::LiquidityPoolFinalized,
        true,
        true,
        None,
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::PoolCreated,
        true,
        false,
        None,
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::PoolPriceTokenSent,
        true,
        false,
        None,
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::SaleFinalized,
        true,
        true,
        None,
      ),
      // 5. is sale is cancelled:
      //    a. reduce project tokens in treasury to 0;
      //    b. send ft_transfer promise for leftover project tokens
      //       with failsafe callback
      //    c. emit withdrawal event
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::Cancelled,
        true,
        false,
        None,
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::Cancelled,
        true,
        true,
        None,
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::Cancelled,
        false,
        false,
        None,
      ),
      (
        PROJECT_ACCOUNT.parse().unwrap(),
        1,
        ListingStatus::Cancelled,
        false,
        true,
        None,
      ),

    ];

    let mut counter = 0;
    IntoIterator::into_iter(test_cases).for_each(|v| {
      run_test_case(closure_generator(v.0, v.1, v.2, v.3, v.4, counter), v.5);
      println!("{}", counter);
      counter += 1;
    });
  }
}
