use near_sdk::json_types::{Base58CryptoHash, U128};
use near_sdk::serde_json::json;
use near_sdk::{log, AccountId};

const STANDARD_NAME: &str = "token_launcher";
const STANDARD_VERSION: &str = "1.0.0";

fn log_basic_event_format(standard: &str, version: &str, event_type: &str, data_vec: Vec<&str>) {
  log!(
    "EVENT_JSON:{}",
    &json!({
        "standard": standard,
        "version": version,
        "event": event_type,
        "data": data_vec
    })
    .to_string()
  )
}
/// New wasm was added to factory contract storage
pub fn event_new_contract_registered(type_of_contract: &str, contract_hash: Base58CryptoHash) {
  let event_type = "new_contract_registered";
  let event_data = &json!({
      "type_of_contract": type_of_contract,
      "contract_hash": contract_hash,
  })
  .to_string();
  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

/// New wasm was added to factory contract storage
pub fn event_new_contract_saved(storage_cost: U128, contract_hash: Base58CryptoHash) {
  let event_type = "new_contract_saved_on_storage";
  let event_data = &json!({
      "contract_hash": contract_hash,
      "storage_cost": storage_cost
  })
  .to_string();
  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}

/// New wasm was added to factory contract storage
pub fn event_contract_deploy(
  deploy_address: AccountId,
  type_of_contract: String,
  deploy_status: String,
) {
  let event_type = "new_contract_saved_on_storage";
  let event_data = &json!({
      "deploy_address: ": deploy_address,
      "type_of_contract: ": type_of_contract,
      "deploy_status: ": deploy_status
  })
  .to_string();
  log_basic_event_format(
    STANDARD_NAME,
    STANDARD_VERSION,
    event_type,
    vec![event_data],
  );
}
