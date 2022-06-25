/// Implement receivers for NEP-141
/// Redirects to other methods according to
/// msg logic
use crate::*;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde", tag = "type")]
pub enum CallType {
  FundListing { listing_id: U64 },
  BuyAllocation { listing_id: U64 },
  VerifyAccount { membership_tier: U64 },
}

#[near_bindgen]
impl Contract {
  #[allow(unreachable_patterns)]
  pub fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, msg: String) -> U128 {
    match serde_json::from_str::<CallType>(&msg).expect(ERR_301) {
      CallType::FundListing { listing_id } => {
        self.fund_listing(
          listing_id.0,
          amount.0,
          TokenType::FT {
            account_id: env::predecessor_account_id(),
          },
        );
        U128(0)
      }
      CallType::BuyAllocation { listing_id } => {
        U128(self.buy_allocation(listing_id.0, amount.0, sender_id))
      }
      CallType::VerifyAccount { membership_tier } => U128(self.increase_membership_tier(
        sender_id,
        amount.0,
        membership_tier.0 as usize,
        env::predecessor_account_id(),
      )),
      _ => unimplemented!(),
    }
  }
}

#[cfg(test)]
mod tests {

  use crate::tests::*;

  /// fund_listing
  /// Method must:
  /// 1. assert transferred token is project token;
  /// 2. assert transferred quantity is correct;
  /// 3. assert listing has not yet been funded;
  /// 4. assert listing start time was not reached yet;
  /// 5. update listing treasury to reflect deposit;
  /// 6. update listing status to Funded;
  /// 7. emit funding event;
  #[test]
  fn test_fund_listing() {
    fn closure_generator(
      predecessor: AccountId,
      token_deposit: u128,
      status: ListingStatus,
      timestamp_passed: bool,
      seed: u128,
    ) -> impl FnOnce() {
      move || {
        let timestamp = if timestamp_passed {
          standard_listing_data().open_sale_1_timestamp_seconds.0 * TO_NANO + 10
        } else {
          standard_listing_data().open_sale_1_timestamp_seconds.0 * TO_NANO - 10
        };

        testing_env!(get_context(
          vec![],
          0,
          0,
          predecessor,
          timestamp,
          Gas(300u64 * 10u64.pow(12)),
        ));

        let mut contract = init_contract(seed);

        let mut listing = standard_listing(contract.listings.len()).into_current();

        listing.status = status;
        contract
          .listings
          .push(&VListing::V1(listing));

        contract.ft_on_transfer(
          USER_ACCOUNT.parse().unwrap(),
          U128(token_deposit),
          json!({
            "type": "FundListing",
            "listing_id": "0"
          }).to_string(),
        );

        let listing = contract.internal_get_listing(0);

        assert!(matches!(listing.status, ListingStatus::Funded));
        assert_eq!(
          listing.listing_treasury.presale_project_token_balance,
          listing.total_amount_sale_project_tokens
        );
        assert_eq!(
          listing
            .listing_treasury
            .liquidity_pool_project_token_balance,
          listing.liquidity_pool_project_tokens
        );

        let logs = get_logs();
        assert_eq!(logs.len(), 1);

        let event_log = logs.get(0).unwrap();
        let serde_blob: serde_json::Value =
          serde_json::from_str(event_log.chars().skip(11).collect::<String>().as_str()).unwrap();

        assert_eq!(serde_blob["standard"], "jump_launchpad");
        assert_eq!(serde_blob["version"], "1.0.0");
        assert_eq!(serde_blob["event"], "fund_listing");

        let data: serde_json::Value =
          serde_json::from_str(serde_blob["data"][0].as_str().unwrap()).unwrap();
        assert_eq!(data["listing_id"], "0");
        assert_eq!(
          data["tokens_sale"],
          listing.total_amount_sale_project_tokens.to_string()
        );
        assert_eq!(
          data["tokens_liquidity"],
          listing.liquidity_pool_project_tokens.to_string()
        );
      }
    }

    let correct_deposit = standard_listing_data().liquidity_pool_project_tokens.0
      + standard_listing_data().total_amount_sale_project_tokens.0;

    let test_cases = [
      // 1. assert transferred token is project token;
      (
        USER_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Unfunded,
        false,
        Some(ERR_104.to_string()),
      ),
      // 2. assert transferred quantity is correct;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit + 1,
        ListingStatus::Unfunded,
        false,
        Some(ERR_105.to_string()),
      ),
      // 3. assert listing has not yet been funded;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Funded,
        false,
        Some(ERR_113.to_string()),
      ),
      // 4. assert listing start time was not reached yet;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Unfunded,
        true,
        Some(ERR_114.to_string()),
      ),
      // 5. update listing treasury to reflect deposit;
      // 6. update listing status to Funded;
      // 7. emit funding event;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Unfunded,
        false,
        None,
      ),
    ];

    let mut counter = 0;
    IntoIterator::into_iter(test_cases).for_each(|v| {
      run_test_case(closure_generator(v.0, v.1, v.2, v.3, counter), v.4);
      println!("{}", counter);
      counter += 1;
    });
  }

  ///PENDING
  /// buy_allocation
  /// Method must:
  /// 1. assert investor exists;
  /// 2. assert sent token is price_token;
  /// 3. assert investor is entitle to required quantity of allocations;
  /// 4. assert listing is open for sale
  /// 5. assert enough allocations left in listing
  /// 6. increase investor’s allocation count;
  /// 7. check investor storage deposit;
  /// 8. emit buy allocations event;
  /// 9. return leftover tokens to user;
  /// - Must not allow investor to decrease allocation count through this call
  #[test]
  fn test_buy_allocation() {
    fn closure_generator(
      predecessor: AccountId,
      token_deposit: u128,
      status: ListingStatus,
      timestamp_passed: bool,
      seed: u128,
    ) -> impl FnOnce() {
      move || {
        let timestamp = if timestamp_passed {
          standard_listing_data().open_sale_1_timestamp_seconds.0 * TO_NANO + 10
        } else {
          standard_listing_data().open_sale_1_timestamp_seconds.0 * TO_NANO - 10
        };

        testing_env!(get_context(
          vec![],
          0,
          0,
          predecessor,
          timestamp,
          Gas(300u64 * 10u64.pow(12)),
        ));

        let mut contract = init_contract(seed);

        let mut listing = standard_listing(contract.listings.len()).into_current();

        listing.status = status;
        contract
          .listings
          .push(&VListing::V1(listing));

        contract.ft_on_transfer(
          USER_ACCOUNT.parse().unwrap(),
          U128(token_deposit),
          json!({
            "type": "FundListing",
            "listing_id": "0"
          }).to_string(),
        );

        let listing = contract.internal_get_listing(0);

        assert!(matches!(listing.status, ListingStatus::Funded));
        assert_eq!(
          listing.listing_treasury.presale_project_token_balance,
          listing.total_amount_sale_project_tokens
        );
        assert_eq!(
          listing
            .listing_treasury
            .liquidity_pool_project_token_balance,
          listing.liquidity_pool_project_tokens
        );

        let logs = get_logs();
        assert_eq!(logs.len(), 1);

        let event_log = logs.get(0).unwrap();
        let serde_blob: serde_json::Value =
          serde_json::from_str(event_log.chars().skip(11).collect::<String>().as_str()).unwrap();

        assert_eq!(serde_blob["standard"], "jump_launchpad");
        assert_eq!(serde_blob["version"], "1.0.0");
        assert_eq!(serde_blob["event"], "fund_listing");

        let data: serde_json::Value =
          serde_json::from_str(serde_blob["data"][0].as_str().unwrap()).unwrap();
        assert_eq!(data["listing_id"], "0");
        assert_eq!(
          data["tokens_sale"],
          listing.total_amount_sale_project_tokens.to_string()
        );
        assert_eq!(
          data["tokens_liquidity"],
          listing.liquidity_pool_project_tokens.to_string()
        );
      }
    }

    let correct_deposit = standard_listing_data().liquidity_pool_project_tokens.0
      + standard_listing_data().total_amount_sale_project_tokens.0;

    let test_cases = [
      // 1. assert transferred token is project token;
      (
        USER_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Unfunded,
        false,
        Some(ERR_104.to_string()),
      ),
      // 2. assert transferred quantity is correct;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit + 1,
        ListingStatus::Unfunded,
        false,
        Some(ERR_105.to_string()),
      ),
      // 3. assert listing has not yet been funded;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Funded,
        false,
        Some(ERR_113.to_string()),
      ),
      // 4. assert listing start time was not reached yet;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Unfunded,
        true,
        Some(ERR_114.to_string()),
      ),
      // 5. update listing treasury to reflect deposit;
      // 6. update listing status to Funded;
      // 7. emit funding event;
      (
        TOKEN_ACCOUNT.parse().unwrap(),
        correct_deposit,
        ListingStatus::Unfunded,
        false,
        None,
      ),
    ];

    let mut counter = 0;
    IntoIterator::into_iter(test_cases).for_each(|v| {
      run_test_case(closure_generator(v.0, v.1, v.2, v.3, counter), v.4);
      println!("{}", counter);
      counter += 1;
    });
  }
}
