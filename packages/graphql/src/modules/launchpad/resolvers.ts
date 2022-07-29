import {
  AccountIdQuery,
  Allocation,
  GraphQLContext,
  LaunchpadFilters,
  LaunchpadListing,
  NFTInvestor,
  ProjectIdQuery,
} from "@/types";
import { findTokenMetadata } from "@/modules/tools";
import { QueryTypes } from "sequelize";
import { ImportantStatusFilters, queriesPerStatus } from "@/constants/statuses";
import { createPageableQuery } from "../tools/createPaginatedConnection";
import { ApolloError } from "apollo-server";

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
    async price_token_info({ price_token }: LaunchpadListing) {
      const { name, icon, symbol } = await findTokenMetadata(price_token);
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
        'select * from "allocations" where "account_id" = $1 and "listing_id" = $2',
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
        'select * from "launchpad_investors" where "account_id" = $1',
        {
          bind: [account_id],
          type: QueryTypes.SELECT,
        }
      );

      return result[0] || null;
    },

    async launchpad_project(
      _root: unknown,
      filters: ProjectIdQuery,
      { sequelize }: GraphQLContext
    ) {
      const result = await sequelize.query<NFTInvestor>(
        `SELECT * 
          FROM (SELECT * FROM "listings" WHERE listing_id = $1) AS l
          INNER JOIN "listings_metadata" m
            ON(l.listing_id = m.listing_id)`,
        {
          bind: [filters.project_id],
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
      let sqlQuery = filters.showMineOnly
        ? `
          SELECT * 
          FROM (SELECT * FROM "listings" WHERE account_id = $1) AS l
          INNER JOIN "listings_metadata" AS m ON(l.listing_id = m.listing_id)
          INNER JOIN "allocations" a ON(l.listing_id = a.listing_id)
        `
        : `SELECT * FROM "listings" AS l
        INNER JOIN "listings_metadata" AS m
        ON(l.listing_id = m.listing_id)`;

      if (
        filters.status &&
        ImportantStatusFilters.includes(filters.status as string)
      ) {
        sqlQuery +=
          (filters.showMineOnly ? " AND " : " WHERE ") +
          queriesPerStatus[filters.status];
      }

      return createPageableQuery(
        sqlQuery,
        sequelize,
        {
          limit: filters.limit,
          offset: filters.offset,
        },
        filters.showMineOnly ? [filters.showMineOnly] : []
      );
    },
  },
};
