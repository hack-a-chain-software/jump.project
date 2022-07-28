use self::launchpad::LaunchpadEvent;
use self::nft_staking::NftStakingEvent;
use self::x_token::XTokenEvent;
use crate::config::contracts::ContractsConfig;
use crate::pool::PgPooledConnection;
use crate::types::AccountId;
use async_trait::async_trait;

pub mod launchpad;
pub mod nft_staking;
pub mod x_token;

#[async_trait]
pub trait Event {
    async fn sql_query(&self, conn: &mut PgPooledConnection);
}
pub enum ContractAccount {
    Launchpad,
    NftStaking,
    XToken
}

impl ContractsConfig {
    pub fn match_account_id(&self, account_id: AccountId) -> Option<ContractAccount> {
        if account_id == self.launchpad_contract_account_id {
            Some(ContractAccount::Launchpad)
        } else if account_id == self.nft_staking_contract_account_id {
            Some(ContractAccount::NftStaking)
        } else if account_id == self.x_token_contract_account_id {
            Some(ContractAccount::XToken)
        } else {
            None
        }
    }
}

impl ContractAccount {
    pub fn parse_event(&self, event_json_string: &str) -> Box<dyn Event> {
        match self {
            ContractAccount::Launchpad => {
                Box::new(serde_json::from_str::<LaunchpadEvent>(event_json_string).unwrap())
            }

            ContractAccount::NftStaking => {
                Box::new(serde_json::from_str::<NftStakingEvent>(event_json_string).unwrap())
            }

            ContractAccount::XToken => {
                Box::new(serde_json::from_str::<XTokenEvent>(event_json_string).unwrap())
            }
        }
    }
}
