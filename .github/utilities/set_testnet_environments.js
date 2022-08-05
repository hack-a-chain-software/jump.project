const fs = require("fs");

let contracts_data;
try {
  let contracts_data_raw = fs.readFileSync("testnet_settings/account_map.json");
  contracts_data = JSON.parse(contracts_data_raw);
} catch (err) {
  contracts_data = {
    ownerAccount: "b4b4d9fbc16727eec5af1b84482d8da87c928ffcowner.testnet",
    userSampleAccount: "b4b4d9fbc16727eec5af1b84482d8da87c928ffcuser.testnet",
    jumpTokenAccount:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcjump_token.testnet",
    auroraTokenAccount:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcaurora_token.testnet",
    octopusTokenAccount:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcoctopus_token.testnet",
    skywardTokenAccount:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcskyward_token.testnet",
    usdtTokenAccount:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcusdt_token.testnet",
    xTokenAccount:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcxjump_token.testnet",
    lockedTokenAccount:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffclocked_token.testnet",
    nftCollection1Account:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcnft1.testnet",
    nftCollection2Account:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcnft2.testnet",
    nftCollection3Account:
      "b4b4d9fbc16727eec5af1b84482d8da87c928ffcnft3.testnet",
    nftStaking: "b4b4d9fbc16727eec5af1b84482d8da87c928ffcnft_staking.testnet",
    launchpad: "b4b4d9fbc16727eec5af1b84482d8da87c928ffclaunchpad.testnet",
  };
}

const environment_file = `
VITE_BASE_TOKEN=${contracts_data.jumpTokenAccount}
VITE_LOCKED_CONTRACT=${contracts_data.lockedTokenAccount}
VITE_STAKING_CONTRACT=${contracts_data.xTokenAccount}
VITE_NFT_STAKING_CONTRACT=${contracts_data.nftStaking}
VITE_JUMP_LAUNCHPAD_CONTRACT=${contracts_data.launchpad}
`;

fs.writeFileSync("./packages/web/.env", environment_file);
