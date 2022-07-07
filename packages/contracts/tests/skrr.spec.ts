import { NearAccount, toYocto, Worker } from "near-workspaces";


const DEFAULT_ACCOUNT_OPTIONS = {
    initialBalance: "10000000000000000000000000000",
};

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

describe("Jump Token", () => {
    let worker: Worker;
    let root: NearAccount;

    let ownerAccount: NearAccount;

    let tokenContractAccount: NearAccount;

    afterAll(async () => {
        await worker.tearDown();
    });

    beforeAll(async () => {
        worker = await Worker.init({
            initialBalance: "100000000000000000000000000000000",
        });
        root = worker.rootAccount;
        console.log("Worker Initialized.");

        ownerAccount = await createAccount(root, 'owner-account');

        tokenContractAccount = await createAccount(root, 'token');

        await deployContract(root, 'token', 'token_contract');

        console.log("Contracts deployed.");
    });

    it("Skrrr", async () => {
        await tokenContractAccount.call(tokenContractAccount, "new", {
            owner_id: ownerAccount.accountId,
            total_supply: "100000000",
            metadata: {
                spec: "ft-1.0.0",
                name: "token",
                symbol: "FTO",
                icon: null,
                reference: null,
                reference_hash: null,
                decimals: 24,
            }
        });
    });
});
