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
        type: sequelize_1.DataTypes.DECIMAL(21),
      },
      early_withdraw_penalty: {
        type: sequelize_1.DataTypes.DECIMAL(40),
      },
      round_interval: {
        type: sequelize_1.DataTypes.DECIMAL(21),
      },
    },
    {
      tableName: "staking_programs",
      sequelize,
      timestamps: false,
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
      timestamps: false,
    }
  );
  StakingProgramMetadata.belongsTo(StakingProgram, {
    foreignKey: {
      name: "collection_id",
    },
  });
  StakingProgram.hasOne(StakingProgramMetadata, {
    foreignKey: {
      name: "collection_id",
    },
  });
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
        type: sequelize_1.DataTypes.DATE,
      },
    },
    {
      tableName: "staked_nfts",
      sequelize,
      timestamps: false,
    }
  );
  StakedNft.belongsTo(StakingProgram, {
    foreignKey: {
      name: "collection_id",
    },
  });
  StakingProgram.hasMany(StakedNft, {
    foreignKey: {
      name: "collection_id",
    },
  });
}
exports.initializeNftStaking = initializeNftStaking;
