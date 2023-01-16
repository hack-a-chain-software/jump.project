import inquirer from "inquirer";
import { exec } from "../helper/exec.js";
import fs from "fs/promises";

const contractFilesInDir = await fs.readdir("./contract");

const questions = [
  {
    type: "input",
    name: "accountId",
    message: "Enter Contract Account Id",
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
    `near deploy ${accountId} --wasmFile ./contract/${contractName}`
  ).catch((err) => {
    console.log(err);
  });
  return result;
}
