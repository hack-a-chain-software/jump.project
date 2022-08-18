use near_sdk::{near_bindgen, AccountId, env, PanicOnDefault};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U64;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
  owner_id: AccountId,
}

#[near_bindgen]
impl Contract {
  /// Initializes the contract with the given total supply owned by the given `owner_id` with
  /// default metadata (for example purposes only).

  /// Initializes the contract with the given total supply owned by the given `owner_id` with
  /// the given fungible token metadata.
  #[init]
  pub fn new(owner_id: AccountId) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    Self {
        owner_id
    }
  }


  pub fn view_time(&self) -> U64 {
    U64(env::block_timestamp())
  }
}