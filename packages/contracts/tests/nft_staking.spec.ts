import "jest";
import { NearAccount, toYocto, Worker } from "near-workspaces";

const GAS_LIMIT = "300000000000000";
const DEFAULT_GAS = "3000000000000";
const DEFAULT_FUNCTION_GAS = "30000000000000";

const DEFAULT_ACCOUNT_OPTIONS = {
  initialBalance: "10000000000000000000000000000",
};
const DEPOSIT_ONE_YOCTO = { attachedDeposit: "1" };

const DENOM = 1_000_000_000_000;

const getWasmPath = (binName: string) => `${__dirname}/../out/${binName}.wasm`;

const getAccountId = (root: NearAccount, name: string) =>
  root.getSubAccount(name).accountId;

const createAccount = (root: NearAccount, name: string, options?: any) =>
  root.createAccount(
    getAccountId(root, name),
    options ?? DEFAULT_ACCOUNT_OPTIONS
  );

const deployContract = (
  owner: NearAccount,
  name: string,
  binName: string,
  options?: any
) =>
  owner.createAndDeploy(
    getAccountId(owner, name),
    getWasmPath(binName),
    options ?? DEFAULT_ACCOUNT_OPTIONS
  );

type Token = {
  token_id: String;
  owner_id: String;
  metadata?: Object;
  approved_account_ids?: Record<string, number>;
};

describe("NFT Staking Contract Integration Tests", () => {
  let worker: Worker;
  let root: NearAccount;

  let ownerAccount: NearAccount;
  let guardianAccount: NearAccount;
  let collectionOwnerAccount: NearAccount;
  let stakerAccount: NearAccount;

  let tokenContractAccounts: NearAccount[];
  let nftContractAccount: NearAccount;
  let stakingContractAccount: NearAccount;

  afterAll(async () => {
    await worker.tearDown();
  });

  beforeAll(async () => {
    worker = await Worker.init({
      initialBalance: "100000000000000000000000000000000",
    });
    root = worker.rootAccount;
    console.log("Worker Initialized. Root Account ID: ", root.accountId);

    [ownerAccount, guardianAccount, collectionOwnerAccount, stakerAccount] =
      await Promise.all(
        [
          {
            name: "owner",
            options: { initialBalance: "1000000000000000000000000000000" },
          },
          { name: "guardian" },
          {
            name: "collection-owner",
            options: { initialBalance: "1000000000000000000000000000000" },
          },
          { name: "staker" },
        ].map(({ name, options }) =>
          createAccount(root, `nft-staking-${name}-jump`, options)
        )
      );

    console.log("User accounts created.");

    tokenContractAccounts = await Promise.all(
      [
        { name: "token-a", owner: ownerAccount },
        { name: "token-b", owner: ownerAccount },
        { name: "token-c", owner: collectionOwnerAccount },
      ].map(({ name, owner }) => deployContract(owner, name, "token_contract"))
    );

    [nftContractAccount, stakingContractAccount] = await Promise.all([
      deployContract(root, "nft-contract", "nft_contract"),
      deployContract(root, "nft-staking-contract-jump", "nft_staking"),
    ]);

    console.log("Contracts deployed.");
  });

  it("should initialize contracts", async () => {
    console.log("Initializing contracts.");

    await Promise.all(
      tokenContractAccounts.map((account) =>
        account.call(account, "new", {
          owner_id: collectionOwnerAccount.accountId,
          total_supply: "100000000",
          metadata: {
            spec: "ft-1.0.0",
            name: "token",
            symbol: "FTO",
            icon: null,
            reference: null,
            reference_hash: null,
            decimals: 24,
          },
        })
      )
    );

    await nftContractAccount.call(nftContractAccount, "new", {
      owner_id: collectionOwnerAccount.accountId,
      metadata: {
        spec: "nft-1.0.0",
        name: "collection",
        symbol: "CLT",
        icon: null,
        base_uri: null,
        reference: null,
        reference_hash: null,
      },
    });

    await stakingContractAccount.call(
      stakingContractAccount,
      "new",
      {
        owner_id: ownerAccount.accountId,
        contract_tokens: tokenContractAccounts
          .filter((_, i) => i <= 1)
          .map((account) => account.accountId),
      },
      { gas: DEFAULT_GAS }
    );
  });

  it("owner should be able to add guardian", async () => {
    await ownerAccount.call(
      stakingContractAccount,
      "add_guardian",
      { guardian: guardianAccount.accountId },
      DEPOSIT_ONE_YOCTO
    );

    // assert that guardians changed
  });

  it("guardians should be able to create a staking program", async () => {
    const collectionRps = Object.fromEntries(
      tokenContractAccounts.map((account) => [account.accountId, 10])
    );

    await guardianAccount.call(
      stakingContractAccount,
      "create_staking_program",
      {
        payload: {
          collection_address: nftContractAccount.accountId,
          collection_owner: collectionOwnerAccount.accountId,
          token_address: tokenContractAccounts[2].accountId,
          collection_rps: collectionRps,
          min_staking_period: 86400, // day in seconds
          early_withdraw_penalty: DENOM / 20, // 5%
          round_interval: 1,
        },
      },
      DEPOSIT_ONE_YOCTO
    );
  });

  it("collection owners should be able to deposit project token to program's collection treasury", async () => {
    await collectionOwnerAccount.call(
      tokenContractAccounts[2],
      "storage_deposit",
      { account_id: collectionOwnerAccount.accountId },
      { attachedDeposit: "125000000000000000000000000000" }
    );

    await collectionOwnerAccount.call(
      tokenContractAccounts[2],
      "storage_deposit",
      { account_id: stakingContractAccount.accountId },
      { attachedDeposit: "125000000000000000000000000000" }
    );

    await collectionOwnerAccount.call(
      tokenContractAccounts[2],
      "ft_transfer",
      {
        receiver_id: stakingContractAccount.accountId,
        amount: "80",
        memo: JSON.stringify({
          type: "CollectionOwnerDeposit",
          collection: {
            type: "NFTContract",
            account_id: nftContractAccount.accountId,
          },
        }),
      },
      DEPOSIT_ONE_YOCTO
    );
  });

  it("staker should be able to create account and deposit funds for storage", async () => {
    const attachedDeposit = "300000000000000000000000";

    const balance = await stakerAccount.call<{
      total: String;
      available: String;
    }>(
      stakingContractAccount,
      "storage_deposit",
      { registration_only: false },
      { attachedDeposit }
    );

    expect(balance.total).toBe(attachedDeposit);
    expect(balance.available).toBe(attachedDeposit);
  });

  it("staker should be able to stake NFT", async () => {
    const token = await stakerAccount.call<Token>(
      nftContractAccount,
      "nft_mint",
      {},
      { attachedDeposit: "7000000000000000000000" }
    );

    /*
            this isn't working in test env for reasons (it's a cross-contract call)

            const undo = await stakerAccount.call(
                nftContractAccount,
                "nft_transfer_call",
                {
                    receiver_id: stakingContractAccount.accountId,
                    token_id: token.token_id,
                    msg: JSON.stringify({
                        type: 'Stake'
                    })
                },
                { ...DEPOSIT_ONE_YOCTO, gas: GAS_LIMIT }
            );
        */

    const undo = await nftContractAccount.call(
      stakingContractAccount,
      "nft_on_transfer",
      {
        sender_id: stakerAccount.accountId,
        previous_owner_id: stakerAccount.accountId,
        token_id: token.token_id,
        msg: JSON.stringify({
          type: "Stake",
        }),
      },
      { ...DEPOSIT_ONE_YOCTO, gas: GAS_LIMIT }
    );
    expect(undo).toBe(false);

    /*
            now this doesn't work because the library sucks
            const result = await stakingContractAccount.view("view_staked", {
                collection: {
                    type: 'NFTContract',
                    account_id: nftContractAccount.accountId
                },
                account_id: stakerAccount.accountId
            });
        */

    const result = await stakerAccount.call(
      stakingContractAccount,
      "view_staked",
      {
        collection: {
          type: "NFTContract",
          account_id: nftContractAccount.accountId,
        },
        account_id: stakerAccount.accountId,
      }
    );
    expect(result).toContain("#1");
  });
});
