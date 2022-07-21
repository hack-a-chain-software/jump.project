import { CommonErrors } from "@/errors";
import { AccountIdQuery, GraphQLContext } from "@/types";
import { NFTStaking, StakedNFT } from "@/types/nft-staking";
import { QueryTypes } from "sequelize";
import { findCollectionMetadata } from "../tools";
import {
  createPageableQuery,
  PaginationFilters,
} from "../tools/createPaginatedConnection";

export default {
  NFTStaking: {
    async collection_meta({ collection_id }: NFTStaking) {
      const { name, icon } = await findCollectionMetadata(collection_id);
      return {
        name,
        image: icon,
      };
    },
    async storage_used(
      _root: NFTStaking,
      { account_id }: AccountIdQuery,
      { sequelize }: GraphQLContext
    ) {
      const result = await sequelize.query(
        'select * from "nft_investors" where "account_id" = $1;',
        {
          bind: [account_id],
          type: QueryTypes.SELECT,
        }
      );

      if (!result[0]) throw new CommonErrors.NotFound();

      return result[0];
    },
    async total_rewards(
      { collection_id }: NFTStaking,
      { account_id }: AccountIdQuery,
      { sequelize }: GraphQLContext
    ) {
      return (
        await sequelize.query<StakedNFT>(
          'select * from "staked_nfts" where "owner_id" = $1 and "collection_id" = $2',
          {
            bind: [account_id, collection_id],
            type: QueryTypes.SELECT,
          }
        )
      ).reduce(
        (prev, cur): any => {
          return {
            rewards_jump: prev.rewards_jump + Number(cur.balances[0] || 0),
            rewards_acova: prev.rewards_jump + Number(cur.balances[1] || 0),
            rewards_project_token:
              prev.rewards_jump + Number(cur.balances[1] || 0),
          };
        },
        {
          rewards_jump: 0,
          rewards_acova: 0,
          rewards_project_token: 0,
        }
      );
    },
    async staked_nfts_by_owner(
      { collection_id }: NFTStaking,
      { account_id }: AccountIdQuery,
      { sequelize }: GraphQLContext
    ) {
      const result = await sequelize.query(
        'select * from "staked_nfts" where "owner_id" = $1 and "collection_id" = $2',
        {
          bind: [account_id, collection_id],
          type: QueryTypes.SELECT,
        }
      );

      return result;
    },
  },
  Query: {
    async staking(
      _root: unknown,
      { collection_id }: { collection_id: string },
      { sequelize }: GraphQLContext
    ) {
      const result = await sequelize.query<NFTStaking>(
        'select * from "staking_programs" where "collection_id" = $1 limit 1;',
        {
          bind: [collection_id],
          type: QueryTypes.SELECT,
        }
      );

      if (!result[0]) throw new CommonErrors.NotFound();

      return result[0];
    },
    async nft_staking_projects(
      _root: unknown,
      { limit, offset }: PaginationFilters & { search: string },
      { sequelize }: GraphQLContext
    ) {
      return createPageableQuery(
        'select * from "staking_programs"',
        sequelize,
        {
          limit,
          offset,
        }
      );
    },
  },
};
