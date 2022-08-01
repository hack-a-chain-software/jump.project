export const EnvVariables = {
  port: 4000,
  nft_staking: "7fec8a62ebe7ca51e65ec105dd11110e364ed059nft_staking.testnet",
  rpcURL:
    process.env.ENV === "MAINNET"
      ? "https://rpc.mainnet.near.org"
      : "https://rpc.testnet.near.org",
};
