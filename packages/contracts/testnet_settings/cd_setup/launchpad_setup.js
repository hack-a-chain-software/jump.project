const nearAPI = require("near-api-js");
const { BN, KeyPair } = require("near-workspaces");
const fs = require("fs");
const crypto = require("crypto");

const {
  connect,
  keyStores,
  accountCreator: { UrlAccountCreator },
} = nearAPI;

const { registerContracts, deployToken, deployNft } = require("./utils");

async function launchpadSetup(execution_data) {}

module.exports = { launchpadSetup };
