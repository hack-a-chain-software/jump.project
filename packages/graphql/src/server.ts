import { ApolloServer } from "apollo-server";
import { Sequelize } from "sequelize";
import { Global, Launchpad, NFTStaking, XToken } from "./modules";

require("dotenv").config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
} as any);

const app = new ApolloServer({
  resolvers: [
    Global.Resolvers,
    Launchpad.Resolvers,
    NFTStaking.Resolvers,
    XToken.Resolvers,
  ],
  typeDefs: [Global.Types, Launchpad.Types, NFTStaking.Types, XToken.Types],
  context: (context) => {
    // TODO: Add Auth Layer
    return {
      expressContext: context,
      sequelize,
    };
  },
});

async function main(): Promise<void> {
  try {
    console.log(
      "Running the GraphQL Server with the following ENV for NEAR = " +
        process.env.ENV
    );
    console.log("Checking Database Connection ☢️");
    await sequelize.authenticate();
    console.log("Database Authenticated ✅");
    const serverInfo = await app.listen(process.env.SERVE_PORT);
    console.log(
      `GraphQL running on ${serverInfo.port} at the current url ${serverInfo.url} ✅`
    );
  } catch (error) {
    console.error("The Server Crashed check here the logs", error);
  }
}

main();
