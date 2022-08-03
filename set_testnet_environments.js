const fs = require("fs");
const sh = require("shelljs");

let contracts_data_raw = fs.readFileSync("testnet_settings/account_map.json");
let contracts_data = JSON.parse(contracts_data_raw);

// process.env["VITE_BASE_TOKEN"] = contracts_data.jumpTokenAccount;
// process.env["VITE_LOCKED_CONTRACT"] = contracts_data.lockedTokenAccount;
// process.env["VITE_STAKING_CONTRACT"] = contracts_data.xTokenAccount;
// process.env["VITE_NFT_STAKING_CONTRACT"] = contracts_data.nftStaking;
// process.env["VITE_JUMP_LAUNCHPAD_CONTRACT"] = contracts_data.launchpad;

const environement_file = `
VITE_BASE_TOKEN=${contracts_data.jumpTokenAccount}
VITE_LOCKED_CONTRACT=${contracts_data.lockedTokenAccount}
VITE_STAKING_CONTRACT=${contracts_data.xTokenAccount}
VITE_NFT_STAKING_CONTRACT=${contracts_data.nftStaking}
VITE_JUMP_LAUNCHPAD_CONTRACT=${contracts_data.launchpad}
`;

fs.writeFileSync("./packages/web/.env", environement_file);
