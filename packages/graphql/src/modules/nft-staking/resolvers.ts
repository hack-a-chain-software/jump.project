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
import BN from "bn.js";

export interface StakingToken {
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  perMonth: string;
  decimals: number;
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
      const { farm } = (await findStakingProgram(collection_id)) || {};

      const secondsPerMonth = 2592000;

      const interval = farm.round_interval;
      const distributions = farm.distributions;

      const stakingRewards: StakingToken[] = [];

      for (const key in distributions) {
        const metadata = await findTokenMetadata(key);

        const { reward } = distributions[key];

        const rewardBN = new BN(reward);
        const intervalBN = new BN(interval);
        const secondsPerMonthBN = new BN(secondsPerMonth);

        stakingRewards.push({
          ...metadata,
          account_id: key,
          perMonth: secondsPerMonthBN.mul(rewardBN).div(intervalBN).toString(),
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
        `SELECT * FROM "staking_programs" AS s INNER JOIN "staking_programs_metadata" AS m 
        ON (s.collection_id = m.collection_id) WHERE s.collection_id = $1 LIMIT 1`,
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
        `SELECT * FROM "staking_programs" AS s INNER JOIN "staking_programs_metadata" AS m 
        ON (s.collection_id = m.collection_id)`,
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
