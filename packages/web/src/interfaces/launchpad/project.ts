export interface investorAllocation {
  allocationsBought: string | undefined;
  totalTokensBought: string | undefined;
}

export interface launchpadProject {
  __typename?: "LaunchpadListing";
  listing_id: string;
  public: any;
  project_owner: string;
  project_token: string;
  price_token?: string | null;
  open_sale_1_timestamp?: string | null;
  open_sale_2_timestamp?: string | null;
  final_sale_2_timestamp?: string | null;
  liquidity_pool_timestamp?: string | null;
  total_amount_sale_project_tokens?: string | null;
  token_allocation_size?: string | null;
  token_allocation_price?: string | null;
  allocations_sold?: string | null;
  liquidity_pool_project_tokens?: string | null;
  liquidity_pool_price_tokens?: string | null;
  fraction_instant_release?: string | null;
  fraction_cliff_release?: string | null;
  cliff_timestamp?: string | null;
  end_cliff_timestamp?: string | null;
  fee_price_tokens?: string | null;
  fee_liquidity_tokens?: string | null;
  status?: string | null;
  project_name?: string | null;
  description_token?: string | null;
  description_project?: string | null;
  discord?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  website?: string | null;
  whitepaper?: string | null;
  dex_id?: string | null;
  project_token_info?: {
    __typename?: "ProjectTokenInfo";
    name?: string | null;
    image?: string | null;
    symbol?: string | null;
    decimals?: string | null;
  } | null;
  price_token_info?: {
    __typename?: "ProjectTokenInfo";
    name?: string | null;
    image?: string | null;
    symbol?: string | null;
    decimals?: string | null;
  } | null;
  allocation?: {
    __typename?: "InvestorAllocation";
    account_id: string;
    listing_id: string;
    quantity_withdrawn?: string | null;
    total_quantity?: string | null;
    total_allocation?: string | null;
  } | null;
}

export interface ProjectTokenInfo {
  __typename: string;
  name: string;
  image: string;
  symbol: string;
  decimals: string;
}

export interface PriceTokenInfo {
  __typename: string;
  name: string;
  image: string;
  symbol: string;
  decimals: string;
}
