import inquirer from "inquirer";
import { exec } from "../helper/exec.js";
import fs from "fs/promises";
import path from "path";
//current directory
const currentDir = path.resolve("./");
const contractFilesInDir = await fs.readdir(path.join(currentDir, "contract"));

const questions = [
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

export async function deployContract() {
  //Setup Inquirer
  console.clear();
  const { accountId, contractName } = await inquirer.prompt(questions);

  console.log("Deploying Contract...");
  const result = await exec(
    `near deploy ${accountId} --wasmFile ${path.join(
      currentDir,
      "contract",
      contractName
    )}`
  ).catch((err) => {});
  return result;
}
