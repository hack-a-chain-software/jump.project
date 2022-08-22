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
import {
  ImportantStatusFilters,
  ListingStatuses,
  queriesPerStatus,
} from "@/constants/statuses";
import { createPageableQuery } from "../tools/createPaginatedConnection";

export default {
  LaunchpadListing: {
    async project_token_info({ project_token }: LaunchpadListing) {
      const { name, icon, symbol, decimals } = await findTokenMetadata(
        project_token
      );
      return {
        name,
        image: icon,
        symbol,
        decimals,
      };
    },
    async price_token_info({ price_token }: LaunchpadListing) {
      const { name, icon, symbol, decimals } = await findTokenMetadata(
        price_token
      );
      return {
        name,
        image: icon,
        symbol,
        decimals,
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
      type FiltersMap = {
        [K in keyof LaunchpadFilters]?: {
          active: boolean;
          joinClause?: string;
          whereClause?: string;
        };
      };

      const filtersMap: FiltersMap = {
        status: {
          active: !!(
            filters.status && ImportantStatusFilters.includes(filters.status)
          ),
          whereClause: filters.status ? queriesPerStatus[filters.status] : "",
        },
        showMineOnly: {
          active: !!filters.showMineOnly,
          joinClause:
            'INNER JOIN "allocations" AS a ON(l.listing_id = a.listing_id)',
        },
        visibility: {
          active: !!filters.visibility,
          whereClause:
            filters.visibility == "public"
              ? "l.public = true"
              : "l.public = false",
        },
      };

      const baseQuery =
        'SELECT * FROM "listings" AS l INNER JOIN "listings_metadata" AS m ON(l.listing_id = m.listing_id)';

      const joinClauseStatements = Object.values(filtersMap)
        .filter((v) => v.active && v.joinClause)
        .map((v) => v.joinClause);

      const whereClauseStatements = Object.values(filtersMap)
        .filter((v) => v.active && v.whereClause)
        .map((v) => v.whereClause);

      const joinClause = joinClauseStatements.length
        ? joinClauseStatements.join(" ")
        : "";
      const whereClause = whereClauseStatements.length
        ? `WHERE ${whereClauseStatements.join(" AND")}`
        : "";

      const finalQuery = [baseQuery, joinClause, whereClause]
        .filter((clause) => clause.length)
        .join(" ");

      return createPageableQuery(
        finalQuery,
        sequelize,
        {
          limit: filters.limit,
          offset: filters.offset,
        },
        []
      );
    },
  },
};
