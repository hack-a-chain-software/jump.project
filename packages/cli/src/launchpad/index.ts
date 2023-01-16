import inquirer from "inquirer";
import { createListing } from "./create_listing.js";
import clear from "clear";
import figlet from "figlet";
import chalk from "chalk";
export const LAUNCHPAD_ID = "launchpad.jumpfinance.near";

export async function launchPadEntry(masterId: string) {
  const questions = [
    {
      type: "list",
      name: "operation",
      message: "[Token LaunchPad] Select operation",
      choices: [
        "Check Listing",
        new inquirer.Separator(),
        "Assign Guardian",
        "Remove Guardian",
        "Retrieve Treasury Funds",
        "Update Launchpad Settings",
        new inquirer.Separator(),
        "Create New Listing",
        "Cancel Listing",
        new inquirer.Separator(),
        "Toggle Authorize Listing Creation",
        "Alter Private sale whitelist",
        "Withdraw project tokens",
        "Fund Listing",
        "Exit",
      ],
    },
  ];
  clear();
  console.log(
    chalk.blue(
      figlet.textSync("Tools", {
        horizontalLayout: "full",
      })
    )
  );
  const { operation } = await inquirer.prompt(questions);

  switch (operation) {
    case "Create New Listing":
      await createListing(masterId);
  }
}
