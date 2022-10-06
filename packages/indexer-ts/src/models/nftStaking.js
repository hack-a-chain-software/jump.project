"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeNftStaking =
  exports.StakedNft =
  exports.StakingProgramMetadata =
  exports.StakingProgram =
    void 0;
const sequelize_1 = require("sequelize");
class StakingProgram extends sequelize_1.Model {}
exports.StakingProgram = StakingProgram;
class StakingProgramMetadata extends sequelize_1.Model {}
exports.StakingProgramMetadata = StakingProgramMetadata;
class StakedNft extends sequelize_1.Model {}
exports.StakedNft = StakedNft;
function initializeNftStaking(sequelize) {
  StakingProgram.init(
    {
      collection_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      collection_owner_id: {
        type: sequelize_1.DataTypes.TEXT,
      },
      token_address: {
        type: sequelize_1.DataTypes.TEXT,
      },
      min_staking_period: {
        type: sequelize_1.DataTypes.TEXT,
      },
      early_withdraw_penalty: {
        type: sequelize_1.DataTypes.TEXT,
      },
      round_interval: {
        type: sequelize_1.DataTypes.TEXT,
      },
    },
    {
      tableName: "staking_programs",
      sequelize,
    }
  );
  StakingProgramMetadata.init(
    {
      collection_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      collection_image: {
        type: sequelize_1.DataTypes.TEXT,
      },
      collection_modal_image: {
        type: sequelize_1.DataTypes.TEXT,
      },
    },
    {
      tableName: "staking_programs_metadata",
      sequelize,
    }
  );
  StakingProgram.hasOne(StakingProgramMetadata, {
    foreignKey: {
      name: "collection_id",
    },
  });
  StakingProgramMetadata.belongsTo(StakingProgram);
  StakedNft.init(
    {
      nft_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      collection_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      owner_id: {
        type: sequelize_1.DataTypes.TEXT,
      },
      staked_timestamp: {
        type: "TIMESTAMPTZ",
      },
    },
    {
      tableName: "staking_programs_metadata",
      sequelize,
    }
  );
  StakingProgram.hasMany(StakedNft, {
    foreignKey: {
      name: "collection_id",
    },
  });
  StakedNft.belongsTo(StakingProgram);
}
exports.initializeNftStaking = initializeNftStaking;
