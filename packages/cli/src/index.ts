import { createListing } from "./launchpad/create_listing.js";
import inquirer from "inquirer";
import { exec } from "./helper/exec.js";
import { launchPadEntry } from "./launchpad/index.js";
import { toolEntry } from "./tool/index.js";
import { teamVestingEntry } from "./teamVesting/index.js";

const questions = [
  {
    type: "input",
    name: "accountId",
    message: "Enter Master Account Id",
    validate: async (value: string) => {
      let isError = false;
      await exec(`near state ${value}`).catch((err) => {
        isError = true;
      });
      if (isError) return "Invalid Account Id";
      return true;
    },
  },
  {
    type: "list",
    name: "action",
    message: "Select Section",
    choices: [
      "Token Launchpad",
      "NFT Staking",
      "XJump",
      "Team Vesting",
      "Tools",
      "Exit",
    ],
  },
];

(async () => {
  //Setup Inquirer
  console.clear();
  const { accountId, action } = await inquirer.prompt(questions);

  switch (action) {
    case "Token Launchpad":
      await launchPadEntry(accountId);
      break;
    case "Tools":
      await toolEntry(accountId);
      break;
    case "Team Vesting":
      await teamVestingEntry(accountId);
      break;
    case "Exit":
      process.exit(0);
  }
})();
