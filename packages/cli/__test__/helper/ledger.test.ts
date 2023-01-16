import {
  nearDeleteAccessKey,
  nearLoginWithLedger,
  removeKeyFile,
} from "../../dist/helper/ledger";

jest.setTimeout(60000);

test("nearGenerateKey", async () => {
  await nearLoginWithLedger("devtest.near");
  console.log("deleting key");
  await nearDeleteAccessKey("devtest.near");
  console.log("removing key file");
  await removeKeyFile("devtest.near");
});
