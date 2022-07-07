export const EnvVariables = {
  port: 4000,
  rpcURL:
    process.env.ENV === "MAINNET"
      ? "https://rpc.mainnet.near.org"
      : "https://rpc.testnet.near.org",
};
