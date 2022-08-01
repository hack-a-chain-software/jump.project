export const EnvVariables = {
  port: 4000,
  nft_staking: "5ec2c039c2ad584fbd081ecc3f0c46475c314a00nft_staking.testnet",
  rpcURL:
    process.env.ENV === "MAINNET"
      ? "https://rpc.mainnet.near.org"
      : "https://rpc.testnet.near.org",
};
