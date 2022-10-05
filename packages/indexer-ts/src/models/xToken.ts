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

export class xTokenRatio extends Model<
  InferAttributes<xTokenRatio>,
  InferCreationAttributes<xTokenRatio>
> {
  declare key_column: number;
  declare time_event: string;
  declare base_token_amount: string;
  declare x_token_amount: string;
}

export function initializeXToken(sequelize: Sequelize) {
  xTokenRatio.init(
    {
      key_column: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      time_event: {
        type: "TIMESTAMPTZ",
      },
      base_token_amount: {
        type: DataTypes.TEXT,
      },
      x_token_amount: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "x_token_ratios",
      sequelize,
    }
  );
}
