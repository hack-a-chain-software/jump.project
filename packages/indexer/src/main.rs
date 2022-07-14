use crate::pool::{build_pool, get_connection, PgPooledConnection};
use config::contracts::get_contracts_config;
use events::launchpad::LaunchpadEvent;
use near_indexer::StreamerMessage;
use tokio::sync::mpsc::Receiver;

mod config;
mod events;
mod pool;
mod types;

const JSON_EVENT_PREFIX: &str = "EVENT_JSON:";

const ERR_INVALID_COMMAND: &str = "Invalid command: provide `init` or `run` as arg";
enum Command {
    Init,
    Run,
}

impl Command {
    fn from_str(string: &str) -> Result<Self, &'static str> {
        match string {
            "init" => Ok(Command::Init),
            "run" => Ok(Command::Run),
            _ => Err(ERR_INVALID_COMMAND),
        }
    }
}

async fn process_block_stream(mut stream: Receiver<StreamerMessage>, mut conn: PgPooledConnection) {
    let contracts_config = get_contracts_config();

    while let Some(streamer_message) = stream.recv().await {
        for shard in streamer_message.shards {
            for tx_res in shard.receipt_execution_outcomes {
                let executor_id = &tx_res.execution_outcome.outcome.executor_id;

                if executor_id.as_str() == contracts_config.launchpad_contract_account_id {
                    for log in tx_res.execution_outcome.outcome.logs {
                        if log.starts_with(JSON_EVENT_PREFIX) {
                            let event_json_string = &log[JSON_EVENT_PREFIX.len()..];

                            let event: LaunchpadEvent =
                                serde_json::from_str(event_json_string).unwrap();

                            event.sql_query(&mut conn).await;
                        }
                    }
                }
            }
        }
    }
}

fn parse_command() -> Result<Command, &'static str> {
    let args: Vec<String> = std::env::args().collect();

    let command = args
        .get(1)
        .map(|arg| arg.as_str())
        .map(|arg| Command::from_str(arg))
        .expect(ERR_INVALID_COMMAND);

    command
}

#[actix_web::main]
async fn main() -> Result<(), String> {
    let command = parse_command()?;
    let home_dir = std::path::PathBuf::from(near_indexer::get_default_home());

    match command {
        Command::Init => {
            let config_args = config::near_indexer::get_indexer_init_config();
            near_indexer::indexer_init_configs(&home_dir, config_args).unwrap();
        }

        Command::Run => {
            config::initialize_run_config();
            let pool = Box::leak(Box::new(build_pool().await));

            let indexer_config = config::near_indexer::get_indexer_run_config();

            let handle = actix::spawn(async move {
                let indexer = near_indexer::Indexer::new(indexer_config).unwrap();
                let stream = indexer.streamer();
                process_block_stream(stream, get_connection(pool).await).await;
            });

            handle.await.unwrap();
        }
    }

    Ok(())
}
