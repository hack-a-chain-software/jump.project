import inquirer from "inquirer";
import { exec } from "../helper/exec.js";
import fs from "fs/promises";
import path from "path";
import { nearDeleteAccessKey, nearLoginWithLedger } from "../helper/ledger.js";
//current directory
const currentDir = path.resolve("./");
const contractFilesInDir = await fs.readdir(path.join(currentDir));

const questions = [
  {
    type: "confirm",
    name: "isLedger",
    message: "Are you using Ledger?",
    required: true,
  },
  {
    type: "input",
    name: "accountId",
    message: "Enter Contract Account Id",
    validate: async (value: string) => {
      let isError = false;
      await exec(`near state ${value}`, {
        silent: true,
      }).catch((err) => {
        isError = true;
      });
      if (isError) return "Invalid Account Id";
      return true;
    },
  },
  {
    type: "list",
    name: "contractName",
    choices: contractFilesInDir,
  },
];

export async function deployContract(masterId: string) {
  //Setup Inquirer
  console.clear();
  const { accountId, contractName, isLedger } = await inquirer.prompt(
    questions
  );
  await nearLoginWithLedger(masterId, isLedger);
  console.log("Deploying Contract...");
  const result = await exec(
    `near deploy ${accountId} --wasmFile ${path.join(currentDir, contractName)}`
  ).catch((err) => {});
  console.log("Cleaning up keys");
  await nearDeleteAccessKey(masterId);

  return result;
}
