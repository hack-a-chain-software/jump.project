import { config } from "dotenv";

config();

export const EnvVariables = {
  db_host: process.env.DB_HOST || "",
  db_port: process.env.DB_PORT || 5432,
  db_password: process.env.DB_PASSWORD || "",
  db_name: process.env.DB_NAME || "jdx_dev_db",
  server_port: process.env.SERVER_PORT || 4000,
  db_dialect: process.env.DB_DIALECT || "postgres",
  db_username: process.env.DB_USERNAME || "postgres",
  rpc_url: process.env.NEAR_RPC_URL || "https://rpc.testnet.near.org",
};
