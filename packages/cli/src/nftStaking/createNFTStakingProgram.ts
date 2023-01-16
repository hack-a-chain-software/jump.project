import inquirer from "inquirer";

import chalk from "chalk";
import BN from "bn.js";
import { exec } from "../helper/exec.js";
import {
  isValidAccount,
  isValidNep141Contract,
  viewMethod,
} from "../helper/near.js";
interface CollectionRPS {
  [rewardTokenId: string]: string;
}
const questions = [
  {
    type: "input",
    name: "collection_address",
    message: "Enter NFT Collection Address",
    validate: async (value: string) => {
      let isError = false;
      await viewMethod(value, "nft_metadata", {}).catch((_err) => {
        isError = true;
      });
      if (isError) return "Invalid Collection Id";
      return true;
    },
  },

  {
    type: "input",
    name: "collection_owner",
    message: "Enter Staking Program Owner Address",
    required: true,
    validate: async (value: string) => {
      const isValid = await isValidAccount(value);
      if (!isValid) return "Invalid Account Id";
      return true;
    },
  },
  {
    type: "input",
    name: "token_address",
    message: "Enter Reward Token Address",
    required: true,
    validate: async (value: string) => {
      const isValid = await isValidNep141Contract(value);
      if (!isValid) return "Invalid Token Address(Can't fetch metadata)";
      return true;
    },
  },
  {
    type: "input",
    name: "collection_rps_count",
    message: "Enter number of Collection RPS to be created(for collection_rps)",
    required: true,
    validate: async (value: string) => {
      if (isNaN(Number(value))) return "Invalid Number";
      return true;
    },
  },
  {
    type: "input",
    name: "min_staking_period_in_seconds",
    message: "Enter minimum staking period in seconds",
  },
  {
    type: "input",
    name: "early_withdraw_penalty",
    message: "Enter early % withdraw penalty",
  },
  {
    type: "input",
    name: "round_interval_in_seconds",
    message: "Enter round interval in seconds",
  },
  {
    type: "input",
    name: "start_in_in_seconds",
    message: "Enter start in seconds",
  },
];
export async function createNFTStakingProgram(masterId: string) {
  const {
    collection_address,
    collection_owner,
    token_address,
    collection_rps_count,
    min_staking_period_in_seconds,
    early_withdraw_penalty: early_withdraw_penalty_percentage,
    round_interval_in_seconds,
    start_in_in_seconds,
  } = await inquirer.prompt(questions);

  const collection_rps_questions = [];
  for (let i = 0; i < Number(collection_rps_count); i++) {
    collection_rps_questions.push({
      type: "input",
      name: `collection_id_${i}`,
      message: `Enter Reward Token ID No.[ ${chalk.yellow(i + 1)} ]:`,
    });
    collection_rps_questions.push({
      type: "input",
      name: `collection_interval_${i}`,
      message: `Enter Reward Interval [ ${chalk.yellow(i + 1)} ](in seconds):`,
    });
  }
  const collection_rps_answers = await inquirer.prompt(
    collection_rps_questions
  );
  const collection_rps_object: CollectionRPS = {};
  for (let i = 0; i < Number(collection_rps_count); i++) {
    collection_rps_object[collection_rps_answers[`collection_id_${i}`]] =
      collection_rps_answers[`collection_interval_${i}`];
  }
  const min_staking_period = (min_staking_period_in_seconds * 1000).toString();
  const early_withdraw_penalty = new BN(early_withdraw_penalty_percentage).mul(
    new BN("10000000000000000000")
  );
  const round_interval = (round_interval_in_seconds * 1000).toString();
  const start_in = (start_in_in_seconds * 1000).toString();

  const args = {
    payload: {
      collection_address,
      collection_owner,
      token_address,
      collection_rps: collection_rps_object,
      min_staking_period,
      early_withdraw_penalty,
      round_interval,
      start_in,
    },
  };

  console.log(chalk.green("Creating NFT Staking Program Args"));
  console.log(chalk.green("'" + JSON.stringify(args)) + "'");
}
