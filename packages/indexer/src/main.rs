use crate::config::contracts::get_contracts_config;
use crate::config::lake_framework::get_lake_framework_config;
use crate::pool::{build_pool, get_connection, PgPooledConnection};
use near_indexer_primitives::views::{ExecutionOutcomeView, ExecutionStatusView};
use near_lake_framework::near_indexer_primitives;
use near_lake_framework::LakeConfig;
use tokio::sync::mpsc;

mod config;
mod events;
mod pool;
mod types;

const JSON_EVENT_PREFIX: &str = "EVENT_JSON:";

#[tokio::main]
async fn main() -> Result<(), tokio::io::Error> {
    config::initialize();

    let pool = Box::leak(Box::new(build_pool().await));

    let config: LakeConfig = get_lake_framework_config().into();

    let (_, stream) = near_lake_framework::streamer(config);

    listen_blocks(stream, get_connection(pool).await).await;

    Ok(())
}

async fn listen_blocks(
    mut stream: mpsc::Receiver<near_indexer_primitives::StreamerMessage>,
    mut conn: PgPooledConnection,
) {
    eprintln!("listen_blocks");

    let mut block_count: u128 = 0;
    while let Some(streamer_message) = stream.recv().await {
        block_count += 1;
        if block_count % 100 == 0 {
            eprintln!("Block height: {}", streamer_message.block.header.height);
        }
        for shard in streamer_message.shards {
            for execution_outcome in shard.receipt_execution_outcomes {
                match execution_outcome.execution_outcome.outcome.status {
                    ExecutionStatusView::Failure(_) => (),
                    _ => process_transaction(execution_outcome.execution_outcome.outcome, &mut conn).await,
                };
            }
        }
    }
}

async fn process_transaction(
    execution_outcome: ExecutionOutcomeView,
    conn: &mut PgPooledConnection,
) {
    let executor_id = execution_outcome.executor_id.to_string();

    if let Some(contract_account) = get_contracts_config().match_account_id(executor_id) {
        for log in execution_outcome.logs {
            if log.starts_with(JSON_EVENT_PREFIX) {
                println!("{}", log);
                let event_json_string = &log[JSON_EVENT_PREFIX.len()..];

                let event = contract_account.parse_event(event_json_string);

                event.sql_query(conn).await;
            }
        }
    }
}
