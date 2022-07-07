import {
  AccountIdQuery,
  Allocation,
  GraphQLContext,
  LaunchpadFilters,
  LaunchpadListing,
  NFTInvestor,
} from "@/types";
import { findTokenMetadata } from "@/modules/tools";
import { QueryTypes } from "sequelize";
import { ImportantStatusFilters, queriesPerStatus } from "@/constants/statuses";
import { createPageableQuery } from "../tools/createPaginatedConnection";

export default {
  LaunchpadListing: {
    async project_token_info({ project_token }: LaunchpadListing) {
      const { name, icon, symbol } = await findTokenMetadata(project_token);
      return {
        name,
        image: icon,
        symbol,
      };
    },
    async allocation(
      { listing_id }: LaunchpadListing,
      { account_id }: AccountIdQuery,
      { sequelize }: GraphQLContext
    ) {
      const result = await sequelize.query<Allocation>(
        'select * from "allocation" where "account_id" = $1 and "listing_id" = $2',
        {
          bind: [account_id, listing_id],
          type: QueryTypes.SELECT,
        }
      );

      return result[0] || null;
    },
  },
  Query: {
    async investor_info(
      _root: unknown,
      { account_id }: AccountIdQuery,
      { sequelize }: GraphQLContext
    ) {
      const result = await sequelize.query<NFTInvestor>(
        'select * from "launchpad_investor" where "account_id" = $1',
        {
          bind: [account_id],
          type: QueryTypes.SELECT,
        }
      );

      return result[0] || null;
    },

    async launchpad_projects(
      _root: unknown,
      filters: Partial<LaunchpadFilters>,
      { sequelize }: GraphQLContext
    ) {
      let sqlQuery = filters.showForAccountId
        ? `
          SELECT l.* FROM "listing" l
            INNER JOIN "allocation" a (account_id = a.account)
          WHERE account_id = :account_id
        `
        : `SELECT * FROM "listing"`;

      if (
        filters.status &&
        ImportantStatusFilters.includes(filters.status as string)
      ) {
        sqlQuery +=
          (filters.showForAccountId ? " AND " : " WHERE ") +
          queriesPerStatus[filters.status];
      }

      return createPageableQuery(
        sqlQuery,
        sequelize,
        {
          limit: filters.limit,
          offset: filters.offset,
        },
        filters.showForAccountId
          ? { account_id: filters.showForAccountId, timestamp: Date.now() }
          : { timestamp: Date.now() }
      );
    },
  },
};
