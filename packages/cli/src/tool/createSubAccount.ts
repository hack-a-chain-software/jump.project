import inquirer from "inquirer";
import { exec } from "../helper/exec.js";

const questions = [
  {
    type: "confirm",
    name: "isLedger",
    message: "Using Ledger?",
  },
  {
    type: "input",
    name: "accountId",
    message: "Enter SubAccount Account Id",
  },
  {
    type: "input",
    name: "masterAccount",
    message: "Enter Master Account Id",
  },
  {
    type: "input",
    name: "initialBalance",
    message: "Enter Initial Balance",
  },
];

export async function createSubAccount() {
  //Setup Inquirer
  console.clear();
  const { isLedger, accountId, masterAccount, initialBalance } =
    await inquirer.prompt(questions);
  console.log("Creating SubAccount...");
  const result = await exec(
    `near create-account ${accountId} --masterAccount ${masterAccount} --initialBalance ${initialBalance} ${
      isLedger ? "--useLedgerKey" : ""
    }`
  );
  console.log(result);
}
