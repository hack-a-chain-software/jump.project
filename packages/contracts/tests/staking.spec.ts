import "jest";
import { NearAccount, toYocto, Worker } from "near-workspaces";
import { period_duration, yield_per_period } from "./constants";
import { IUserData } from "./types";

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
      "staking-contract",
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

    await tokenContractAccount.call(tokenContractAccount, "initialize", {
      owner_id: ownerAccount.accountId,
      total_supply: "100000000",
      metadata: {
        spec: "ft-1.0.0",
        name: "name",
        symbol: "NME",
        icon: null,
        reference: null,
        reference_hash: null,
        decimals: 24,
      },
    });

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

  it("should stake some balance into the user account", async () => {
    try {
      // Transfer some XToken to the user
      await ownerAccount.call(tokenContractAccount.accountId, "ft_transfer", {
        receiver_id: userAccount.accountId,
        amount: "200",
      });

      // Staking Some XToken into the Contract via FT_Transfer Call
      await userAccount.call(tokenContractAccount.accountId, "ft_transfer", {
        receiver_id: stakingContractAccount.accountId,
        amount: "80",
        attachedDeposit: toYocto("1"),
      });

      // Retrieve user data from the contract
      const userData = await stakingContractAccount.view<IUserData>(
        "get_user_data",
        {
          account_id: userAccount.accountId,
        }
      );

      console.log(userData);

      const { balance } = userData;

      // Expect that the balance is greater than 0 and the ammount of tokens that we deposited!
      expect(balance).toBeGreaterThan(0);
      expect(balance).toBe(80);
    } catch (error) {
      console.error(
        "The test panicked at this error",
        (error as Error).message
      );
      throw error;
    }
  });

  it("should withdraw some funds from the user account", () => {
    expect(true).toBe(true);
  });
});
