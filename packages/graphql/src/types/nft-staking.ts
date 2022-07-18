import { ID } from "./graphql-types";

export type NFTStaking = {
  collection: ID;
  collection_owner: ID;
  collection_treasury: ID;
  token_address: ID;
  farm: ID;
  min_staking_period: string;
  early_withdraw_penalty: string;
};

export type StakedNFT = {
  non_fungible_token_id: ID;
  collection: ID;
  owner_id: ID;
  staked_timestamp: string;
  balances: string[];
};
