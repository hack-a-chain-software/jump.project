import inquirer from "inquirer";
import clear from "clear";
import figlet from "figlet";
import chalk from "chalk";
import { createNFTStakingProgram } from "./createNFTStakingProgram.js";
export async function nftStakingEntry(masterId: string) {
  const questions = [
    {
      type: "list",
      name: "operation",
      message: "[NFT Staking] Select operation",
      choices: ["Create NFT Staking Program", "Exit"],
    },
  ];
  clear();
  console.log(
    chalk.blue(
      figlet.textSync("NFT Staking", {
        horizontalLayout: "full",
      })
    )
  );
  const { operation } = await inquirer.prompt(questions);

  switch (operation) {
    case "Create NFT Staking Program":
      await createNFTStakingProgram(masterId);
      break;
    case "Exit":
      process.exit(0);
  }
}
