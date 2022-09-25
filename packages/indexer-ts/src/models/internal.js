"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeInternalTables = exports.ProcessedEvent = void 0;
const sequelize_1 = require("sequelize");
class ProcessedEvent extends sequelize_1.Model {}
exports.ProcessedEvent = ProcessedEvent;
function initializeInternalTables(sequelize) {
  ProcessedEvent.init(
    {
      block_height: {
        type: sequelize_1.DataTypes.DECIMAL(21),
        primaryKey: true,
      },
      transaction_hash: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      event_index: {
        type: sequelize_1.DataTypes.DECIMAL(21),
        primaryKey: true,
      },
    },
    {
      tableName: "processed_events",
      sequelize,
      timestamps: false,
    }
  );
}
exports.initializeInternalTables = initializeInternalTables;
