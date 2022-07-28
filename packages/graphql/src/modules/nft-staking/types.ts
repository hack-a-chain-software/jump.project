import { gql } from "apollo-server";

export default gql`
  # Blockchain Data
  type CollectionMeta {
    image: String
    name: String
  }

  # Blockchain Data
  type StakedMeta @cacheControl(maxAge: 120, scope: PUBLIC) {
    title: String
    media: String
    description: String
  }

  type NFTStaking {
    # SQL + Blockchain Data
    collection_id: ID!
    collection_meta: CollectionMeta # On Chain Data
    collection_owner_id: String!
    token_address: ID!
    min_staking_period: String
    early_withdraw_penalty: String

    # Queries
    total_rewards(account_id: ID): NFTStakingTotalRewards
    staked_nfts_by_owner(account_id: ID): [StakedNFT]
  }

  type NFTStakingTotalRewards {
    rewards_jump: String
    rewards_acova: String
    rewards_project_token: String
  }

  type StakedNFT {
    nft_id: ID
    collection_id: ID
    owner_id: ID
    staked_timestamp: String
    rewards_jump: String
    rewards_acova: String
    rewards_project_token: String
    staked_meta: StakedMeta # On Chain Data
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
    staking(collection_id: ID!): NFTStaking
  }
`;
