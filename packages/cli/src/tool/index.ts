import inquirer from "inquirer";
import { createSubAccount } from "./createSubAccount.js";
import { deployContract } from "./deployContract.js";
import { importAccountToNearWallet } from "./importAccountToNearWallet.js";
export async function toolEntry(masterId: string) {
  const questions = [
    {
      type: "list",
      name: "operation",
      message: "[Tools] Select operation",
      choices: [
        "Create Sub Account",
        "Import Account to Near Wallet",
        "Deploy Contract",
        "Exit",
      ],
    },
  ];

  const { operation } = await inquirer.prompt(questions);

  switch (operation) {
    case "Create Sub Account":
      await createSubAccount();
      break;
    case "Import Account to Near Wallet":
      await importAccountToNearWallet();
      break;
    case "Deploy Contract":
      await deployContract();
      break;
    case "Exit":
  }
}
