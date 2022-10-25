# Launchpad audit review

This document comments on the audit report from BlockApex, discussing every issue, identifed bugs, proposed changes and fixes implemented in the code.

This document refers to audit on commit hash ddb92dda6eb779ac854471eeda817abeacfc054e

# Issues

## 1. Improper access controls leads to liquidity theft

## 8. Improper evaluation of `dex_lock_time`

## 11. Potential “million cheap data additions" attack

## 14. Potential avoidance of launchpad fee

## 17. Inadequate checks on unregister storage

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