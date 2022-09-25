"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeModels =
  exports.ProcessedEvent =
  exports.xTokenRatio =
  exports.StakedNft =
  exports.StakingProgramMetadata =
  exports.StakingProgram =
  exports.Allocation =
  exports.ListingMetadata =
  exports.Listing =
  exports.LaunchpadInvestor =
    void 0;
const launchpad_1 = require("./launchpad");
const nftStaking_1 = require("./nftStaking");
const xToken_1 = require("./xToken");
const internal_1 = require("./internal");
var launchpad_2 = require("./launchpad");
Object.defineProperty(exports, "LaunchpadInvestor", {
  enumerable: true,
  get: function () {
    return launchpad_2.LaunchpadInvestor;
  },
});
Object.defineProperty(exports, "Listing", {
  enumerable: true,
  get: function () {
    return launchpad_2.Listing;
  },
});
Object.defineProperty(exports, "ListingMetadata", {
  enumerable: true,
  get: function () {
    return launchpad_2.ListingMetadata;
  },
});
Object.defineProperty(exports, "Allocation", {
  enumerable: true,
  get: function () {
    return launchpad_2.Allocation;
  },
});
var nftStaking_2 = require("./nftStaking");
Object.defineProperty(exports, "StakingProgram", {
  enumerable: true,
  get: function () {
    return nftStaking_2.StakingProgram;
  },
});
Object.defineProperty(exports, "StakingProgramMetadata", {
  enumerable: true,
  get: function () {
    return nftStaking_2.StakingProgramMetadata;
  },
});
Object.defineProperty(exports, "StakedNft", {
  enumerable: true,
  get: function () {
    return nftStaking_2.StakedNft;
  },
});
var xToken_2 = require("./xToken");
Object.defineProperty(exports, "xTokenRatio", {
  enumerable: true,
  get: function () {
    return xToken_2.xTokenRatio;
  },
});
var internal_2 = require("./internal");
Object.defineProperty(exports, "ProcessedEvent", {
  enumerable: true,
  get: function () {
    return internal_2.ProcessedEvent;
  },
});
function initializeModels(sequelize) {
  (0, launchpad_1.initializeLaunchpad)(sequelize);
  (0, nftStaking_1.initializeNftStaking)(sequelize);
  (0, xToken_1.initializeXToken)(sequelize);
  (0, internal_1.initializeInternalTables)(sequelize);
}
exports.initializeModels = initializeModels;
