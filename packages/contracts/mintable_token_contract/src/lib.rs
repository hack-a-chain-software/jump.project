//FtMint { owner_id: &owner ,amount:, memo: None}.emit();

use modified_contract_standards;
use modified_contract_standards::fungible_token::metadata::{
  FungibleTokenMetadata, FungibleTokenMetadataProvider, FT_METADATA_SPEC,
};

use modified_contract_standards::fungible_token::FungibleToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::json_types::{U128, ValidAccountId};
use near_sdk::{env, log, near_bindgen, AccountId, Balance, PanicOnDefault, PromiseOrValue};
use modified_contract_standards::fungible_token::events::{FtBurn, FtMint};

pub mod errors;

use crate::errors::ERR_001;
pub mod burn;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
  owner_id: AccountId,
  token: FungibleToken,
  metadata: LazyOption<FungibleTokenMetadata>,
}

#[near_bindgen]
impl Contract {
  #[init]
  pub fn new(owner_id: AccountId, metadata: FungibleTokenMetadata) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    metadata.assert_valid();
    let mut this = Self {
      owner_id: owner_id.clone(),
      token: FungibleToken::new(b"a".to_vec()),
      metadata: LazyOption::new(b"m".to_vec(), Some(&metadata)),
    };
    this.token.internal_register_account(&owner_id);
    this
  }

  pub fn mint(&mut self, quantity_to_mint: u128, recipient: AccountId) {
    self.only_owner();

    self.token.internal_deposit(&recipient, quantity_to_mint);
    FtMint {
      user_id: &recipient,
      amount: &quantity_to_mint.to_string(),
      memo: Some("Mint event called by owner"),
    }
    .emit();
  }

  fn on_account_closed(&mut self, account_id: AccountId, balance: Balance) {
    log!("Closed @{} with {}", account_id, balance);
  }

  fn on_tokens_burned(&mut self, account_id: AccountId, amount: Balance, memo: Option<String>) {
    FtBurn {
      owner_id: &account_id,
      amount: &amount.to_string(),
      memo: memo.as_ref(),
    }
    .emit();
  }
}

modified_contract_standards::impl_fungible_token_core!(Contract, token, on_tokens_burned);
modified_contract_standards::impl_fungible_token_storage!(Contract, token, on_account_closed);

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
  fn ft_metadata(&self) -> FungibleTokenMetadata {
    self.metadata.get().unwrap()
  }
}

impl Contract {
  pub fn only_owner(&self) {
    assert_eq!(env::predecessor_account_id(), self.owner_id, "{}", ERR_001);
  }
}

//----------------------------------- TEST -------------------------------------------------

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {

  // #[test]
  // fn test_new() {
  //     let mut context = get_context(accounts(1));
  //     testing_env!(context.build());
  //     let contract = Contract::new_default_meta(accounts(1).into(), TOTAL_SUPPLY.into());
  //     testing_env!(context.is_view(true).build());
  //     assert_eq!(contract.ft_total_supply().0, TOTAL_SUPPLY);
  //     assert_eq!(contract.ft_balance_of(accounts(1)).0, TOTAL_SUPPLY);
  // }

  // #[test]
  // #[should_panic(expected = "The contract is not initialized")]
  // fn test_default() {
  //     let context = get_context(accounts(1));
  //     testing_env!(context.build());
  //     let _contract = Contract::default();
  //}

  // #[test]
  // fn test_transfer() {
  //     let mut context = get_context(accounts(2));
  //     testing_env!(context.build());
  //     let mut contract = Contract::new_default_meta(accounts(2).into(), TOTAL_SUPPLY.into());
  //     testing_env!(context
  //         .storage_usage(env::storage_usage())
  //         .attached_deposit(contract.storage_balance_bounds().min.into())
  //         .predecessor_account_id(accounts(1))
  //         .build());
  //     // Paying for account registration, aka storage deposit
  //     contract.storage_deposit(None, None);

  //     testing_env!(context
  //         .storage_usage(env::storage_usage())
  //         .attached_deposit(1)
  //         .predecessor_account_id(accounts(2))
  //         .build());
  //     let transfer_amount = TOTAL_SUPPLY / 3;
  //     contract.ft_transfer(accounts(1), transfer_amount.into(), None);

  //     testing_env!(context
  //         .storage_usage(env::storage_usage())
  //         .account_balance(env::account_balance())
  //         .is_view(true)
  //         .attached_deposit(0)
  //         .build());
  //     assert_eq!(contract.ft_balance_of(accounts(2)).0, (TOTAL_SUPPLY - transfer_amount));
  //     assert_eq!(contract.ft_balance_of(accounts(1)).0, transfer_amount);
  // }
}
