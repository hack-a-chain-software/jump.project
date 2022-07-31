import {
  FieldPolicy,
  FieldReadFunction,
  TypePolicies,
  TypePolicy,
} from "@apollo/client/cache";
export type CollectionMetaKeySpecifier = (
  | "image"
  | "name"
  | CollectionMetaKeySpecifier
)[];
export type CollectionMetaFieldPolicy = {
  image?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InvestorAllocationKeySpecifier = (
  | "account_id"
  | "listing_id"
  | "quantity_withdrawn"
  | "total_allocation"
  | "total_quantity"
  | InvestorAllocationKeySpecifier
)[];
export type InvestorAllocationFieldPolicy = {
  account_id?: FieldPolicy<any> | FieldReadFunction<any>;
  listing_id?: FieldPolicy<any> | FieldReadFunction<any>;
  quantity_withdrawn?: FieldPolicy<any> | FieldReadFunction<any>;
  total_allocation?: FieldPolicy<any> | FieldReadFunction<any>;
  total_quantity?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LaunchpadInvestorKeySpecifier = (
  | "account_id"
  | "allocation_count"
  | "last_check"
  | "staked_token"
  | LaunchpadInvestorKeySpecifier
)[];
export type LaunchpadInvestorFieldPolicy = {
  account_id?: FieldPolicy<any> | FieldReadFunction<any>;
  allocation_count?: FieldPolicy<any> | FieldReadFunction<any>;
  last_check?: FieldPolicy<any> | FieldReadFunction<any>;
  staked_token?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LaunchpadListingKeySpecifier = (
  | "allocation"
  | "allocations_sold"
  | "cliff_timestamp"
  | "description_project"
  | "description_token"
  | "dex_id"
  | "discord"
  | "end_cliff_timestamp"
  | "fee_liquidity_tokens"
  | "fee_price_tokens"
  | "final_sale_2_timestamp"
  | "fraction_cliff_release"
  | "fraction_instant_release"
  | "liquidity_pool_price_tokens"
  | "liquidity_pool_project_tokens"
  | "liquidity_pool_timestamp"
  | "listing_id"
  | "open_sale_1_timestamp"
  | "open_sale_2_timestamp"
  | "price_token"
  | "price_token_info"
  | "project_name"
  | "project_owner"
  | "project_token"
  | "project_token_info"
  | "status"
  | "telegram"
  | "token_allocation_price"
  | "token_allocation_size"
  | "total_amount_sale_project_tokens"
  | "twitter"
  | "website"
  | "whitepaper"
  | LaunchpadListingKeySpecifier
)[];
export type LaunchpadListingFieldPolicy = {
  allocation?: FieldPolicy<any> | FieldReadFunction<any>;
  allocations_sold?: FieldPolicy<any> | FieldReadFunction<any>;
  cliff_timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  description_project?: FieldPolicy<any> | FieldReadFunction<any>;
  description_token?: FieldPolicy<any> | FieldReadFunction<any>;
  dex_id?: FieldPolicy<any> | FieldReadFunction<any>;
  discord?: FieldPolicy<any> | FieldReadFunction<any>;
  end_cliff_timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  fee_liquidity_tokens?: FieldPolicy<any> | FieldReadFunction<any>;
  fee_price_tokens?: FieldPolicy<any> | FieldReadFunction<any>;
  final_sale_2_timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  fraction_cliff_release?: FieldPolicy<any> | FieldReadFunction<any>;
  fraction_instant_release?: FieldPolicy<any> | FieldReadFunction<any>;
  liquidity_pool_price_tokens?: FieldPolicy<any> | FieldReadFunction<any>;
  liquidity_pool_project_tokens?: FieldPolicy<any> | FieldReadFunction<any>;
  liquidity_pool_timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  listing_id?: FieldPolicy<any> | FieldReadFunction<any>;
  open_sale_1_timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  open_sale_2_timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  price_token?: FieldPolicy<any> | FieldReadFunction<any>;
  price_token_info?: FieldPolicy<any> | FieldReadFunction<any>;
  project_name?: FieldPolicy<any> | FieldReadFunction<any>;
  project_owner?: FieldPolicy<any> | FieldReadFunction<any>;
  project_token?: FieldPolicy<any> | FieldReadFunction<any>;
  project_token_info?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  telegram?: FieldPolicy<any> | FieldReadFunction<any>;
  token_allocation_price?: FieldPolicy<any> | FieldReadFunction<any>;
  token_allocation_size?: FieldPolicy<any> | FieldReadFunction<any>;
  total_amount_sale_project_tokens?: FieldPolicy<any> | FieldReadFunction<any>;
  twitter?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
  whitepaper?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LaunchpadPageKeySpecifier = (
  | "data"
  | "hasNextPage"
  | "itemsPerPage"
  | "pageSize"
  | "totalCount"
  | LaunchpadPageKeySpecifier
)[];
export type LaunchpadPageFieldPolicy = {
  data?: FieldPolicy<any> | FieldReadFunction<any>;
  hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>;
  itemsPerPage?: FieldPolicy<any> | FieldReadFunction<any>;
  pageSize?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MessageOutputKeySpecifier = (
  | "message"
  | MessageOutputKeySpecifier
)[];
export type MessageOutputFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NFTPageKeySpecifier = (
  | "data"
  | "hasNextPage"
  | "itemsPerPage"
  | "pageSize"
  | "totalCount"
  | NFTPageKeySpecifier
)[];
export type NFTPageFieldPolicy = {
  data?: FieldPolicy<any> | FieldReadFunction<any>;
  hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>;
  itemsPerPage?: FieldPolicy<any> | FieldReadFunction<any>;
  pageSize?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NFTStakingKeySpecifier = (
  | "collection_id"
  | "collection_meta"
  | "collection_owner_id"
  | "early_withdraw_penalty"
  | "min_staking_period"
  | "staked_nfts_by_owner"
  | "token_address"
  | "total_rewards"
  | NFTStakingKeySpecifier
)[];
export type NFTStakingFieldPolicy = {
  collection_id?: FieldPolicy<any> | FieldReadFunction<any>;
  collection_meta?: FieldPolicy<any> | FieldReadFunction<any>;
  collection_owner_id?: FieldPolicy<any> | FieldReadFunction<any>;
  early_withdraw_penalty?: FieldPolicy<any> | FieldReadFunction<any>;
  min_staking_period?: FieldPolicy<any> | FieldReadFunction<any>;
  staked_nfts_by_owner?: FieldPolicy<any> | FieldReadFunction<any>;
  token_address?: FieldPolicy<any> | FieldReadFunction<any>;
  total_rewards?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NFTStakingTotalRewardsKeySpecifier = (
  | "rewards_acova"
  | "rewards_jump"
  | "rewards_project_token"
  | NFTStakingTotalRewardsKeySpecifier
)[];
export type NFTStakingTotalRewardsFieldPolicy = {
  rewards_acova?: FieldPolicy<any> | FieldReadFunction<any>;
  rewards_jump?: FieldPolicy<any> | FieldReadFunction<any>;
  rewards_project_token?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProjectTokenInfoKeySpecifier = (
  | "image"
  | "name"
  | "symbol"
  | ProjectTokenInfoKeySpecifier
)[];
export type ProjectTokenInfoFieldPolicy = {
  image?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  symbol?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | "get_historical_ratio"
  | "health"
  | "investor_info"
  | "launchpad_project"
  | "launchpad_projects"
  | "nft_staking_projects"
  | "staking"
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  get_historical_ratio?: FieldPolicy<any> | FieldReadFunction<any>;
  health?: FieldPolicy<any> | FieldReadFunction<any>;
  investor_info?: FieldPolicy<any> | FieldReadFunction<any>;
  launchpad_project?: FieldPolicy<any> | FieldReadFunction<any>;
  launchpad_projects?: FieldPolicy<any> | FieldReadFunction<any>;
  nft_staking_projects?: FieldPolicy<any> | FieldReadFunction<any>;
  staking?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StakedNFTKeySpecifier = (
  | "collection_id"
  | "nft_id"
  | "owner_id"
  | "rewards_acova"
  | "rewards_jump"
  | "rewards_project_token"
  | "staked_timestamp"
  | StakedNFTKeySpecifier
)[];
export type StakedNFTFieldPolicy = {
  collection_id?: FieldPolicy<any> | FieldReadFunction<any>;
  nft_id?: FieldPolicy<any> | FieldReadFunction<any>;
  owner_id?: FieldPolicy<any> | FieldReadFunction<any>;
  rewards_acova?: FieldPolicy<any> | FieldReadFunction<any>;
  rewards_jump?: FieldPolicy<any> | FieldReadFunction<any>;
  rewards_project_token?: FieldPolicy<any> | FieldReadFunction<any>;
  staked_timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type XTokenRatioKeySpecifier = (
  | "base_token_amount"
  | "key_column"
  | "time_event"
  | "x_token_amount"
  | XTokenRatioKeySpecifier
)[];
export type XTokenRatioFieldPolicy = {
  base_token_amount?: FieldPolicy<any> | FieldReadFunction<any>;
  key_column?: FieldPolicy<any> | FieldReadFunction<any>;
  time_event?: FieldPolicy<any> | FieldReadFunction<any>;
  x_token_amount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StrictTypedTypePolicies = {
  CollectionMeta?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | CollectionMetaKeySpecifier
      | (() => undefined | CollectionMetaKeySpecifier);
    fields?: CollectionMetaFieldPolicy;
  };
  InvestorAllocation?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | InvestorAllocationKeySpecifier
      | (() => undefined | InvestorAllocationKeySpecifier);
    fields?: InvestorAllocationFieldPolicy;
  };
  LaunchpadInvestor?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | LaunchpadInvestorKeySpecifier
      | (() => undefined | LaunchpadInvestorKeySpecifier);
    fields?: LaunchpadInvestorFieldPolicy;
  };
  LaunchpadListing?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | LaunchpadListingKeySpecifier
      | (() => undefined | LaunchpadListingKeySpecifier);
    fields?: LaunchpadListingFieldPolicy;
  };
  LaunchpadPage?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | LaunchpadPageKeySpecifier
      | (() => undefined | LaunchpadPageKeySpecifier);
    fields?: LaunchpadPageFieldPolicy;
  };
  MessageOutput?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | MessageOutputKeySpecifier
      | (() => undefined | MessageOutputKeySpecifier);
    fields?: MessageOutputFieldPolicy;
  };
  NFTPage?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | NFTPageKeySpecifier
      | (() => undefined | NFTPageKeySpecifier);
    fields?: NFTPageFieldPolicy;
  };
  NFTStaking?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | NFTStakingKeySpecifier
      | (() => undefined | NFTStakingKeySpecifier);
    fields?: NFTStakingFieldPolicy;
  };
  NFTStakingTotalRewards?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | NFTStakingTotalRewardsKeySpecifier
      | (() => undefined | NFTStakingTotalRewardsKeySpecifier);
    fields?: NFTStakingTotalRewardsFieldPolicy;
  };
  ProjectTokenInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | ProjectTokenInfoKeySpecifier
      | (() => undefined | ProjectTokenInfoKeySpecifier);
    fields?: ProjectTokenInfoFieldPolicy;
  };
  Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | QueryKeySpecifier
      | (() => undefined | QueryKeySpecifier);
    fields?: QueryFieldPolicy;
  };
  StakedNFT?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | StakedNFTKeySpecifier
      | (() => undefined | StakedNFTKeySpecifier);
    fields?: StakedNFTFieldPolicy;
  };
  XTokenRatio?: Omit<TypePolicy, "fields" | "keyFields"> & {
    keyFields?:
      | false
      | XTokenRatioKeySpecifier
      | (() => undefined | XTokenRatioKeySpecifier);
    fields?: XTokenRatioFieldPolicy;
  };
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
