#[cfg(test)]
mod tests {
  use std::collections::HashMap;

  use rstest::rstest;
  use serde_json::json;
  use workspaces::{Account, network::Sandbox, Worker, Contract};

  use crate::{
    token::initialize_ft_contract,
    nft_staking::{
      initialize_nft_staking, add_guardian, transfer, deposit, create_staking_program, stake,
      unstake, withdraw_reward, DENOM,
    },
    nft::{initialize_nft_contract, nft_mint, view_nft_token},
    create_user_account, get_wasm, deploy_contract, deploy_contract_from_wasm_path, time_travel,
    register_user,
    lib::events::{parse_event_logs, find_event_type},
  };

  #[derive(Debug, Clone)]
  struct NftStakingAccounts {
    root: Account,
    owner: Account,
    guardian: Account,
    collection_owner: Account,
    staker: Account,
  }

  #[derive(Debug, Clone)]
  struct NftStakingContracts {
    nft_staking: Contract,

    contract_token: Contract,
    program_token: Contract,

    nft_collection: Contract,
  }

  #[derive(Debug, Clone)]
  struct NftStakingFixtures {
    accounts: NftStakingAccounts,
    contracts: NftStakingContracts,
  }

  async fn worker() -> Worker<Sandbox> {
    workspaces::sandbox().await.unwrap()
  }

  fn root(worker: Worker<Sandbox>) -> Account {
    worker.root_account().unwrap()
  }

  async fn accounts(root: Account) -> NftStakingAccounts {
    NftStakingAccounts {
      owner: create_user_account(&root, "owner").await,
      guardian: create_user_account(&root, "guardian").await,
      collection_owner: create_user_account(&root, "collection_owner").await,
      staker: create_user_account(&root, "staker").await,

      root,
    }
  }

  async fn contracts(accounts: &NftStakingAccounts) -> NftStakingContracts {
    // FT is used more than once
    let ft_wasm_path = "token_contract.wasm";
    let ft_wasm = get_wasm(ft_wasm_path).unwrap();

    let contract_token = deploy_contract(&accounts.root, "contract_token", &ft_wasm).await;
    initialize_ft_contract(&contract_token, &accounts.owner).await;

    let program_token = deploy_contract(&accounts.root, "program_token", &ft_wasm).await;
    initialize_ft_contract(&program_token, &accounts.collection_owner).await;

    let nft_staking =
      deploy_contract_from_wasm_path(&accounts.root, "nft_staking", "nft_staking.wasm").await;
    initialize_nft_staking(&nft_staking, &accounts.owner, vec![contract_token.id()]).await;

    let nft_collection =
      deploy_contract_from_wasm_path(&accounts.root, "nft_collection", "nft_contract.wasm").await;
    initialize_nft_contract(&nft_collection, &accounts.collection_owner).await;

    NftStakingContracts {
      nft_staking,

      contract_token,
      program_token,

      nft_collection,
    }
  }

  async fn register_users(fixtures: &NftStakingFixtures) {
    let contracts = &fixtures.contracts;
    let accounts = &fixtures.accounts;

    register_user(
      &contracts.contract_token,
      &accounts.owner,
      &contracts.nft_staking.as_account(),
    )
    .await;
    register_user(&contracts.contract_token, &accounts.owner, &accounts.staker).await;

    register_user(
      &contracts.program_token,
      &accounts.collection_owner,
      &contracts.nft_staking.as_account(),
    )
    .await;
    register_user(
      &contracts.program_token,
      &accounts.collection_owner,
      &accounts.staker,
    )
    .await;

    register_user(&contracts.nft_staking, &accounts.owner, &accounts.staker).await;
  }

  async fn setup_test() -> NftStakingFixtures {
    let worker = worker().await;
    let root = root(worker);
    let accounts = accounts(root).await;
    let contracts = contracts(&accounts).await;

    let fixtures = NftStakingFixtures {
      accounts,
      contracts,
    };

    register_users(&fixtures).await;

    fixtures
  }

  /*
   * 1. Add guardian (owner)
   * 2. Deposit contract token to contract treasury (anyone)
   * 3. Create staking program (guardian)
   * 4. Transfer contract token (guardian; contract -> collection -> distribution)
   * 5. Deposit program token to collection treasury (collection owner)
   * 6. Transfer program token (collection owner; collection -> distribution)
   * 7. Mint a NFT (staker)
   * 8. Stake NFT in staking program (staker)
   * 9. Time-travel to staking program start + 1 round
   * 10. Unstake the NFT (staker)
   * 11. Assert the NFT went back to the owner
   * 12. Outer withdraw staker balance (staker)
   * 13. Assert the claimed reward is correct, considering early-withdraw penalty
   */
  #[rstest]
  #[tokio::test]
  async fn test_normal_flow() -> anyhow::Result<()> {
    let fixtures = setup_test().await;
    let accounts = fixtures.accounts;
    let contracts = fixtures.contracts;

    let owner = accounts.owner;
    let guardian = accounts.guardian;
    let collection_owner = accounts.collection_owner;
    let staker = accounts.staker;

    let nft_staking = contracts.nft_staking;
    let contract_token = contracts.contract_token;
    let program_token = contracts.program_token;
    let nft_collection = contracts.nft_collection;

    add_guardian(&nft_staking, &owner, guardian.id()).await;

    deposit(
      &nft_staking,
      &contract_token,
      &owner,
      300000000000000,
      json!({ "type": "ContractTreasury" }),
    )
    .await;

    let mut collection_rps = HashMap::new();
    let contract_reward: u128 = 20000000000000;
    let program_reward: u128 = 20000000000000;
    collection_rps.insert(
      contract_token.as_account().id(),
      format!("{contract_reward}"),
    );
    collection_rps.insert(program_token.as_account().id(), format!("{program_reward}"));

    let early_withdraw_penalty: u128 = 1000000000000;

    create_staking_program(
      &nft_staking,
      &guardian,
      json!({
        "collection_address": nft_collection.as_account().id(),
        "collection_owner": collection_owner.id(),
        "token_address": program_token.as_account().id(),
        "collection_rps": collection_rps,
        "min_staking_period": "20000",
        "early_withdraw_penalty": "1000000000000",
        "round_interval": "10000",
        "start_in": "5000",
      }),
    )
    .await;

    transfer(
      &nft_staking,
      &guardian,
      json!({
        "operation": { "type": "ContractToCollection" },
        "collection": {
          "type": "NFTContract",
          "account_id": nft_collection.as_account().id(),
        },
        "token_id": contract_token.as_account().id(),
        "amount": "300000000000000",
      }),
    )
    .await;

    transfer(
      &nft_staking,
      &guardian,
      json!({
        "operation": { "type": "CollectionToDistribution" },
        "collection": {
          "type": "NFTContract",
          "account_id": nft_collection.as_account().id(),
        },
        "token_id": contract_token.as_account().id(),
        "amount": "300000000000000",
      }),
    )
    .await;

    deposit(
      &nft_staking,
      &program_token,
      &collection_owner,
      300000000000000,
      json!({
        "type": "CollectionTreasury",
        "collection": { "type": "NFTContract", "account_id": &nft_collection.as_account().id() }
      }),
    )
    .await;

    transfer(
      &nft_staking,
      &collection_owner,
      json!({
        "operation": { "type": "CollectionToDistribution" },
        "collection": {
          "type": "NFTContract",
          "account_id": nft_collection.as_account().id(),
        },
        "token_id": program_token.as_account().id(),
        "amount": "300000000000000",
      }),
    )
    .await;

    nft_mint(&nft_collection, &collection_owner, Some(&staker)).await;
    let nft_id = "#1"; // TODO: get this value from result

    // TODO: traverse execution outcomes for possible cross-contract calls errors
    stake(&nft_staking, &nft_collection, &staker, nft_id).await;

    time_travel(&worker().await, 20).await?;

    unstake(&nft_staking, &nft_collection, &staker, nft_id).await;

    let nft = view_nft_token(&nft_collection, nft_id).await?.unwrap();
    assert_eq!(nft.owner_id.as_str(), staker.id().as_str());

    let assert_withdraw_reward = |event: serde_json::Value, reward: u128| -> anyhow::Result<()> {
      let tokens_json = event
        .get("data")
        .and_then(|d| d.get(0))
        .and_then(|d| d.get("amount"))
        .and_then(|d| Some(d.clone()))
        .unwrap();
      let tokens = u128::from_str_radix(tokens_json.as_str().unwrap(), 10)?;

      assert_eq!(tokens * DENOM, reward * (DENOM - early_withdraw_penalty));

      Ok(())
    };

    let program_withdraw_result =
      withdraw_reward(&nft_staking, &nft_collection, &staker, &program_token).await;
    let program_withdraw_event = find_event_type(
      parse_event_logs(program_withdraw_result)?,
      "withdraw_reward",
    )
    .unwrap();
    assert_withdraw_reward(program_withdraw_event, program_reward)?;

    let contract_withdraw_result =
      withdraw_reward(&nft_staking, &nft_collection, &staker, &contract_token).await;
    let contract_withdraw_event = find_event_type(
      parse_event_logs(contract_withdraw_result)?,
      "withdraw_reward",
    )
    .unwrap();
    assert_withdraw_reward(contract_withdraw_event, contract_reward)?;

    anyhow::Ok(())
  }

  // TODO: implement this
  #[rstest]
  #[tokio::test]
  async fn test_retroactive_funds() {}
}
