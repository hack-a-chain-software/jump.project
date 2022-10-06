"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeModels =
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
function initializeModels(sequelize) {
  (0, launchpad_1.initializeLaunchpad)(sequelize);
  (0, nftStaking_1.initializeNftStaking)(sequelize);
  (0, xToken_1.initializeXToken)(sequelize);
}
exports.initializeModels = initializeModels;
