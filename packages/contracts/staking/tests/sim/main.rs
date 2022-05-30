pub use near_sdk::json_types::{Base64VecU8, ValidAccountId, WrappedDuration, U128, U64};
pub use near_sdk::serde_json::{json, value::Value};
pub use near_sdk_sim::init_simulator;
pub use near_sdk::AccountId;
use near_sdk_sim::to_yocto;

near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
  COIN_BYTES => "../out/staking.wasm",
  STAKING_BYTES => "../out/token_contract.wasm",
}

const GAS_ATTACHMENT: u64 = 300_000_000_000_000;

#[test]
fn simulate_staking_basic_flow() {
  // Blockchain Initialization
  let mut genesis = near_sdk_sim::runtime::GenesisConfig::default();
  genesis.gas_limit = u64::MAX;
  genesis.gas_price = 0;
  let root = init_simulator(Some(genesis));

  // This is our test account
  let test_account = root.create_user("staking-consumer".to_string(), to_yocto("100"));
  let owner_account = root.create_user("staking-owner".to_string(), to_yocto("100"));

  // Deploy all contracts to the dev environment that we just created
  let staking_contract_account = root.deploy(
    &STAKING_BYTES,
    "staking_contract".to_string(),
    to_yocto("100"),
  );
  let token_contract_account =
    root.deploy(&COIN_BYTES, "token_contract".to_string(), to_yocto("100"));

  // Initializes the token contract that we just created
  root.call(
    token_contract_account.account_id(),
    "new_default_meta",
    &json!({
      "owner_id": owner_account.account_id(),
      "total_supply": "100000000",
    })
    .to_string()
    .into_bytes(),
    GAS_ATTACHMENT,
    1,
  );

  root.call(
    staking_contract_account.account_id(),
    "initialize_staking",
    &json!({
      "owner": owner_account.account_id(),
      "period_duration": "604800000",
      "yield_per_period": "10",
      "token_address": token_contract_account.account_id(),
    })
    .to_string()
    .into_bytes(),
    GAS_ATTACHMENT,
    1,
  );

  root.call(
    token_contract_account.account_id(),
    "ft_transfer_call",
    &json!({
      "receiver_id": token_contract_account.account_id(),
      "amount": "20",
      "memo": Some("".to_string()),
      "msg": "Transfered 20 tokens to the Staking Contract!",
    })
    .to_string()
    .into_bytes(),
    GAS_ATTACHMENT,
    1,
  );
}
