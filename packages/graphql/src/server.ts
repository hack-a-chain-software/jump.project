import { ApolloServer } from "apollo-server";
import { Sequelize } from "sequelize";
import { EnvVariables } from "./env";
import { Global, Launchpad, NFTStaking } from "./modules";

// TODO: Remove this and pass it to the env later on
const sequelize = new Sequelize({
  dialect: "postgres",
  username: "postgres",
  password: "JDX-secret_password-1683413286",
  database: "jump_testnet",
  host: "postgres-jump-testnet.c8fvx3d5adgx.us-east-1.rds.amazonaws.com",
  port: 5432,
});

const app = new ApolloServer({
  resolvers: [Global.Resolvers, Launchpad.Resolvers, NFTStaking.Resolvers],
  typeDefs: [Global.Types, Launchpad.Types, NFTStaking.Types],
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
    const serverInfo = await app.listen(EnvVariables.port);
    console.log(
      `GraphQL running on ${serverInfo.port} at the current url ${serverInfo.url} ✅`
    );
  } catch (error) {
    console.error("The Server Crashed check here the logs", error);
  }
}

main();
