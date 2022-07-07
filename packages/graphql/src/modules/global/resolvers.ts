import { GraphQLContext } from "@/types";

export default {
  Query: {
    health: async (_root: any, _args: any, context: GraphQLContext) => {
      try {
        return {
          message: "Up and running",
        };
      } catch (error) {
        throw new Error("Something failed: " + (error as Error)?.message);
      }
    },
  },
};
