import { CommonErrors } from "@/errors";
import { TimestampQuery, GraphQLContext } from "@/types";
import { XTokenRatio } from "../../types/x-token";
import { QueryTypes, DataTypes } from "sequelize";

export default {
  Query: {
    async get_historical_ratio(
      _root: unknown,
      filters: TimestampQuery,
      { sequelize }: GraphQLContext
    ) {
      const result = await sequelize.query<XTokenRatio>(
        `SELECT * FROM "x_token_ratios" 
        WHERE time_event <= $1
        ORDER BY time_event DESC
        LIMIT 1`,
        {
          bind: [
            new Date(parseInt(filters.timestamp))
              .toISOString()
              .replace("T", " ")
              .replace("Z", ""),
          ],
          type: QueryTypes.SELECT,
        }
      );

      return result[0] || null;
    },
  },
};
