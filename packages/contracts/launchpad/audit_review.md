# Launchpad audit review

This document comments on the audit report from BlockApex, discussing every issue, identifed bugs, proposed changes and fixes implemented in the code.

This document refers to audit on commit hash ddb92dda6eb779ac854471eeda817abeacfc054e

# Issues

## 1. Improper access controls leads to liquidity theft

## 8. Improper evaluation of `dex_lock_time`
### Not Acknowledged

The auditors claim that the `listing.dex_lock_time` is being set back to 0 on every callback from `launch_on_dex`, which would render the lock useless.

However, the audit report does not highlight how that creates any issues with the contract functionality. In fact, this is the intended behavior for the lock, as it is meant as a CONCURRENCY LOCK.

The idea behind it is that if the `launch_on_dex` method is called more than once in the same block, all calls but the first will revert. The lock will only be lifted after the execution of the callback to allow the users to proceed with the next phase of the launch.

The reason it is implemented as a timestamp instead of a boolean value is that in case some unintended bug affects the callback, funds do not get locked forever on the contract.

Therefore, no modifications were done to the contract on this issue's account.

## 11. Potential “million cheap data additions" attack
### Implemented

The auditors found that a malicious `guardian`, either by malicious intent or by hacking of their private keys, might spam the contract with multiple unasked for listings and asssign random investors as their owners, whcih would cause the investors to pay for the storage needed and would make them unable to recover their storage fees forever.


The suggested fix was to require a signature of the project_owner for a specific message (if address is a user wallet) or to do a callback to verify the intent (if address is a smart contract).

However, we found that such methods significantly deteriorate the ease of use of the contract, specially when setting up a new sale for a project.


As a solution, we implemented the boolean attribute `authorized_listing_creation` in the `investor` struct. It is default false and the user must call the new public method `toggle_authorize_listing_creation` to toggle its value to true.

Guardians can only call `create_new_listing` using the address of the `project_owner` if that address is registered as an investor with the `authorized_listing_creation` attribute set to true.

After creating a new listing, `authorized_listing_creation` is set back to false to prevent the creation of multiple undesired listings.

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