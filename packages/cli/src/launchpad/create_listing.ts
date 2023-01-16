import chalk from "chalk";
import inquirer from "inquirer";
import { parse } from "date-fns";
import { listingQuestions } from "./create_listing_questions.js";
import { toBig, viewMethod } from "../helper/near.js";
import { LAUNCHPAD_ID } from "./index.js";
import { exec } from "../helper/exec.js";
import { nearDeleteAccessKey, nearLoginWithLedger } from "../helper/ledger.js";
export async function createListing(masterId: string) {
  const parseDateString = "yyyy-MM-dd'T'HH:mm:ss";

  const {
    isLedger,
    project_owner,
    project_token,
    price_token,
    listing_type,
    open_sale_1_timestamp_seconds: open_sale_1_timestamp,
    open_sale_2_timestamp_seconds: open_sale_2_timestamp,
    final_sale_2_timestamp_seconds: final_sale_2_timestamp,
    liquidity_pool_timestamp_seconds: liquidity_pool_timestamp,
    total_amount_sale_project_tokens:
      total_amount_sale_project_tokens_no_decimals,
    token_allocation_size: token_allocation_size_no_decimals,
    token_allocation_price: token_allocation_price_no_decimals,
    liquidity_pool_project_tokens: liquidity_pool_project_tokens_no_decimals,
    liquidity_pool_price_tokens: liquidity_pool_price_tokens_no_decimals,
    fraction_instant_release: fraction_instant_release_no_fraction,
    fraction_cliff_release: fraction_cliff_release_no_fraction,
    cliff_timestamp_seconds: cliff_timestamp_days,
    end_cliff_timestamp_seconds: end_cliff_timestamp_days,
    fee_price_tokens: fee_price_tokens_no_fraction,
    fee_liquidity_tokens: fee_liquidity_tokens_no_fraction,
  } = await inquirer.prompt(listingQuestions);

  async function createListingArgs(
    isLedger: boolean,
    project_owner: string,
    project_token: string,
    price_token: string,
    listing_type: string,
    open_sale_1_timestamp: string,
    open_sale_2_timestamp: string,
    final_sale_2_timestamp: string,
    liquidity_pool_timestamp: string,
    total_amount_sale_project_tokens_no_decimals: string,
    token_allocation_size_no_decimals: string,
    token_allocation_price_no_decimals: string,
    liquidity_pool_project_tokens_no_decimals: string,
    liquidity_pool_price_tokens_no_decimals: string,
    fraction_instant_release_no_fraction: string,
    fraction_cliff_release_no_fraction: string,
    cliff_timestamp_days: string,
    end_cliff_timestamp_days: string,
    fee_price_tokens_no_fraction: string
  ) {
    const sale_1_date = parse(
      open_sale_1_timestamp,
      parseDateString,
      new Date()
    );
    const sale_2_date = parse(
      open_sale_2_timestamp,
      parseDateString,
      new Date()
    );
    const final_sale_2_date = parse(
      final_sale_2_timestamp,
      parseDateString,
      new Date()
    );
    const liquidity_pool_date = parse(
      liquidity_pool_timestamp,
      parseDateString,
      new Date()
    );

    const open_sale_1_timestamp_seconds = sale_1_date.getTime() / 1000;
    const open_sale_2_timestamp_seconds = sale_2_date.getTime() / 1000;
    const final_sale_2_timestamp_seconds = final_sale_2_date.getTime() / 1000;
    const liquidity_pool_timestamp_seconds =
      liquidity_pool_date.getTime() / 1000;

    const projectTokenDecimals = (
      await viewMethod(project_token, "ft_metadata", {})
    ).decimals;
    const priceTokenDecimals = (
      await viewMethod(price_token, "ft_metadata", {})
    ).decimals;
    const total_amount_sale_project_tokens = toBig(
      total_amount_sale_project_tokens_no_decimals,
      projectTokenDecimals
    );
    const token_allocation_size = toBig(
      token_allocation_size_no_decimals,
      projectTokenDecimals
    );
    const token_allocation_price = toBig(
      token_allocation_price_no_decimals,
      priceTokenDecimals
    );
    const liquidity_pool_project_tokens = toBig(
      liquidity_pool_project_tokens_no_decimals,
      projectTokenDecimals
    );
    const liquidity_pool_price_tokens = toBig(
      liquidity_pool_price_tokens_no_decimals,
      priceTokenDecimals
    );

    const fraction_instant_release = (
      parseFloat(fraction_instant_release_no_fraction) * 100
    ).toString();
    const fraction_cliff_release = (
      parseFloat(fraction_cliff_release_no_fraction) * 100
    ).toString();
    const cliff_timestamp_seconds = (
      parseInt(cliff_timestamp_days) * 86400
    ).toString();
    const end_cliff_timestamp_seconds = (
      parseInt(end_cliff_timestamp_days) * 86400
    ).toString();
    const fee_price_tokens = (
      parseFloat(fee_price_tokens_no_fraction) * 100
    ).toString();
    const fee_liquidity_tokens = (
      parseFloat(fee_liquidity_tokens_no_fraction) * 100
    ).toString();

    const listing = {
      project_owner,
      project_token,
      price_token,
      listing_type,
      open_sale_1_timestamp_seconds,
      open_sale_2_timestamp_seconds,
      final_sale_2_timestamp_seconds,
      liquidity_pool_timestamp_seconds,
      total_amount_sale_project_tokens,
      token_allocation_size,
      token_allocation_price,
      liquidity_pool_project_tokens,
      liquidity_pool_price_tokens,
      fraction_instant_release,
      fraction_cliff_release,
      cliff_timestamp_seconds,
      end_cliff_timestamp_seconds,
      fee_price_tokens,
      fee_liquidity_tokens,
    };

    const _contractId = LAUNCHPAD_ID;

    const argsString = "'" + JSON.stringify(listing) + "'";

    await nearLoginWithLedger(masterId, isLedger);
    console.log(chalk.yellow("Simulating Contract Call...."));
    console.log(chalk.green("Generated args:", argsString));

    console.log("Cleaning up keys");
    await nearDeleteAccessKey(masterId);

    console.log("DONE");
  }
  createListingArgs(
    isLedger,
    project_owner,
    project_token,
    price_token,
    listing_type,
    open_sale_1_timestamp,
    open_sale_2_timestamp,
    final_sale_2_timestamp,
    liquidity_pool_timestamp,
    total_amount_sale_project_tokens_no_decimals,
    token_allocation_size_no_decimals,
    token_allocation_price_no_decimals,
    liquidity_pool_project_tokens_no_decimals,
    liquidity_pool_price_tokens_no_decimals,
    fraction_instant_release_no_fraction,
    fraction_cliff_release_no_fraction,
    cliff_timestamp_days,
    end_cliff_timestamp_days,
    fee_price_tokens_no_fraction
  );
  return true;
}
