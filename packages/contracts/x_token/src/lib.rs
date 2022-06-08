use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::json_types::{U128};
use near_sdk::{env, log, Gas, near_bindgen, 
			   AccountId, Balance, PanicOnDefault, 
			   PromiseOrValue, BorshStorageKey,
			   PromiseResult,
			   utils::{assert_one_yocto}
			   };
use near_sdk::serde_json::{json};

use near_contract_standards;
use near_contract_standards::fungible_token::metadata::{
    FungibleTokenMetadata, FungibleTokenMetadataProvider, FT_METADATA_SPEC,
};
use near_contract_standards::fungible_token::FungibleToken;
use near_contract_standards::fungible_token::events::{FtBurn, FtMint};

use std::convert::{TryInto};

pub mod ext_interface;
pub mod errors;
pub mod actions;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
struct Contract {
	// encapsulate all functionality from standard FT (use contract standards)
	pub ft_functionality: FungibleToken,
	pub x_token_metadata: LazyOption<FungibleTokenMetadata>,
	// reference contract of Jump token
	pub base_token: AccountId,
	// keep track of how many Jump tokens wre deposited to the contract
	pub base_token_treasury: u128
}

#[derive(BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
	FungibleToken,
	Metadata,
}

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
	#[init]
	pub fn new(
        x_token_name: String,
		x_token_symbol: String,
		x_token_icon: String,
		x_token_decimals: u8,
		base_token_address: String,

    ) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            ft_functionality: FungibleToken::new(StorageKey::FungibleToken),
            x_token_metadata: LazyOption::new(StorageKey::Metadata, Some(&FungibleTokenMetadata {
                spec: FT_METADATA_SPEC.to_string(),
                name: x_token_name,
                symbol: x_token_symbol,
                icon: Some(x_token_icon),
                reference: None,
                reference_hash: None,
                decimals: x_token_decimals,
            })),
			base_token: base_token_address.try_into().unwrap(),
			base_token_treasury: 0
        }
    }
}

// Implement relevant internal methods
impl Contract {
	
	// this function will be called through ft_on_trasnfer - validation of tokens happens on end function
	pub fn internal_mint_x_token(&mut self, quantity_deposited: u128, recipient: AccountId) {
		// calculate the correct proportion
		let x_token_emission = ( quantity_deposited * self.ft_functionality.total_supply ) / self.base_token_treasury;
		// add tokens to recipient
		self.ft_functionality.internal_deposit(&recipient, x_token_emission);
		// add base tokens to treasury
		self.base_token_treasury += quantity_deposited; 
		// log mint event
		let memo_string = &json!({
			"type": "mint_x_token",
			"normal_token_deposit": U128(quantity_deposited),
			"base_token_treasury_after_deposit": U128(self.base_token_treasury),
			"x_token_supply_after_deposit": U128(self.ft_functionality.total_supply)
		}).to_string();
		FtMint { owner_id: &recipient, amount: &U128(x_token_emission), memo: Some(memo_string) }.emit();
	}
	
	// this function will be called through public burn function - function will later call ft_transfer on normal token.
	// in case ft_transfer fails, will call revert burn_x_token
	pub fn internal_burn_x_token(&mut self, quantity_to_burn: u128, recipient: AccountId) -> u128 {
		// calculate correct proportion
		let normal_token_withdraw = ( quantity_to_burn * self.base_token_treasury ) / self.ft_functionality.total_supply;
		// burn xTokens
		self.ft_functionality.internal_withdraw(&recipient, quantity_to_burn);
		// reduce base_token_treasury
		self.base_token_treasury -= normal_token_withdraw;
		// log burn event
		let memo_string = &json!({
			"normal_token_withdraw": U128(normal_token_withdraw),
			"base_token_treasury_after_deposit": U128(self.base_token_treasury),
			"x_token_supply_after_deposit": U128(self.ft_functionality.total_supply)
		}).to_string();
		FtBurn { owner_id: &recipient, amount: &U128(quantity_to_burn), memo: Some(memo_string)}.emit();
		// return equivalent normal token value
		normal_token_withdraw
	}


	pub fn internal_revert_burn_x_token(&mut self, quantity_burnt: u128, recipient: AccountId, normal_tokens_released: u128) {
		// add burnt tokens back to user
		self.ft_functionality.internal_deposit(&recipient, quantity_burnt);
		// reinstate base_token_treasury
		self.base_token_treasury += normal_tokens_released;
		// log revert_burn event
		let memo_string = &json!({
			"type": "revert_burn_x_token",
			"normal_token_deposit": U128(normal_tokens_released),
			"base_token_treasury_after_deposit": U128(self.base_token_treasury),
			"x_token_supply_after_deposit": U128(self.ft_functionality.total_supply)
		}).to_string();
		FtMint { owner_id: &recipient, amount: &U128(quantity_burnt), memo: Some(memo_string) }.emit();
	}

	pub fn internal_deposit_jump_profits(&mut self, quantity_deposited: u128) {
		self.base_token_treasury += quantity_deposited; 
		// log profit earning event
		log!("EVENT_JSON:{}", &json!({
			"standard": "HacXtoken", 
			"version": "1.0.0", 
			"event": "profit_deposit",
			"data": {
				"quantity_deposited": quantity_deposited,
				"base_token_treasury_after_deposit": U128(self.base_token_treasury),
				"x_token_supply_after_deposit": U128(self.ft_functionality.total_supply)
			}
		}).to_string())
	}
}

//implement necessary methods for standard implementation
impl Contract {
	fn on_account_closed(&mut self, account_id: AccountId, balance: Balance) {
		log!("Closed @{} with {}", account_id, balance);
	}
	
	fn on_tokens_burned(&mut self, account_id: AccountId, amount: u128) {
		FtBurn { owner_id: &account_id, amount: &U128(amount), memo: None}.emit();
	}
}

