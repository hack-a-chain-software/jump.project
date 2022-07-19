use super::{get_optional_var, get_required_var};
use once_cell::sync::Lazy;
use std::str::FromStr;
use strum::EnumString;

#[derive(EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum Network {
    Testnet,
    Mainnet,
}

pub struct LakeFrameworkConfig {
    pub network: Network,
    pub block_height: u64,
}

impl LakeFrameworkConfig {
    fn init() -> Self {
        Self {
            network: Network::from_str(get_required_var("LAKE_FRAMEWORK_NETWORK").as_str())
                .unwrap_or(Network::Testnet),
            block_height: get_optional_var("LAKE_FRAMEWORK_BLOCK_HEIGHT")
                .and_then(|p| p.parse::<u64>().ok())
                .unwrap_or(0),
        }
    }
}

impl From<&LakeFrameworkConfig> for near_lake_framework::LakeConfig {
    fn from(config: &LakeFrameworkConfig) -> Self {
        let mut lake_config = near_lake_framework::LakeConfigBuilder::default()
            .start_block_height(config.block_height);

        match config.network {
            Network::Mainnet => {
                lake_config = lake_config.mainnet();
            }
            Network::Testnet => {
                lake_config = lake_config.testnet();
            }
        };

        lake_config.build().expect("Failed to build LakeConfig")
    }
}

static LAKE_FRAMEWORK_CONFIG: Lazy<LakeFrameworkConfig> = Lazy::new(|| LakeFrameworkConfig::init());

pub fn get_lake_framework_config() -> &'static LakeFrameworkConfig {
    Lazy::force(&LAKE_FRAMEWORK_CONFIG)
}
