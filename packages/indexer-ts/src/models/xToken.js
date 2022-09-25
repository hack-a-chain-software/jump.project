"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeXToken = exports.xTokenRatio = void 0;
const sequelize_1 = require("sequelize");
class xTokenRatio extends sequelize_1.Model {}
exports.xTokenRatio = xTokenRatio;
function initializeXToken(sequelize) {
  xTokenRatio.init(
    {
      key_column: {
        type: sequelize_1.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      time_event: {
        type: sequelize_1.DataTypes.DATE,
      },
      base_token_amount: {
        type: sequelize_1.DataTypes.DECIMAL(40),
      },
      x_token_amount: {
        type: sequelize_1.DataTypes.DECIMAL(40),
      },
    },
    {
      tableName: "x_token_ratios",
      sequelize,
      timestamps: false,
    }
  );
}
exports.initializeXToken = initializeXToken;
