/* eslint-disable @typescript-eslint/no-empty-function */
import { Account, connect, Contract } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { Staking } from "../lib/staking";
import { createTestAccount, deployContract } from "./utils";
import { TokenContract } from "@near/ts";

const yield_per_period = "10";
const period_duration = "604800000";

const config = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  contractName: "dev-1652055476064-95220052886384",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

describe("Staking Contract", () => {
  let account: Account;
  let stakingContractAccount: Account;
  let tokenContractAccount: Account;
  let tokenContract: TokenContract;
  let stakingContract: Staking;

  beforeAll(async () => {
    const keyStore = new InMemoryKeyStore();
    const near = await connect({ ...config, keyStore });

    stakingContractAccount = await createTestAccount({
      near,
      config,
      keyStore,
    });
    tokenContractAccount = await createTestAccount({ near, config, keyStore });
    account = await createTestAccount({ near, config, keyStore });

    await deployContract(stakingContractAccount, "../out/staking.wasm");
    await deployContract(tokenContractAccount, "../out/token_contract.wasm");

    console.log(process.env);
    stakingContract = new Staking(
      new Contract(account, stakingContractAccount.accountId, {
        viewMethods: ["get_user_data"],
        changeMethods: [
          "initialize_staking",
          "unregister_storage",
          "register_storage",
          "claim",
          "unstake",
          "unstake_all",
        ],
      })
    );
    tokenContract = new Contract(account, tokenContractAccount.accountId, {
      viewMethods: ["get_user_data"],
      changeMethods: [
        "initialize_staking",
        "unregister_storage",
        "register_storage",
        "claim",
        "unstake",
        "unstake_all",
      ],
      // TODO: Change this when near improoves typescript types
    }) as any;
  });

  it("should initialize the token contract and staking contract", async () => {
    await tokenContract.new_default_meta({
      params: {
        owner_id: account.accountId,
        total_supply: "100000000",
      },
    });

    await stakingContract.initialize_staking({
      owner: account.accountId,
      period_duration,
      yield_per_period,
      token_address: tokenContract.account.accountId,
    });
  });
});
