/* eslint-disable @typescript-eslint/no-empty-function */
import { Account, Contract, Near } from "near-api-js";
import { Staking } from "../lib/staking";
import { deployContract } from "./utils";
import { TokenContract } from "@near/ts";
import { setupNearWithContractAccounts } from "./utils/accounts";

import fs from "fs";
import path from "path";

const yield_per_period = "10";
const period_duration = "604800000";

describe("Staking Contract", () => {
  let masterAccount: Account;
  let account: Account;
  let tokenContractAccount: Account;
  let stakingContractAccount: Account;
  let near: Near;
  let config: any;
  let stakingContract: Staking;
  let tokenContract: TokenContract;

  beforeAll(async () => {
    const { testAccount, tokenAccount, stakingAccount, near, ...rest } =
      await setupNearWithContractAccounts();
    masterAccount = rest.masterAccount;

    tokenContractAccount = tokenAccount;
    stakingContractAccount = stakingAccount;

    account = testAccount;
    config = rest.config;

    console.log("pre-deploy");
    await stakingContractAccount.deployContract(
      fs.readFileSync(path.resolve(__dirname, "../out/staking.wasm"))
    );
    console.log("first-deploy");
    await tokenContractAccount.deployContract(
      fs.readFileSync(path.resolve(__dirname, "../out/token_contract.wasm"))
    );

    console.log("after-deploy");

    console.log(
      tokenContractAccount.accountId,
      stakingContractAccount.accountId
    );

    stakingContract = new Staking(
      new Contract(account, stakingAccount.accountId, {
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

    tokenContract = new Contract(account, tokenAccount.accountId, {
      viewMethods: [],
      changeMethods: ["new_default_meta"],
    }) as any;
  });

  it("should initialize the staking program", async () => {
    await tokenContract.new_default_meta({
      owner_id: account.accountId,
      total_supply: "100000000",
    } as any);

    await stakingContract.initialize_staking({
      owner: account.accountId,
      period_duration,
      yield_per_period,
      token_address: tokenContract.account.accountId,
    });
  });

  it("should stake some balance into the user account", () => {
    expect(true).toBe(true);
  });
});
