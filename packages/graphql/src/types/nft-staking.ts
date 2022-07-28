import { ID } from "./graphql-types";

export type NFTStaking = {
  collection_id: ID;
  collection_owner_id: ID;
  // collection_treasury: ID[];
  token_address: ID;
  // farm: ID;
  min_staking_period: string;
  early_withdraw_penalty: string;
};

export type StakedNFT = {
  nft_id: ID;
  collection_id: ID;
  owner_id: ID;
  staked_timestamp: string;
  balances: string[];
};
