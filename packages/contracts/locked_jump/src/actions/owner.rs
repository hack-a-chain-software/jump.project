use crate::*;

#[near_bindgen]
impl Contract {
    pub fn add_minter(&mut self, new_minter: AccountId) {
        self.only_owner(&env::predecessor_account_id());
        self.minters.insert(&new_minter);
    }

    pub fn remove_minter(&mut self, remove_minter: AccountId) {
        self.only_owner(&env::predecessor_account_id());
        self.minters.remove(&remove_minter);
    }

    pub fn alter_config(&mut self, new_config: ContractConfig) {
        self.only_owner(&env::predecessor_account_id());
        self.contract_config.set(&new_config);
    }
}