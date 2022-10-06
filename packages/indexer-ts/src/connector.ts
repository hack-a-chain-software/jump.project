import { Sequelize } from "sequelize";
import { initializeModels } from "./models";
import { DB_NAME, DB_USER, DB_PASS, DB_HOST } from "./env";

export async function sequelizeConnect(): Promise<Sequelize> {
  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: "postgres",
  });

  await sequelize.authenticate();
  console.log("Connection has been established successfully.");

  initializeModels(sequelize);

  return sequelize;
}
