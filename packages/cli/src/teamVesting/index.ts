import inquirer from "inquirer";
import { exec } from "../helper/exec.js";
import { toBig } from "../helper/near.js";

export async function teamVestingEntry(masterId: string) {
  const questions = [
    {
      type: "input",
      name: "vestingContractId",
      message: "Enter Vesting Contract Id",
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
      name: "operation",
      message: "[Team Vesting] Select operation",
      choices: ["Init Vesting Contract", "Add Vesting Member", "Exit"],
    },
  ];

  const { vestingContractId, operation } = await inquirer.prompt(questions);

  switch (operation) {
    case "Init Vesting Contract":
      await initVestingContract(masterId, vestingContractId);
      break;
    case "Add Vesting Member":
      await addVestingMember(masterId, vestingContractId);
      break;
    case "Exit":
      process.exit(0);
  }
}

async function initVestingContract(
  masterId: string,
  vestingContractId: string
) {
  const questions = [
    {
      type: "input",
      name: "owner_id",
      message: "Enter Owner Id",
      default: masterId,
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
      type: "input",
      name: "emission_token",
      message: "Enter Emission Token Contract",
      default: "ftv2.nekotoken.near",
    },
  ];

  const { owner_id, emission_token } = await inquirer.prompt(questions);

  console.log("Initializing Vesting Contract...");
  const result = await exec(
    `near call ${vestingContractId} new '{"owner_id": "${owner_id}", "emission_token": "${emission_token}"}' --accountId ${masterId}`
  );
  console.log(result);
}

async function addVestingMember(masterId: string, vestingContractId: string) {
  const questions = [
    {
      type: "input",
      name: "account_id",
      message: "Enter Account Id for Vesting Member",
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
      type: "input",
      name: "duration_days",
      message: "Enter Duration (days)",
      validate: (value: string) => {
        if (isNaN(parseInt(value))) return "Invalid Duration";
        return true;
      },
    },
    {
      type: "input",
      name: "amount",
      message: "Enter Amount (NEKO)",
      validate: (value: string) => {
        if (isNaN(parseInt(value))) return "Invalid Duration";
        return true;
      },
    },
  ];

  const { account_id, amount, duration_days } = await inquirer.prompt(
    questions
  );

  console.log("Adding Vesting Member...");
  const parsedAmount = toBig(amount, 24).toString();

  const result = await exec(
    `near call ${vestingContractId} set_vesting_account '{"account_id": "${account_id}", "amount": "${parsedAmount}", "duration_days": ${parseInt(
      duration_days
    )}}' --accountId ${masterId}`
  );
  console.log(result);
}
