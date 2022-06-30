import "jest";
import { NearAccount, Worker } from "near-workspaces";

describe("Worker tests", () => {
  let worker: Worker;
  let root: Worker["rootAccount"];
  let owner, tokenContract, user1, user2, xtoken: NearAccount;

  beforeAll(async () => {
    console.log("Before all trigerred");
    worker = await Worker.init();
    root = worker.rootAccount;

    owner = await root.createAccount("owner");
    user1 = await root.createAccount("user1");

    tokenContract = await root.createAndDeploy(
      "token",
      __dirname + "/../out/token_contract.wasm"
    );
    xtoken = await root.createAndDeploy("xtoken", "/../out/x_token.wasm");

    console.log("All accounts have been created");
  });

  afterAll(async () => {
    await worker.tearDown();
  });

  it("should run the sandbox environment and create a test account", async () => {
    user2 = await root.createAccount("user2");
    expect(user2.accountId).toBe("user2");
  });
});
