/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from "date-fns";
import { exec } from "../helper/exec.js";
import { viewMethod } from "../helper/near.js";
const parseDateString = "yyyy-MM-dd'T'HH:mm:ss";
export const listingQuestions = [
  {
    type: "confirm",
    name: "isLedger",
    message: "Are you using Ledger?",
    required: true,
    default: false,
  },
  // ...
  {
    type: "input",
    name: "project_owner",
    message: "Enter Project Owner Account Id:",
    validate: async (value: string) => {
      let is_error = false;
      await exec(`near state ${value}`, {
        silent: true,
      }).catch((_err) => {
        is_error = true;
      });
      if (is_error) return "Invalid Account Id";
      return true;
    },
  },
  // ...
  {
    type: "input",
    name: "project_token",
    message: "Enter Project Token Account Id:",
    required: true,
    validate: async (value: string) => {
      let is_error = false;
      const TokenMetadata = await viewMethod(value, "ft_metadata", {}).catch(
        (_err) => {
          is_error = true;
        }
      );
      if (is_error) return "Invalid Account Id";
      console.log("\nProject token decimals:", TokenMetadata.decimals);
      return true;
    },
  },
  // ...
  {
    type: "input",
    name: "price_token",
    message: "Enter Price Token Account Id",
    required: true,
    validate: async (value: string) => {
      let is_error = false;
      const TokenMetadata = await viewMethod(value, "ft_metadata", {}).catch(
        (_err) => {
          is_error = true;
        }
      );
      if (is_error) return "Invalid Account Id";
      console.log("\nPrice token decimals:", TokenMetadata.decimals);
      return true;
    },
  },
  // ...
  {
    type: "list",
    name: "listing_type",
    message: "Select Listing Type:",
    choices: ["Public", "Private"],
  },
  // ...
  {
    name: "open_sale_1_timestamp_seconds",
    type: "input",
    message: `Enter Sale's Local Starting Time ${parseDateString}:`,
    required: true,
    validate: (value: string) => {
      const date = parse(value, parseDateString, new Date());
      if (date.toString() === "Invalid Date") {
        return "Invalid Date";
      }
      if (date.getTime() <= new Date().getTime()) {
        return "Date must be in the future";
      }
      return true;
    },
  },
  // ...
  {
    type: "input",
    name: "open_sale_2_timestamp_seconds",
    message: `Enter phrase 2 sale Local Time ${parseDateString}:`,
    required: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate: (value: string, answers: any) => {
      const date = parse(value, parseDateString, new Date());
      if (date.toString() === "Invalid Date") {
        return "Invalid Date";
      }

      if (date.getTime() <= new Date().getTime()) {
        return "Date must be in the future";
      }
      if (
        date.getTime() <=
        parse(
          answers.open_sale_1_timestamp_seconds,
          parseDateString,
          new Date()
        ).getTime()
      ) {
        return "Date must be after phase 1";
      }
      return true;
    },
  },
  {
    type: "input",
    name: "final_sale_2_timestamp_seconds",
    message: `Enter Final Sale Local Time ${parseDateString}:`,
    required: true,
    validate: (value: string, answers: any) => {
      const date = parse(value, parseDateString, new Date());
      if (date.toString() === "Invalid Date") {
        return "Invalid Date";
      }
      if (date.getTime() <= new Date().getTime()) {
        return "Date must be in the future";
      }
      if (
        date.getTime() <=
        parse(
          answers.open_sale_2_timestamp_seconds,
          parseDateString,
          new Date()
        ).getTime()
      ) {
        return "Date must be after phase 2";
      }
      return true;
    },
  },
  {
    type: "input",
    name: "liquidity_pool_timestamp_seconds",
    message: `Enter Liquidity Pool Local Time ${parseDateString}:`,
    required: true,
    validate: (value: string) => {
      const date = parse(value, parseDateString, new Date());
      if (date.toString() === "Invalid Date") {
        return "Invalid Date";
      }
      if (date.getTime() < new Date().getTime()) {
        return "Date must be in the future";
      }
      return true;
    },
  },
  {
    type: "input",
    name: "total_amount_sale_project_tokens",
    required: true,
    message:
      "Enter Total Amount of Project Tokens for Sale(No need decimals 🙌):",
  },
  {
    type: "input",
    name: "token_allocation_size",
    message: "Enter Token Allocation Size per batch:",
    required: true,
    validate: (value: string, answers: any) => {
      const total_amount_sale_project_tokens = parseInt(
        answers.total_amount_sale_project_tokens
      );
      const token_allocation_size = parseInt(value);
      if (total_amount_sale_project_tokens % token_allocation_size != 0) {
        return "Token Allocation Size must be divisible by Total Amount of Project Tokens for Sale";
      }
      return true;
    },
  },
  {
    type: "input",
    name: "token_allocation_price",
    message: "Enter Price per batch(No need decimals 🙌):",
    required: true,
  },
  {
    type: "input",
    name: "liquidity_pool_project_tokens",
    message: "Enter liquidity_pool_project_tokens:",
    required: true,
  },
  {
    type: "input",
    name: "fraction_instant_release",
    message: "Enter % of instant release:",
    required: true,
  },
  {
    type: "input",
    name: "fraction_cliff_release",
    message: "Enter % of release in vesting stage:",
    validate: (value: string, answers: any) => {
      const fraction_instant_release = parseInt(
        answers.fraction_instant_release
      );
      const fraction_cliff_release = parseInt(value);
      if (fraction_instant_release + fraction_cliff_release != 100) {
        return "Sum of instant release and cliff release must be 100";
      }
      return true;
    },
    required: true,
  },
  {
    type: "input",
    name: "cliff_timestamp_seconds",
    message: `Enter Locked Cliff Time after sales end(days eg.365):`,
    required: true,
  },
  {
    type: "input",
    name: "end_cliff_timestamp_seconds",
    message: `Enter Vesting Duration after sales end(days eg.365):`,
    required: true,

    validate: (value: string, answers: any) => {
      const cliff_timestamp_seconds = parseInt(answers.cliff_timestamp_seconds);
      const end_cliff_timestamp_seconds = parseInt(value);
      if (end_cliff_timestamp_seconds <= cliff_timestamp_seconds) {
        return "Vesting Duration must be greater than Locked Cliff Time";
      }
      return true;
    },
  },
  {
    type: "input",
    name: "fee_price_tokens",
    required: true,
    message: "Enter % of raised funds taken as a fee:",
    validate: (value: string) => {
      const fee_price_tokens = parseInt(value);
      if (fee_price_tokens > 100) {
        return "Fee must be less than 100%";
      }
      return true;
    },
  },
  {
    type: "input",
    name: "fee_liquidity_tokens",
    required: true,
    validate: (value: string) => {
      const fee_price_tokens = parseInt(value);
      if (fee_price_tokens > 100) {
        return "Fee must be less than 100%";
      }
      return true;
    },
    message: "Enter % of liquidity tokens taken as a fee:",
  },
];
