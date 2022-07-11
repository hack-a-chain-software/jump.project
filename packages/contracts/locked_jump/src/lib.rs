use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, UnorderedSet, LookupMap, Vector};
use near_sdk::json_types::{U64, U128};
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::serde_json;
use near_sdk::{
	env, near_bindgen, utils::assert_one_yocto, AccountId, BorshStorageKey, Gas,
	PanicOnDefault, PromiseOrValue, Promise,
};

use near_contract_standards;
use near_contract_standards::fungible_token::events::{FtBurn, FtMint};
use near_contract_standards::fungible_token::metadata::{
	FungibleTokenMetadata, FungibleTokenMetadataProvider, FT_METADATA_SPEC,
};
use near_contract_standards::fungible_token::core::FungibleTokenCore;
use near_contract_standards::fungible_token::resolver::FungibleTokenResolver;
use near_contract_standards::fungible_token::FungibleToken;

mod account;
mod actions;
mod errors;
mod ext_interface;
mod vesting;

use vesting::{Vesting};
use account::{Account};
use errors::*;

const FRACTION_BASE: u128 = 10_000;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct Contract {
	// encapsulate all functionality from standard FT (use contract standards)
	pub ft_functionality: FungibleToken,
	pub locked_token_metadata: LazyOption<FungibleTokenMetadata>,
	// contract parameters
	pub contract_config: LazyOption<ContractConfig>,
	// keep track of how many Jump tokens wre deposited to the contract
	pub minters: UnorderedSet<AccountId>,
	// keep track of all pending vesting schedules
	pub vesting_schedules: LookupMap<AccountId, Vector<Vesting>>,
	// keep track of users storage deposits
	pub users: LookupMap<AccountId, Account>,
}

#[derive(BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
	FungibleToken,
	Metadata,
	ContractConfig,
	Minters,
	VestingSchedules,
	VestingVector { account_id: AccountId },
	Users,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ContractConfig {
	// contract owner
	pub owner_id: AccountId,
	// address of underlying NEP-141 token
	pub base_token: AccountId,
	// period of vesting duration, in nanoseconds
	pub vesting_duration: U64,
	// cost of fast pass, in % of total amount, base 10_000
	pub fast_pass_cost: U128,
	// how much does the fastpass accelerate the schedule - divides vesting_duration by it
	pub fast_pass_acceleration: U64,
}

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
	#[init]
	pub fn new(
		locked_token_name: String,
		locked_token_symbol: String,
		locked_token_icon: String,
		locked_token_decimals: u8,
		contract_config: ContractConfig,
	) -> Self {
		assert!(!env::state_exists(), "Already initialized");
		Self {
			ft_functionality: FungibleToken::new(StorageKey::FungibleToken),
			locked_token_metadata: LazyOption::new(
				StorageKey::Metadata,
				Some(&FungibleTokenMetadata {
					spec: FT_METADATA_SPEC.to_string(),
					name: locked_token_name,
					symbol: locked_token_symbol,
					icon: Some(locked_token_icon),
					reference: None,
					reference_hash: None,
					decimals: locked_token_decimals,
				}),
			),
			contract_config: LazyOption::new(StorageKey::ContractConfig, Some(&contract_config)),
			minters: UnorderedSet::new(StorageKey::Minters),
			vesting_schedules: LookupMap::new(StorageKey::VestingSchedules),
			users: LookupMap::new(StorageKey::Users),
		}
	}
}

// Implement relevant internal methods
impl Contract {
	pub fn internal_get_account(&self, account_id: &AccountId) -> Option<Account> {
		self.users.get(account_id)
	}

	pub fn internal_update_account(&mut self, account_id: &AccountId, state: &Account) {
		self.users.insert(account_id, state);
	}

	pub fn internal_deposit_storage(&mut self, account_id: &AccountId, deposit_amount: u128) {
		let state: Account;
		match self.internal_get_account(account_id) {
			Some(mut account) => {
				account.deposit_storage_funds(deposit_amount);
				self.vesting_schedules.insert(
					account_id,
					&Vector::new(StorageKey::VestingVector {
						account_id: account_id.clone(),
					}),
				);
				state = account
			}
			None => {
				let account = Account::new(account_id.clone(), deposit_amount);
				state = account;
			}
		}
		self.internal_update_account(account_id, &state);
	}

	pub fn internal_storage_withdraw(&mut self, account_id: &AccountId, amount: u128) -> u128 {
		let mut account = self.internal_get_account(&account_id).expect(ERR_001);
		let available = account.storage_funds_available();
		assert!(
			available > 0,
			"{}. No funds available for withdraw",
			ERR_201
		);
		let mut withdraw_amount = amount;
		if amount == 0 {
			withdraw_amount = available;
		}
		assert!(
			withdraw_amount <= available,
			"{}. Only {} available for withdraw",
			ERR_201,
			available
		);
		account.withdraw_storage_funds(withdraw_amount);
		self.internal_update_account(account_id, &account);
		withdraw_amount
	}

	pub fn internal_add_vesting(&mut self, account_id: &AccountId, locked_value: u128) {
		let mut vesting_vector = self.vesting_schedules.get(account_id).unwrap();
		let vesting = Vesting::new(
			account_id.clone(),
			locked_value,
			env::block_timestamp(),
			self.contract_config.get().unwrap().vesting_duration.0,
		);
		vesting_vector.push(&vesting);
		self.vesting_schedules.insert(&account_id, &vesting_vector);
	}

	pub fn get_fast_pass_cost(&self, vesting: &Vesting) -> u128 {
		let pass_fee = self.contract_config.get().unwrap().fast_pass_cost.0;
		(vesting.locked_value.0 * pass_fee) / FRACTION_BASE
	}
}

//implement necessary methods for standard implementation
impl Contract {
	fn on_tokens_burned(&mut self, account_id: AccountId, amount: u128) {
		FtBurn {
			owner_id: &account_id,
			amount: &U128(amount),
			memo: Some("Tokens burnt on ft_transfer_call error after account unregister"),
		}
		.emit();
	}
}

impl Contract {
	pub fn only_owner(&self, account_id: &AccountId) {
		assert_one_yocto();
		assert_eq!(
			&self.contract_config.get().unwrap().owner_id,
			account_id,
			"{}",
			ERR_003
		);
	}

	pub fn only_minter(&self, account_id: &AccountId) {
		assert_one_yocto();
		assert!(self.minters.contains(account_id), "{}", ERR_002);
	}
}
