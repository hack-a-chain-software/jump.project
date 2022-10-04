import { Sequelize } from "sequelize";
import { initializeModels } from "./models";

export async function sequelizeConnect(): Promise<Sequelize> {
  const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "postgres",
  });

  await sequelize.authenticate();
  console.log("Connection has been established successfully.");

  initializeModels(sequelize);

  return sequelize;
}
