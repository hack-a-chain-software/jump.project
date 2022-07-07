import { gql } from "apollo-server";

export default gql`
  # Blockchain Data
  type CollectionMeta {
    image: String
    name: String
  }

  type NFTStaking {
    # SQL + Blockchain Data
    collection: ID!
    collection_meta: CollectionMeta # On Chain Data
    collection_owner: String!
    collection_treasury: String!
    token_address: ID!
    farm: ID!
    min_staking_period: String
    early_withdraw_penalty: String

    # Queries
    storage_used(account_id: ID): NFTInvestor!
    total_rewards(account_id: ID): NFTStakingTotalRewards
    staked_nfts_by_owner(account_id: ID): [StakedNFT]
  }

  type NFTInvestor {
    account_id: ID
    storage_deposit: String
    storage_used: String
  }

  type NFTStakingTotalRewards {
    rewards_jump: String
    rewards_acova: String
    rewards_project_token: String
  }

  type StakedNFT {
    non_fungible_token_id: ID
    collection: ID
    owner_id: ID
    staked_timestamp: String
    rewards_jump: String
    rewards_acova: String
    rewards_project_token: String
  }

  type NFTPage {
    pageSize: Int
    totalCount: Int
    itemsPerPage: Int
    hasNextPage: Boolean
    data: [NFTStaking]
  }

  type Query {
    nft_staking_projects(limit: Int, offset: Int, search: String): NFTPage!
    staking(collection: ID!): NFTStaking
  }
`;
