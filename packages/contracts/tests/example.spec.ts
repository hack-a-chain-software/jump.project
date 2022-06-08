import "jest";
import { Worker } from "near-workspaces";

describe("Worker tests", () => {
  let worker: Worker;
  let root: Worker["rootAccount"];

  beforeAll(async () => {
    worker = await Worker.init();
    root = worker.rootAccount;
  });

  afterAll(async () => {
    await worker.tearDown();
  });

  it("should run the sandbox environment and create a test account", async () => {
    const mike = await root.createAccount("mike");

    expect(mike.accountId).toBe("mike");
  });
});
