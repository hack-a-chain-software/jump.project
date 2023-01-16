import inquirer from "inquirer";
import { exec } from "../helper/exec.js";
import os from "os";
import path from "path";
const CREDENTIALS_DIR = ".near-credentials";
import fs from "fs/promises";
const homedir = os.homedir();
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const questions = [
  {
    type: "input",
    name: "accountId",
    message: "Enter Account Id you want to import",
    validate: async (value: string) => {
      let fileExists = false;
      await fs.access(`${credentialsPath}/mainnet/${value}.json`).then(() => {
        fileExists = true;
      });
      if (!fileExists)
        return "Key File does not exist for this Account Id,please use near login to generate key file";
      return true;
    },
  },
];

export async function importAccountToNearWallet() {
  //Setup Inquirer
  console.clear();
  const { accountId } = await inquirer.prompt(questions);
  console.log("Generating Link to Import Account...");
  const keyfile = await fs.readFile(
    `${credentialsPath}/mainnet/${accountId}.json`
  );
  const keyfileJson = JSON.parse(keyfile.toString());
  const private_key = keyfileJson.private_key;
  const url = `https://wallet.near.org/auto-import-secret-key#${accountId}/${private_key}`;
  console.log(url);
}
