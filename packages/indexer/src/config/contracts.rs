use once_cell::sync::Lazy;

use super::get_required_var;

pub struct ContractsConfig {
    pub launchpad_contract_account_id: String,
}

impl ContractsConfig {
    fn init() -> Self {
        Self {
            launchpad_contract_account_id: get_required_var("LAUNCHPAD_CONTRACT_ACCOUNT_ID"),
        }
    }
}

static CONTRACTS_CONFIG: Lazy<ContractsConfig> = Lazy::new(|| ContractsConfig::init());

pub fn get_contracts_config() -> &'static ContractsConfig {
    Lazy::force(&CONTRACTS_CONFIG)
}
