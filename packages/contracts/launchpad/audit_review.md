# Launchpad audit review

This document comments on the audit report from BlockApex, discussing every issue, identifed bugs, proposed changes and fixes implemented in the code.

This document refers to audit on commit hash ddb92dda6eb779ac854471eeda817abeacfc054e

# Issues

## 1. Improper access controls leads to liquidity theft

## 8. Improper evaluation of `dex_lock_time`

## 11. Potential “million cheap data additions" attack

## 14. Potential avoidance of launchpad fee
### Implemented

The auditors claim that the `cancel_listing` method can be called before the start of phase 2 of the sale, which could lead to a potential avoidance of launchpad fees by cancelling the sale shortly before phase 2 starts.

However, a review of the code shows that the error is actually the assertion inside `cancel_listing` internal method. It should assert the current clocktime to be LESS THAN `open_sale_1_timestamp` and not greater than as is currently done.

Previous code:
```rust
#[payable]
pub fn cancel_listing(&mut self, listing_id: U64) {
  self.assert_owner_or_guardian();
  self.internal_cancel_listing(listing_id.0);
}

pub fn internal_cancel_listing(&mut self, listing_id: u64) {
    let mut listing = self.internal_get_listing(listing_id);
    listing.cancel_listing();
    self.internal_update_listing(listing_id, listing);
    events::cancel_listing(U64(listing_id));
}

pub fn cancel_listing(&mut self) {
    match &self.status {
      ListingStatus::Unfunded => (),
      _ => {
        assert!(
          env::block_timestamp() > self.open_sale_1_timestamp,
          "{}",
          ERR_101
        )
      }
    }

    self.status = ListingStatus::Cancelled;
    self.update_treasury_after_sale();
}
```

Updated code:
```rust
pub fn cancel_listing(&mut self) {
    match &self.status {
      ListingStatus::Unfunded => (),
      _ => {
        assert!(
          env::block_timestamp() < self.open_sale_1_timestamp,
          "{}",
          ERR_101
        )
      }
    }

    self.status = ListingStatus::Cancelled;
    self.update_treasury_after_sale();
}
```

## 17. Inadequate checks on unregister storage
### Implemented

The `storage_unregister` public method is not supposed to allow project owners to unregister their storage. This check is performed through the `is_listing_owner` boolean attribute of the `investor` struct.

However, currently, there is no moment in which `is_listing_owner` is set to true, meaning that the check cannot be properly enforced.

To fix the issue, we changed the `create_new_listing` public method to also update the `is_listing_owner` value of the user assigned as `project_owner`:

```rust
#[payable]
  pub fn create_new_listing(&mut self, listing_data: ListingData) -> u64 {
    self.assert_owner_or_guardian();
    let initial_storage = env::storage_usage();
    let project_owner_account_id = listing_data.project_owner.clone();
    let mut project_owner_account = self
      .internal_get_investor(&project_owner_account_id)
      .expect(ERR_010);
    let listing_id = self.internal_create_new_listing(listing_data);
    project_owner_account.track_storage_usage(initial_storage);
    // CHANGE HERE
    project_owner_account.is_listing_owner = true;
    //
    self.internal_update_investor(&project_owner_account_id, project_owner_account);
    listing_id
  }
```


## 21. Redundant code in calculate_vested_investor_withdraw function
### Implemented

The auditors found a duplicate assertion in the `calculate_vested_investor_withdraw` internal method.

```rust
pub fn calculate_vested_investor_withdraw(&self, allocations: u64,
timestamp: u64) -> u128 {
    let allocations = allocations as u128;
    let initial_release = ((self.token_allocation_size * self.fraction_instant_release) / FRACTION_BASE) * allocations;
    let cliff_release = ((self.token_allocation_size * self.fraction_cliff_release) / FRACTION_BASE) * allocations;
    let final_release = self.token_allocation_size * allocations - initial_release - cliff_release;
    let mut total_release = initial_release;
    if timestamp >= self.cliff_timestamp // redundant
    && timestamp < self.end_cliff_timestamp
    && timestamp >= self.cliff_timestamp //here redundant
    {
...
}
```