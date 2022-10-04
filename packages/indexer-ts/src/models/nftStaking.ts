import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Optional,
  Sequelize,
  NonAttribute,
  ForeignKey,
} from "sequelize";

export function initializeNftStaking(sequelize: Sequelize) {
  class StakingProgram extends Model<
    InferAttributes<StakingProgram>,
    InferCreationAttributes<StakingProgram>
  > {
    declare collection_id: string;
    declare collection_owner_id: string;
    declare token_address: string;
    declare min_staking_period: string;
    declare early_withdraw_penalty: string;
    declare round_interval: string;
  }

  StakingProgram.init(
    {
      collection_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      collection_owner_id: {
        type: DataTypes.TEXT,
      },
      token_address: {
        type: DataTypes.TEXT,
      },
      min_staking_period: {
        type: DataTypes.TEXT,
      },
      early_withdraw_penalty: {
        type: DataTypes.TEXT,
      },
      round_interval: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "staking_programs",
      sequelize,
    }
  );

  class StakingProgramMetadata extends Model<
    InferAttributes<StakingProgramMetadata>,
    InferCreationAttributes<StakingProgramMetadata>
  > {
    declare collection_id: ForeignKey<StakingProgram["collection_id"]>;
    declare collection_image: string;
    declare collection_modal_image: string;
  }

  StakingProgramMetadata.init(
    {
      collection_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      collection_image: {
        type: DataTypes.TEXT,
      },
      collection_modal_image: {
        type: DataTypes.TEXT,
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

  class StakedNft extends Model<
    InferAttributes<StakedNft>,
    InferCreationAttributes<StakedNft>
  > {
    declare nft_id: string;
    declare collection_id: ForeignKey<StakingProgram["collection_id"]>;
    declare owner_id: string;
    declare staked_timestamp: Date;
  }

  StakedNft.init(
    {
      nft_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      collection_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      owner_id: {
        type: DataTypes.TEXT,
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
