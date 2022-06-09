use near_sdk::{env};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Serialize};

use crate::errors::*;

// min deposit for storage is 0.25 NEAR
pub const MIN_STORAGE_BALANCE: u128 = 250_000_000_000_000_000_000_000;

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum VInvestor {
    V1(Investor),
}

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Investor {
    // storage checks
    pub storage_deposit: u128,
    pub storage_used: u64,

    // launchpad membership checks
    pub investor_level: u8,
    pub last_check: u64
}

impl VInvestor {
    pub fn new(initial_deposit: u128) -> Self {
        Self::V1(
            Investor {
                storage_deposit: initial_deposit,
                storage_used: 0,
                investor_level: 0,
                last_check: 0
            }
        )
    }

    pub fn into_current(self) -> Investor {
        match self {
            VInvestor::V1(investor) => investor,
            _ => unimplemented!()
        }
    }

}

// Implements storage related methods
impl Investor {
    /// Returns NEAR necessary to pay for account's storage
    fn storage_usage_cost(&self) -> u128 {
        self.storage_used as u128
            * env::storage_byte_cost()
    }

    /// Returns how much deposited NEAR is not being used for storage
    pub fn storage_funds_available(&self) -> u128 {
        let locked = self.storage_usage_cost();
        self.storage_deposit - locked
    }

    /// Asserts there is sufficient amount of $NEAR to cover storage usage.
    fn assert_storage_usage_cost(&self) {
        let storage_usage_cost = self.storage_usage_cost();
        assert!(
            storage_usage_cost <= self.storage_deposit,
            "{}. Needs to deposit {} more yoctoNear",
            ERR_201,
            storage_usage_cost - self.storage_deposit
        );
    }

    pub fn track_storage_usage(&mut self, initial_storage: u64) {
        let final_storage = env::storage_usage();
        if final_storage > initial_storage {
            self.storage_used += final_storage - initial_storage;
            self.assert_storage_usage_cost();
        } else {
            self.storage_used -= initial_storage - final_storage;
        }
    }

    pub fn deposit_storage_funds(&mut self, deposit: u128) {
        self.storage_deposit += deposit;
    }

    pub fn withdraw_storage_funds(&mut self, withdraw: u128) {
        self.storage_deposit -= withdraw;
        self.assert_storage_usage_cost();
    }

}

// Implement launchpad member level logic
impl Investor {
    pub fn update_level(&mut self, new_level: u8, timestamp: u64) {
        self.investor_level = new_level;
        self.last_check = timestamp;
    }
}