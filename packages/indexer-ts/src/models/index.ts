import { Sequelize } from "sequelize";
import { initializeLaunchpad } from "./launchpad";
import { initializeNftStaking } from "./nftStaking";
import { initializeXToken } from "./xToken";

export function initializeModels(sequelize: Sequelize) {
  initializeLaunchpad(sequelize);
  initializeNftStaking(sequelize);
  initializeXToken(sequelize);
}
