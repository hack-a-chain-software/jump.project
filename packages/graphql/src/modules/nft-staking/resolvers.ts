import { CommonErrors } from "@/errors";
import { GraphQLContext } from "@/types";
import { NFTStaking } from "@/types/nft-staking";
import { QueryTypes } from "sequelize";
import {
  findCollectionMetadata,
  findStakingProgram,
  findTokenMetadata,
} from "../tools";
import {
  createPageableQuery,
  PaginationFilters,
} from "../tools/createPaginatedConnection";

export interface StakingToken {
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  perMonth: number;
  account_id: string;
}

export default {
  NFTStaking: {
    async collection_meta({ collection_id }: NFTStaking) {
      const { name, icon } = await findCollectionMetadata(collection_id);
      return {
        name,
        image: icon,
      };
    },
    async rewards({ collection_id }: NFTStaking) {
      const { farm } = await findStakingProgram(collection_id);

      const secondsPerMonth = 2592000;

      const interval = farm.round_interval;
      const distributions = farm.distributions;

      const stakingRewards: StakingToken[] = [];

      for (const key in distributions) {
        const metadata = await findTokenMetadata(key);

        const { reward } = distributions[key];

        stakingRewards.push({
          ...metadata,
          account_id: key,
          perMonth: (secondsPerMonth * Number(reward)) / Number(interval),
        });
      }

      return stakingRewards.sort((a, b) => a.symbol.localeCompare(b.symbol));
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
        },
        []
      );
    },
  },
};
