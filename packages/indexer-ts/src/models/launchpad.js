"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeLaunchpad =
  exports.Allocation =
  exports.ListingMetadata =
  exports.Listing =
  exports.LaunchpadInvestor =
    void 0;
const sequelize_1 = require("sequelize");
class LaunchpadInvestor extends sequelize_1.Model {}
exports.LaunchpadInvestor = LaunchpadInvestor;
class Listing extends sequelize_1.Model {}
exports.Listing = Listing;
class ListingMetadata extends sequelize_1.Model {}
exports.ListingMetadata = ListingMetadata;
class Allocation extends sequelize_1.Model {}
exports.Allocation = Allocation;
function initializeLaunchpad(sequelize) {
  LaunchpadInvestor.init(
    {
      account_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      staked_token: {
        type: sequelize_1.DataTypes.TEXT,
      },
      last_check: {
        type: "TIMESTAMPTZ",
      },
    },
    {
      tableName: "launchpad_investors",
      sequelize,
    }
  );
  const statusEnum = [
    "unfunded",
    "funded",
    "sale_finalized",
    "pool_created",
    "pool_project_token_sent",
    "pool_price_token_sent",
    "liquidity_pool_finalized",
    "cancelled",
  ];
  Listing.init(
    {
      listing_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      public: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
      },
      listing_status: {
        type: sequelize_1.DataTypes.ENUM(...statusEnum),
      },
      project_owner: {
        type: sequelize_1.DataTypes.TEXT,
      },
      project_token: {
        type: sequelize_1.DataTypes.TEXT,
      },
      price_token: {
        type: sequelize_1.DataTypes.TEXT,
      },
      open_sale_1_timestamp: {
        type: "TIMESTAMPTZ",
      },
      open_sale_2_timestamp: {
        type: "TIMESTAMPTZ",
      },
      final_sale_2_timestamp: {
        type: "TIMESTAMPTZ",
      },
      liquidity_pool_timestamp: {
        type: "TIMESTAMPTZ",
      },
      total_amount_sale_project_tokens: {
        type: sequelize_1.DataTypes.TEXT,
      },
      token_allocation_size: {
        type: sequelize_1.DataTypes.TEXT,
      },
      token_allocation_price: {
        type: sequelize_1.DataTypes.TEXT,
      },
      allocations_sold: {
        type: sequelize_1.DataTypes.TEXT,
      },
      liquidity_pool_project_tokens: {
        type: sequelize_1.DataTypes.TEXT,
      },
      liquidity_pool_price_tokens: {
        type: sequelize_1.DataTypes.TEXT,
      },
      fraction_instant_release: {
        type: sequelize_1.DataTypes.TEXT,
      },
      fraction_cliff_release: {
        type: sequelize_1.DataTypes.TEXT,
      },
      cliff_timestamp: {
        type: sequelize_1.DataTypes.TEXT,
      },
      end_cliff_timestamp: {
        type: sequelize_1.DataTypes.TEXT,
      },
      fee_price_tokens: {
        type: sequelize_1.DataTypes.TEXT,
      },
      fee_liquidity_tokens: {
        type: sequelize_1.DataTypes.TEXT,
      },
      dex_id: {
        type: sequelize_1.DataTypes.TEXT,
      },
    },
    {
      tableName: "listings",
      sequelize,
    }
  );
  ListingMetadata.init(
    {
      listing_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      project_name: {
        type: sequelize_1.DataTypes.TEXT,
      },
      description_token: {
        type: sequelize_1.DataTypes.TEXT,
      },
      description_project: {
        type: sequelize_1.DataTypes.TEXT,
      },
      discord: {
        type: sequelize_1.DataTypes.TEXT,
      },
      twitter: {
        type: sequelize_1.DataTypes.TEXT,
      },
      telegram: {
        type: sequelize_1.DataTypes.TEXT,
      },
      website: {
        type: sequelize_1.DataTypes.TEXT,
      },
      whitepaper: {
        type: sequelize_1.DataTypes.TEXT,
      },
    },
    {
      tableName: "listings_metadata",
      sequelize,
    }
  );
  Listing.hasOne(ListingMetadata, {
    foreignKey: {
      name: "listing_id",
    },
  });
  ListingMetadata.belongsTo(Listing);
  Allocation.init(
    {
      account_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      listing_id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
      },
      quantity_withdrawn: {
        type: sequelize_1.DataTypes.TEXT,
      },
      total_quantity: {
        type: sequelize_1.DataTypes.TEXT,
      },
      total_allocation: {
        type: sequelize_1.DataTypes.TEXT,
      },
    },
    {
      tableName: "allocations",
      sequelize,
    }
  );
  Listing.hasMany(Allocation, {
    foreignKey: {
      name: "listing_id",
    },
  });
  Allocation.belongsTo(Listing);
}
exports.initializeLaunchpad = initializeLaunchpad;
