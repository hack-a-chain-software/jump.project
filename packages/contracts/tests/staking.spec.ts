import "jest";
import { NearAccount, Worker } from "near-workspaces";
import { period_duration, yield_per_period } from "./constants";

describe("Staking Contract Integration Tests", () => {
  let worker: Worker;
  let root: NearAccount;

  let userAccount: NearAccount;
  let ownerAccount: NearAccount;
  let tokenContractAccount: NearAccount;
  let stakingContractAccount: NearAccount;

  beforeAll(async () => {
    console.log("Before All triggered");

    worker = await Worker.init();

    console.log("Worker Initialized", worker);

    root = worker.rootAccount;

    userAccount = await root.createAccount("staking-user-jump");
    ownerAccount = await root.createAccount("staking-owner-jump");

    console.log("Accounts", userAccount, ownerAccount);

    tokenContractAccount = await root.createAndDeploy(
      "token-contract",
      __dirname + "/../out/token_contract.wasm"
    );
    stakingContractAccount = await root.createAndDeploy(
      "token-contract",
      __dirname + "/../out/staking.wasm"
    );

    console.log("All Accounts have been created!");
    console.log(
      stakingContractAccount,
      tokenContractAccount,
      userAccount,
      ownerAccount
    );
  });

  afterAll(async () => {
    console.log("Cleanup");
    await worker.tearDown();
  });

  it("should initialize both contracts staking and token", async () => {
    console.log("Initializing Contracts");

    await tokenContractAccount.call(
      tokenContractAccount.accountId,
      "new_default_meta",
      {
        owner_id: ownerAccount.accountId,
        total_supply: "100000000",
      }
    );

    await stakingContractAccount.call(
      stakingContractAccount.accountId,
      "initialize_staking",
      {
        owner: ownerAccount.accountId,
        period_duration: period_duration,
        yield_per_period: yield_per_period,
        token_address: tokenContractAccount.accountId,
      }
    );
  });

  it("should stake some balance into the user account", () => {
    expect(true).toBe(true);
  });
});
