import { exec } from "./exec.js";
import os from "os";
import path from "path";
const CREDENTIALS_DIR = ".near-credentials";
import fs from "fs/promises";
const homedir = os.homedir();
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

export async function nearLoginWithLedger(
  accountId: string,
  isLedger: boolean
) {
  const result = await exec(
    `near login --accountId ${accountId} ${isLedger ? "--useLedgerKey" : ""}`
  ).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function nearDeleteAccessKey(accountId: string) {
  const keyfile = await fs.readFile(
    `${credentialsPath}/mainnet/${accountId}.json`
  );
  const keyfileJson = JSON.parse(keyfile.toString());
  const publicKey = keyfileJson.public_key;
  const result = await exec(`near delete-key ${accountId} ${publicKey}`).catch(
    (err) => {
      console.log(err);
    }
  );

  await removeKeyFile(accountId);

  return result;
}

export async function removeKeyFile(accountId: string) {
  const result = await exec(
    `rm ${credentialsPath}/mainnet/${accountId}.json`
  ).catch((err) => {
    console.log(err);
  });
  return result;
}
