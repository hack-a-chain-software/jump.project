import { config } from "dotenv";
config();

export const S3_BUCKET: string =
  process.env.NETWORK === "mainnet"
    ? "near-lake-data-mainnet"
    : "near-lake-data-testnet";
export const START_BLOCK: number = parseInt(process.env.START_BLOCK!);

export const LAUNCHPAD_CONTRACT: string = process.env.LAUNCHPAD_CONTRACT!;
export const NFT_STAKING_CONTRACT: string = process.env.NFT_STAKING_CONTRACT!;
export const XTOKEN_CONTRACT: string = process.env.XTOKEN_CONTRACT!;

export const INTERESTED_CONTRACTS: string[] = [
  LAUNCHPAD_CONTRACT,
  NFT_STAKING_CONTRACT,
  XTOKEN_CONTRACT,
];
