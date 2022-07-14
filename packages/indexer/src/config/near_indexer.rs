use super::get_optional_var;
use near_indexer::InitConfigArgs;

pub fn get_indexer_init_config() -> InitConfigArgs {
    InitConfigArgs {
        chain_id: get_optional_var("INDEXER_CHAIN_ID"),
        account_id: get_optional_var("INDEXER_ACCOUNT_ID"),
        test_seed: get_optional_var("INDEXER_TEST_SEED"),
        num_shards: get_optional_var("INDEXER_NUM_SHARDS")
            .and_then(|s| s.parse::<u64>().ok()) // TODO: handle this result's error
            .unwrap_or(1u64),

        fast: false,

        genesis: None,
        download_config: false,
        download_config_url: None,
        download_genesis: false,
        download_genesis_url: None,

        max_gas_burnt_view: None,
        boot_nodes: None,
    }
}

pub fn get_indexer_run_config() -> near_indexer::IndexerConfig {
    near_indexer::IndexerConfig {
        home_dir: std::path::PathBuf::from(near_indexer::get_default_home()),
        sync_mode: near_indexer::SyncModeEnum::FromInterruption,
        await_for_node_synced: near_indexer::AwaitForNodeSyncedEnum::WaitForFullSync,
    }
}
