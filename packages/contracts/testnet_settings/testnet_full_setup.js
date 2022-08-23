const nearAPI = require("near-api-js");
const { homedir } = require("os");
const { BN, KeyPair } = require("near-workspaces");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const {
  connect,
  keyStores,
  utils: {
    format: { formatNearAmount, parseNearAmount },
  },
} = nearAPI;

// ensure all tokens get a listing
// ensure all nft contracts get a staking program
// staking programs gie out locked jump
// setup locked jump correctly

async function testnetSetup() {
  // set connection
  const CREDENTIALS_DIR = "./.near-credentials";
  const keyStore = new keyStores.UnencryptedFileSystemKeyStore(CREDENTIALS_DIR);

  const config = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
    deps: { keyStore },
  };

  const near = await connect(config);

  let last_block = await near.connection.provider.block({ finality: "final" });
  let last_block_height = last_block.header.height;

  const random_prefix = crypto.randomBytes(10).toString("hex");
  const accountMap = {
    prefix: random_prefix,
    ownerAccount: random_prefix + "owner.testnet",
    userSampleAccount: random_prefix + "user.testnet",
    jumpTokenAccount: random_prefix + "jump_token.testnet",
    auroraTokenAccount: random_prefix + "aurora_token.testnet",
    octopusTokenAccount: random_prefix + "octopus_token.testnet",
    skywardTokenAccount: random_prefix + "skyward_token.testnet",
    usdtTokenAccount: random_prefix + "usdt_token.testnet",
    xTokenAccount: random_prefix + "xjump_token.testnet",
    lockedTokenAccount: random_prefix + "locked_token.testnet",
    nftCollection1Account: random_prefix + "nft1.testnet",
    nftCollection2Account: random_prefix + "nft2.testnet",
    nftCollection3Account: random_prefix + "nft3.testnet",
    nftStaking: random_prefix + "nft_staking.testnet",
    launchpad: random_prefix + "launchpad.testnet",
    last_block_height: last_block_height,
  };

  const storeData = (data, path) => {
    try {
      fs.writeFileSync(path, JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };
  storeData(accountMap, "./account_map.json");

  const {
    accountCreator: { UrlAccountCreator },
  } = nearAPI;

  const accountCreator = new UrlAccountCreator(near, config.helperUrl);

  async function createAccount(account_id) {
    const keyPair = KeyPair.fromRandom("ed25519");
    const publicKey = keyPair.publicKey;
    await keyStore.setKey(config.networkId, account_id, keyPair);
    await accountCreator.createAccount(account_id, publicKey);
    return await near.account(account_id);
  }

  console.log("create account", 1);
  const ownerAccount = await createAccount(accountMap.ownerAccount);
  console.log("create account", 2);
  const userSampleAccount = await createAccount(accountMap.userSampleAccount);

  // deploy tokens for testing
  const token_contract = fs.readFileSync("../out/token_contract.wasm");

  console.log("create account", 3);
  const jumpTokenAccount = await createAccount(accountMap.jumpTokenAccount);
  await jumpTokenAccount.deployContract(token_contract);
  await jumpTokenAccount.functionCall({
    contractId: jumpTokenAccount.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      total_supply: "1000000000000000000000000000",
      metadata: {
        spec: "ft-1.0.0",
        name: "Jump",
        symbol: "JUMP",
        icon: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg id='Layer_2' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 590 590.14'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' x1='99.48' y1='490.31' x2='495.26' y2='94.53' gradientTransform='matrix(1, 0, 0, 1, 0, 0)' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='.03' stop-color='%23392b42'/%3E%3Cstop offset='1' stop-color='%236e3b86'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath class='cls-1' d='M320.62,28.06c.62-4.84,5.02-8.25,9.88-7.63,33.88,4.35,66.3,14.83,96.35,31.15,4.29,2.33,5.87,7.69,3.55,11.97-1.52,2.8-4.33,4.45-7.29,4.6-1.58,.08-3.19-.25-4.68-1.06-28.13-15.28-58.47-25.09-90.18-29.16-4.83-.62-8.25-5.04-7.63-9.88Zm-120.71,25.32c.9-.05,1.8-.23,2.68-.57,25.07-9.57,51.5-15.15,78.56-16.6,4.87-.26,8.6-4.42,8.34-9.29-.26-4.87-4.42-8.6-9.29-8.34-28.89,1.55-57.12,7.51-83.91,17.74-4.55,1.73-6.84,6.84-5.1,11.39,1.4,3.67,4.99,5.87,8.72,5.67Zm249.14,28.46c13.96,8.9,27.11,19.16,39.07,30.51,3.54,3.36,9.12,3.21,12.48-.33,3.36-3.53,3.22-9.13-.33-12.48-12.78-12.12-26.82-23.09-41.74-32.59-4.11-2.62-9.57-1.41-12.19,2.7-1.62,2.55-1.77,5.62-.67,8.22,.67,1.58,1.82,2.98,3.37,3.97Zm-144.14-4.07c47.94,2.13,94.53,20.52,131.17,51.8,1.79,1.53,4.02,2.22,6.2,2.1,2.33-.12,4.61-1.17,6.24-3.09,3.17-3.71,2.73-9.28-.98-12.44-39.62-33.82-90-53.71-141.85-56.02-4.92-.25-9,3.56-9.21,8.43-.22,4.87,3.56,9,8.43,9.21Zm-130.22,34.69c1.46-.08,2.92-.52,4.24-1.35,25.17-15.92,52.86-26.33,82.32-30.92,4.82-.75,8.12-5.26,7.36-10.08-.75-4.82-5.35-8.06-10.08-7.36-31.86,4.97-61.82,16.23-89.03,33.45-4.12,2.61-5.35,8.06-2.74,12.18,1.77,2.79,4.85,4.26,7.94,4.09Zm303.57,197.31c.26,0,.52,0,.77,0,4.52-.24,8.19-3.92,8.34-8.53,.18-5.46,.12-11.04-.18-16.6-1.39-25.95-7.82-50.86-19.12-74.02-2.13-4.37-7.4-6.19-11.81-4.06-4.38,2.14-6.2,7.42-4.06,11.81,10.26,21.03,16.1,43.65,17.36,67.22,.27,5.05,.33,10.12,.17,15.08-.16,4.88,3.66,8.96,8.53,9.11ZM276.37,112.04c.26,4.87,4.42,8.6,9.29,8.34,8.66-.46,17.41-.29,26,.51,.44,.05,.88,.05,1.31,.03,4.3-.23,7.89-3.58,8.3-7.99,.46-4.85-3.11-9.16-7.96-9.61-9.45-.89-19.07-1.08-28.59-.57-4.87,.26-8.6,4.42-8.34,9.29Zm-22.99-5.04c-20.85,4.6-40.67,12.6-58.88,23.77-4.16,2.55-5.46,7.98-2.91,12.14,1.76,2.86,4.88,4.37,8.01,4.2,1.42-.08,2.84-.5,4.14-1.29,16.54-10.14,34.52-17.4,53.45-21.57,4.76-1.05,7.77-5.76,6.72-10.52-1.05-4.76-5.73-7.72-10.52-6.72Zm62.7,463.77c-142.34,10.83-271.36-90.15-294.14-231.07C6.86,246.44,39.41,153.98,107.87,91.06c3.59-3.29,9.17-3.06,12.47,.53,3.3,3.59,3.06,9.17-.53,12.47-37.97,34.9-64.13,79.51-76.22,128.23,2.68-1.66,5.8-2.32,8.98-1.71,6.58,1.23,10.07,6.81,13.03,13.54,11.55-51.91,40.53-99.2,83.03-133.09,3.82-3.04,9.37-2.41,12.41,1.4,3.04,3.81,2.41,9.37-1.4,12.4-43.33,34.55-71.47,84.16-79.56,137.95,3.08,1.29,6.93,2.23,11.86,2.5,4.05,.17,8.51-.86,13.26-2.76,7.51-44.85,30.7-85.57,66.73-115.59,3.74-3.12,9.31-2.62,12.43,1.14,3.12,3.74,2.61,9.31-1.13,12.43-28.8,23.99-48.53,55.51-57.52,90.47,4.4-2.98,8.91-6.24,13.46-9.6,12.68-9.37,28.41-24.31,41.06-36.32,6.07-5.77,11.81-11.22,16.42-15.31,9.81-8.7,39.67-35.15,82.72-23.2,40,11.11,55.24,34.38,67.43,57.26,.12,.22,.23,.45,.33,.68,.8,1.79,1.82,3.85,2.64,5.3,3.73,1.15,11.21,2.92,16.08,3.94-7.62-5.97-12.73-14.71-14.75-18.56-2.2-4.2-6.27-12-.8-18.56,5.25-6.29,12.84-3.91,16.09-2.9,.37,.12,.81,.23,1.31,.35l.38,.1c6.56,1.68,20.18,5.15,31.72,20.03,3.44,2.75,20.22,12.08,28.38,16.6,21.16,11.76,23.95,13.4,26.11,17.14,1.27,2.18,5.08,8.78-4.74,21.76-2.3,5.67-8.37,11.77-18.05,10.83-1.54-.15-3.29-.47-5.51-.88-6.16-1.12-20.56-3.74-25.79,.25-1.75,1.34-7.84,6.58-13.21,11.2-5.32,4.58-10.75,9.25-14.25,12.13-9.47,7.8-15.94,9.4-26.66,12.04-7.24,1.79-8.36,3.17-13.73,9.81-3.94,4.88-7.94,11.15-10.58,15.3-1.3,2.04-2.32,3.62-2.95,4.48-3.77,5.22-9.2,10.22-21.12,7.84-.87-.18-1.89-.38-2.99-.65,1.68,11.35,4.6,16.28,9.98,22.15,6.3,6.88,18.06,14.44,23.39,16.62,1.03,.42,2.18,.86,3.41,1.31,7.19,2.71,16.84,6.34,23.07,13.57,4.91,5.71,7.37,9.3,8.71,12.8,2.78,2.1,7.9,6.47,9.28,14.75l.16,.69c1.56,6.58-1.96,11.09-5.45,12.95-.74,.39-2.72,1.3-5.28,1.3-2,0-4.89-.57-7.67-3.14-3.07,1.04-6.34,.83-9.74-.62-5.35,2.17-11.08,.47-17.03-5.03l-1.68-1.56c-5.73-5.35-14.38-13.41-27.89-23-8.52-6.06-15.87-9.82-21.78-12.85-4.72-2.42-8.44-4.32-11.63-6.73-9.57-7.24-9.84-12.91-9.51-23.12l.1-3.62c.29-10.37,.65-23.27-2.09-41.82-2.06-13.94-16.44-23.84-30.34-33.42-5.11-3.52-9.91-6.83-14.14-10.36-7.44-6.21-11.98-10.31-14.98-13.02-1.08-.98-1.99-1.8-2.71-2.43-.66,.37-1.37,.77-2.05,1.16-1.28,.73-2.97,1.82-5.1,3.21-8.7,5.64-23.2,15.05-45.47,24.24-6.2,2.56-12.15,4.59-17.86,6.14,.02,.48,0,.96,.03,1.44,4.43,88.3,72.19,158.63,160.33,165.53,79.83,6.25,151.83-41.17,178.55-114.43,1.51-4.15,5.68-7.01,10.03-6.2,5.53,1.03,8.58,6.65,6.76,11.7-24.38,67.48-83.64,115.04-153.69,125.05-6.36,.91-10.97,6.52-10.63,12.93v.04c.39,7.32,7,12.73,14.26,11.69,110.06-15.79,192.07-113.57,186.01-226.68-1.36-25.33-7.01-49.92-16.81-73.08-2.08-4.93,.65-10.69,6.08-12.03,4.25-1.05,8.64,1.49,10.34,5.53,11.13,26.44,17.27,54.59,18.23,83.57,4.05,122.36-88.77,228.83-210.55,241.38-74.39,7.66-143.56-20.12-191.74-69.05-4.38-4.45-11.47-4.69-16.22-.63h-.01c-5.3,4.55-5.62,12.64-.73,17.61,50.28,50.97,121.26,81.08,198.21,76.96,142.63-7.64,252.45-129.88,244.81-272.51-2.26-42.16-14.86-83.44-36.45-119.38-2.76-4.6-.85-10.69,4.34-12.77,4.07-1.63,8.77,.29,11.03,4.06,22.93,38.31,36.32,82.27,38.72,127.14,8.05,150.25-105.94,279.32-255.22,290.68ZM102.84,305.46c-9,.8-17.32,.08-24.99-2.15,.04,1.07,.07,2.14,.12,3.22,5.93,110.83,94.35,198.03,202.44,205.23,7.45,.5,13.67-5.67,13.27-13.12-.33-6.25-5.26-11.29-11.51-11.7-95.68-6.32-173.97-83.41-179.34-181.47Zm-56.47-53.45c-.29,7.24,4.49,20.4,16.64,31.4,18.81,15.48,43.12,13.75,70.47,2.46,27.35-11.29,42.83-23.15,49.2-26.77,6.37-3.62,7.67-4.34,11-2.75,3.33,1.59,5.64,4.92,21.42,18.09,15.77,13.17,44.68,25.92,48.33,50.65,3,20.31,2.46,34.44,2.17,45-.29,10.56-.87,11.87,5.06,16.35,5.93,4.49,17.65,8.39,33.14,19.39,15.48,11,24.74,19.97,30.68,25.47,5.93,5.5,6.51,2.03,6.51,.29s.29-2.17,4.77,1.16c4.49,3.33,5.64,1.74,5.79-.72,.14-2.46,.72-2.32,5.64,1.3,4.92,3.62,4.63,5.5,3.91,1.88-1.16-7.38-7.81-8.54-8.25-11s-1.88-5.06-7.24-11.29c-5.35-6.22-15.92-9.26-22.28-11.87-6.37-2.6-19.54-10.85-27.35-19.39-7.81-8.54-11.87-16.35-13.6-35.16-1.74-18.81-2.12-32.56-2.75-38.93-1.27-12.81,9.85-25.04,15.1-27.66,11.74-5.87,19.56,4.27,17.17,17.82-1.5,8.52-7.24,27.64-7.67,28.65-.43,1.01-4.34,6.22-4.34,6.22,0,0-3.33-.29-3.76-.87-.43-.58-1.01-6.37-2.6-6.37s-1.74,5.5-2.17,9.98c-.43,4.49,1.45,5.21,7.96,6.51,6.51,1.3,8.1-.87,9.98-3.47,1.88-2.6,7.81-12.73,13.89-20.26,6.08-7.53,9.12-11,19.68-13.6,10.56-2.6,14.9-3.76,22.28-9.84,7.38-6.08,24.03-20.72,27.78-23.59,11.11-8.48,33.14-2.17,39.07-1.59,5.93,.58,7.08-5.12,7.08-5.12,0,0,6.66-8.19,5.07-10.94-1.59-2.75-49.49-27.06-53.25-31.98-10.71-14.18-23.73-15.77-28.36-17.22-4.63-1.45-6.22-1.88-2.21,5.79,4.01,7.67,10.89,16.21,17.69,18.23,6.8,2.03,6.51,3.47,5.79,4.92-.72,1.45-14.18,12.45-16.5,12.16-2.32-.29-23.3-4.78-25.32-6.66-2.03-1.88-5.5-9.7-5.5-9.7-13.02-24.46-26.77-42.4-60.63-51.81-33.86-9.41-58.39,8.38-72.43,20.82-14.04,12.45-38.85,37.93-58.24,52.25-19.39,14.33-37.48,26.97-54.41,26.05-24.85-1.35-31.4-16.79-33.72-22.57-2.32-5.79-4.78-11.87-7.09-12.3-2.32-.43-3.33,3.33-3.62,10.56Zm245.39,62.51c.74-.13,1.52-.19,2.32-.19,.95,0,1.86,.1,2.72,.29,1.95-6.78,4.03-14.59,4.77-18.8,.59-3.37,.04-5.51-.37-6.43-.26,.08-.59,.22-.98,.41-2.19,1.09-9.78,9.32-9.05,16.69,.21,2.08,.38,4.76,.57,8.03Zm-189.57,114.57c-24.24-34.7-39.42-76.33-41.85-121.62-.23-4.3-.33-8.6-.32-12.88-1.18-.84-2.34-1.71-3.48-2.65l-.37-.32c-9.64-8.72-15.56-18.83-18.36-27.7-1.76,14.74-2.28,29.72-1.47,44.82,2.67,49.85,19.37,95.66,46.02,133.87,4.06,5.83,12.28,6.89,17.68,2.27,4.62-3.96,5.62-10.8,2.14-15.79Z'/%3E%3C/svg%3E",
        reference: null,
        reference_hash: null,
        decimals: 18,
      },
    },
  });

  console.log("create account", 4);
  const auroraTokenAccount = await createAccount(accountMap.auroraTokenAccount);
  await auroraTokenAccount.deployContract(token_contract);
  await auroraTokenAccount.functionCall({
    contractId: auroraTokenAccount.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      total_supply: "1000000000000000000000000000",
      metadata: {
        spec: "ft-1.0.0",
        name: "Aurora",
        symbol: "AURORA",
        icon: "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 288 288' style='enable-background:new 0 0 288 288;' xml:space='preserve'%3E %3Cstyle type='text/css'%3E .st0%7Bfill:%2370D44B;%7D .st1%7Bfill:%23FFFFFF;%7D %3C/style%3E %3Cpath class='st0' d='M144,0L144,0c79.5,0,144,64.5,144,144v0c0,79.5-64.5,144-144,144h0C64.5,288,0,223.5,0,144v0 C0,64.5,64.5,0,144,0z'/%3E %3Cpath class='st1' d='M144,58.8c7.6,0,14.5,4.3,17.9,11.1l56.2,112.5c4.9,9.9,0.9,21.9-9,26.8c-2.8,1.4-5.8,2.1-8.9,2.1H87.8 c-11,0-20-9-20-20c0-3.1,0.7-6.2,2.1-8.9l56.2-112.5C129.5,63,136.4,58.7,144,58.8 M144,45c-12.8,0-24.5,7.2-30.2,18.7L57.6,176.2 c-8.3,16.7-1.6,36.9,15.1,45.3c4.7,2.3,9.9,3.6,15.1,3.6h112.5c18.6,0,33.8-15.1,33.8-33.7c0-5.2-1.2-10.4-3.6-15.1L174.2,63.7 C168.5,52.2,156.8,45,144,45z'/%3E %3C/svg%3E",
        reference: null,
        reference_hash: null,
        decimals: 18,
      },
    },
  });

  console.log("create account", 5);
  const octopusTokenAccount = await createAccount(
    accountMap.octopusTokenAccount
  );
  await octopusTokenAccount.deployContract(token_contract);
  await octopusTokenAccount.functionCall({
    contractId: octopusTokenAccount.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      total_supply: "1000000000000000000000000000",
      metadata: {
        spec: "ft-1.0.0",
        name: "Octopus Network Token",
        symbol: "OCT",
        icon: "data:image/svg+xml,%3Csvg version='1.1' id='O' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 113.39 113.39' style='enable-background:new 0 0 113.39 113.39;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23014299;%7D .st1%7Bfill:%23FFFFFF;%7D %3C/style%3E%3Ccircle class='st0' cx='56.69' cy='56.69' r='56.69'/%3E%3Cg%3E%3Cpath class='st1' d='M44.25,59.41c-1.43,0-2.59,1.16-2.59,2.59v20.28c0,1.43,1.16,2.59,2.59,2.59c1.43,0,2.59-1.16,2.59-2.59V62 C46.84,60.57,45.68,59.41,44.25,59.41z'/%3E%3Cpath class='st1' d='M56.69,59.41c-1.45,0-2.62,1.17-2.62,2.62v26.47c0,1.45,1.17,2.62,2.62,2.62s2.62-1.17,2.62-2.62V62.02 C59.31,60.58,58.14,59.41,56.69,59.41z'/%3E%3Cpath class='st1' d='M79.26,78.87c-0.33,0.15-0.64,0.28-0.95,0.38c0,0-0.01,0-0.01,0c-0.59,0.19-1.13,0.29-1.63,0.31h-0.06 c-1,0.03-1.84-0.27-2.59-0.75c-0.49-0.32-0.91-0.73-1.25-1.23c-0.3-0.43-0.53-0.93-0.71-1.51c0-0.01-0.01-0.02-0.01-0.03 c-0.22-0.74-0.34-1.61-0.34-2.59V62.02c0-1.45-1.17-2.62-2.62-2.62c-1.45,0-2.62,1.17-2.62,2.62v11.43c0,4.5,1.64,8.03,4.63,9.96 c1.5,0.97,3.21,1.45,5.04,1.45c1.68,0,3.45-0.41,5.25-1.22c1.32-0.59,1.9-2.14,1.31-3.46C82.13,78.86,80.57,78.27,79.26,78.87z'/%3E%3Cpath class='st1' d='M68.33,45.9c0-2.15-1.75-3.9-3.9-3.9c-2.15,0-3.9,1.75-3.9,3.9s1.75,3.9,3.9,3.9 C66.58,49.8,68.33,48.05,68.33,45.9z'/%3E%3Cpath class='st1' d='M48.96,41.99c-2.15,0-3.9,1.75-3.9,3.9s1.75,3.9,3.9,3.9s3.9-1.75,3.9-3.9S51.11,41.99,48.96,41.99z'/%3E%3Cpath class='st1' d='M56.69,22.28c-15.17,0-27.52,12.34-27.52,27.52v15.09c0,1.46,1.18,2.64,2.64,2.64s2.64-1.18,2.64-2.64V49.8 c0-12.26,9.98-22.24,22.24-22.24c12.26,0,22.24,9.98,22.24,22.24v15.09c0,1.46,1.18,2.64,2.64,2.64s2.64-1.18,2.64-2.64V49.8 C84.21,34.62,71.87,22.28,56.69,22.28z'/%3E%3C/g%3E%3C/svg%3E",
        reference: null,
        reference_hash: null,
        decimals: 18,
      },
    },
  });

  console.log("create account", 6);
  const skywardTokenAccount = await createAccount(
    accountMap.skywardTokenAccount
  );
  await skywardTokenAccount.deployContract(token_contract);
  await skywardTokenAccount.functionCall({
    contractId: skywardTokenAccount.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      total_supply: "1000000000000000000000000000",
      metadata: {
        spec: "ft-1.0.0",
        name: "Skyward Finance Token",
        symbol: "SKYWARD",
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAB+1BMVEUAAABWWLVmXbOiaJ9pXrJbWrVvX7NhXLRxYbNXWbWcaKffeILLb41lXbSCZbCkZ6N+ZbJcWrVgXLXTcYjlf33jfH7heYDieoCJZq5+ZLHAaJRoXrTgeIHFaZCZZ6iYZ6jcdYPmgX2oZ6GxZ5u7aJbRbImyaJzie3/Qa4n///94Y7ODZrGZaKnrjHpqX7XohX1kXbW1aJvFaZHacIWeaKfBaZTieoDgdoJ9ZbNzYrSTaKxvYLS9aJbQbIquaJ+jaKTTbYleW7XmgX3piHuyaJ25aJnJapDNa42paKCmaKLdc4PwnXXtk3iJZ6/skXlYWbWOZ63ypnPkfn7Lao6JZq/xonTXb4fzrHHulXfvmXf1snBhXLXvmneQZ632uW/75+b69fjXdY2HcLj67/GahML+9O385tXpi4T2296AabXvnn3chJn1t4TjmqrafJL3wo68rNaSe72bcLDxqIffjqH0tZfp3+73wp/ohoHy7PWtir73ybfuqKb1s3mnk8n62cGmfrbmpbTsn5zqlpTg1enxxcnyqHz00NSync3yuLOicKzpj4v4v3m4k8H5y5mgd7TtmofUxuDrtsLeeInljpjwqZPLudn0r3zEo8rCh7D61KzjgIbTjauRcbTjho7WrcnSeZitd63KfaLXnLi1gbG5cKHEcpuvbqPjxNjN3AFJAAAAKXRSTlMA71IjE7A5ZcbT8kw6oXlU8ol5YezgsHOi4ansne3iyorQrIt01eTFwdYInfkAABWHSURBVHja7JY9b9pQFIax8QceXMms+QUJVZUxgYkfgNKBLYqEIpZuNoMlM1gMHqxKCLGgLPmvPb4GH/vcD9vBBIa+pKaly/Oc99xLev9DY1i67bmOo1XjOK5n65bRu+UYumc62osqmmN6+k1aWLbpEFiVhd3v3VBg8if4qeAljnMrTRi2qZ3Ys8AbvpekBCaaaV/dQc/op/Vh/ODBO+i968XytGnLCCQ0z+pdJbY5/UpETVyhBmPo8Giv01eaplU4dueIanwNqY95fIQfPvAf6KKqQhv2vi0n/By8acQSV1Cw7xg7R97eAnv4xkXSHQn8L/aHvCQSEEkPzoVvpL4rpYcHEJfCPsieTarAFtxLfrcNRei/EFwVoUTZ4FSDdrE9sgaEvX1oHdkVxW+SeZnf9IaE/YyoemC5wH3UH5SWRpwJn+xDHh+rQAdiYHZ9EnSkr+cWmfAeRIE4aHqn/J54cSZtI5PAGtDB6w7fYOtTg/4sC29Rr9DtGll3BL6Wu16E3EyiFjr7VrMr+HXsD8e3B4WE2qG8R3oXt6eaHsnFQRW1BDpgDZ3cpy5PT7gRVRGqISyC/3Y7/yibCno1cL0HpyBapBe3C36eXjTzJ3jBE36Kh9pB3ALdI/MM/gHiE3gCfoIv5w9JVUhaA38UzLP46ezJ4BG8wv4OCYJgWQT+AR+BhdwBW+jKYMDhC+ZOM8rggTyO09QvJU3jGDxA4qlW4REVzjEwK7vD7zvPPgJ6Bp/6hySMFot7zCIKk72fxsuAFCFxqCp85SS7Ewk/HfyoCNDn8NG9JItw78fHHjBqBWbgtf/+QnoKT+if2AuS4fuHEOcuTrSHHmoVqIHdkl9Hfjy2yI6jZ88jfuonKnrsIfGVCvQoMAO9Fb+F9MK1H5Gw6SN+fUI/DsBApUBL6LfgN+6K1cfhIzyP/xkgflOFdHlUQAtiACkZaG0u0Amhf6jsfJEZ+5m/fy7TQ3TfMot9vAQDdQt4oba5TD3cngo+23mkZ4/5fJaNP2yDjnsEJTxBKiWgAS1h2PQA4/hlw5/Ba84yY/w4/rYlsDWCkBbEBlazA4DjR34cfr41R3rgz9YHt79tEjAYjSQt0JPQ8BgMKD6kPPv5iT7Lb+DfI3/7hIUBpPgdV1ZCk2PwA/kF1w7CH/l3yH+uAbbwTPYIDexa/j69ecqrg/TADgH+WLk/UZ56g0Ihj7SEV6N2geTjR3rAZxnv1lL+KDmk23WebXrYh1LRZJkJ0BYkF+qgboHI9OnwEf7t7W28Wn9E4qnut+vNZrdb5dntNpv11k8kBocgw6ctSNZIvUQGjr+yPWT2jH48Xm3SUDjSj/UG2H/mGbOAxWYtOS9RMBuxiBS4LVIKuIhPxl+hz5myBRJNH/D/MnqGj39ZrUAhETXwyQRkLZAOXAW/JcLH3SnTswL+MV4+r01FQRSGtNoqWH+sLIKuRTfWFCW06kKTtlAQKu7EhGwCISIlFFJcJGAJBEJpK9JgtEmapv0znUxect6dmXtfj7pT+L6ZM/dZo0D5I8InXgQirPC9pm/g7/an2Qpg4NYIBoHP2TL4MX2bnoAO20fG+OutVjqdfp4m3rShcLhPtZP8H3lKs5mZO4DBLS//QsT/zB0/ugN6Cl1wXvG364QvQiIxld1626nR0Zh/GwZQ8BqkfAL3MH5j+hkHnxeg+fvgVxYwwC3vfa/vZrbJAAp8Cs6DKh+jR94n1GmPOXxMsqUvoHbab711IixgMDM+3M18pEwVcAmhU17wLECNX3Ufj0q6pZ+g30Pw+zzYfdqin/vEn8l8gQF6FDKwV7Ck5q/wp6FCpPvtPfmaDPubm2836Q/9CllMDY4m/HEFGKBGxC8NFswF6PHb5WGI1lCecK1N/FYMiVZ9//Tnaf2Qv3NKIXTK/hUs4UcWjF9Pf4YwlA26Gl5uuLE1Jv+81Tps8fcCCvYSbIOUtQC0B+VX0+cQRr99Jb5g7f6GN0IC92Ao4BJe+w30tyCFb1fED3wxfWZQJ7DXudx4I2OsAwpxBxiYNdIG6nO86MzfGj/oKZv905pqEMB9JoaDayCW4G/RDcE/J8YfxCeGDXXDp30mfR+LkFBlwifOXEJ4B3OuwMPobwt+0Mfxif9yeOYK5DsX732Ri1AKUYQBTtkyeCBOWNcH/Ap/YyzgLqAYCbxwYliEFFCj5B08ck8Y80/CZ4A3lx0hUOtcOOimhnawFZIN5BkvYv4mP4bP+G+0wB4EzJgK2IJtQPG36E5cgPn1/DU+01sCpc7FByteCygYS0CN9P/tIgGnQwvM7xu/wieGC7UBCAQ9DAVswV8jyyAFgYeB+qD7wDcEit2LNSPSAQqcmIKnRuoOUCJ0aP4e+HV9NP4Yo3OWFwKjNX+EhNwClqAN/GeADqU8/GiPwIcAcj5YW11bFZEScJAKqNH1DW7OGqT5MX6Fz/kwOBcCZ4MRwH0atgJ6JGrkN2CB2bdsGfyoP+FLfuB/IIGaK9DsxgRWvBZYAxRgoGoUNFiM+Oc0f2j8TLA2Oi+JKz4frK5YgYNUwC3YNdItYgEYzEcnkMCv8Qlj1L2SP9B0Ryu+GHuAgnsJMEhuUSo6AfCj/jY+8zPCaHD2VK0gl82uZGfRFmEFGIR3AIE70QmAP17/2dvJi3bxCWRwXhQGpW6PDIyYDm6RZI2e2wb8ScbXYHIE8+A362PhU0bd0lNZIjLYiSWb3YEDFOAAAz4zGOgd0EuvS/SIBe5uW/yiPgKfBY6lQPGYDKaBipSAARR0jZ5rA10i/hIsSX5z/C4+YWTRIcMAcTRkk2wDtQP8iCNWsMQ3nMCv8CcQ2R7eIRgcVMq93Po6/5YW8T3AgCIPQbfId8h8xU++fMH9evkFPpHkeAUypUa1V1iPJReZSAX/EtAi2wACfMXzhE8R/Fx/4Ct+yk6ve0DEukaV6rdC4d27uAQcdqBgL8HewUfbYJkEbqoCYf5q/KCn5HqVrwBHvpJCmRTGWYeHswe1hMAOYKBLNEePkJg/+J3rlfg5Sq/ayD+1FRrVMq9hEhhQ4vccNlCPqf4apOgREvy6P3L8jE9ZJ4MmqMU1Nyoxh3X6DQtsYbIE1Ei3KOEMFlgg3B97/ExTKKNEeg1wUHtghRVrCdgBDFSJ8JYu0SsKfmf+sj4an8ZaKDdgoJIvHUcOn5UCliAN8JrikDPj4IdkGNynVzRj8r/X9ZH4FNMg2QEKWAIM0KLkEtGH4LHqj54/2s/dZ3zO58/fqjCwU4QDFPQSQjuAgVzBIgTwAVDzx/gFPqUAg2QHrWAY8Ar0DrACGLDA7RA/C8jxA//lON/KlRJYvQ5NPK1QsAxYwfOYqhItuwLh+aP8RM/4nJOTcqWZTxLA0woF1MjcgV0iLXB9foyf6KfZ2to6+Reqkf7CsQJqhFPWBnaJYMACToF8/DkK8OP8bPCrclAEZ7BKjQoUUCMYiKcovIJ7UwHmxwME/tD4tyb4ryh/SKEJhfDLygoJBjiD0OeMBawC4X7Bj/Fj9hF/pPDjugrNRjUyoMBgFQbJJYJAiJ8i5g980HP+N2+ur03GYBQPVhRscULtqmPqdF4/iHjbvqhI590hXnA6EauI3ajVfpijg20UK6sURYpaChP8W03S5j3N8yR52+nUs6kIiueXc54kfVsnfvz4+WFlLTwLuHMjhOt9E/AIOAAGwNkftN+yPzE5oSVTqDWwI4U0jxCQARnkYAQAsAOAf7L+rD5Ye0im8OnDytd8XyG8e20TnAkSYI4NgJIG0P6xA3H/WH7X6vfovlRu7tOHGqoUmoQ3r/0ZnOYENAIDwAvkW3/u3zJvlFvSDB9jGeZ9BBgDX4kMgDoHiH+ygUr/WH+6/Lb3nPw2WkIO8QSYZAxyaI5xp9MA+gi4RAsUXH+H/RzVqX4Y8oSAlwjHGT/NAIAA6AZE1v9WyD68KymE+C59jPYiCUAI/FMAAHWdxosADAD8Y/3jV/8Uk2Hwn3Br797OgABbkTXHOI/JWaAADvgC4P4B0GOfeucMc5JhpeGJ4eV7WSIQDBKBItgjxCEJ4NiBsIHCP1l/h/0p+W1kMcgYGvOeMXj7AhlcCxBgI8Lrgp1CjN9kRwB2UO4f9rl7l8AgEfLuEgHAImBbKdtJNcBhOQHOCXb517KWn5g/eXJKfnV+JgxLskiua8bLN2/PzsSWiEyBAdguxBCZAHYCzLgCkO5hPzLPBQRdpFrjpXMnmlEEbC+VjY6LYIsQKRYAKRDml/WH2/dCmB6t5J0RGILYCAhAQghxExNA/fMCwT78U/N31BdH8BOsvf424ypRfIf2CqkDLAB9BMC/tz/c/h1bFoKfIP8uigA7EYnAvZPuUQCHAEACwACw9Yd9Yn5afk+r764IgiLgcyA7JAkQAZ8CHgEAxlWDSAC0QFh/l3+4t2UwCEGt4egQiYBMgQ9gpwIY8gbA/Cu5/Peafxz9AANC0NvpCj3S5t99O+ua49gObRNKl3AIswBQIL7+3P5jWwaChCBL9JzvQ2fJYYAI0CEKsEtoHcUI8wDgn68/7Bvzs73qUiAFTeCMQAOEI8BRAIADQusQaVAoAPjH8k8rGfdPIxkInQMIJAKfgq+vz1oRAOBC6CjYI7SGrvBDmAcQWH/tXpu/3SMDYVIAwpLsEJ9ivhGRMeYA24RWwjXCOgC+A9n+o/Yw96DQCKiRBvhEz4KP37+RCAIdOhftQ1tFdwgAEAoA/rH8UXlgnyF0Q8Aon2JDMN8FUATYSdlpbO9Ddw+Irsb5CGMC6A5E11/Zx+o/7FHEYHoUlWiutsYAbiGC64gg2KGdBmCIjnA4AO6fmGcMJIQAwEx8hwCAT08fNQB8D8UE8AJJ+5Z/g3Dv3j0guAjmassOACVrJ2UAN6wE9otII2gQrnGhALj/yDoEBD0JepQDAIiAdci9ke4BwJCvQWH/6A/cEwEBBCEA3iH/YTwkILoHXQ4DwD+WH/4fyS9KoEc5KtFca80BcCvUIQ6wQ/RohOxBrEE8ALL+xjxECGQEUQbNlY8MYDLQIVzoAKAaBKUAgAbFB0D9K9vRFxiQQfdEa9JzYO3n5KSzQ+xCh6Nsm+jVvjgAHoDe/3uHt+MeUr+JQsAYKAD6muYrAHxnGQXYLyyNyz/ZX4MwwdJ/sVhfWKjX693qQyDQsgimm63ODEMrGuAWAOKHYKcNkAAAOwQmGIApkLS/WKlUSm2UX+nJEwsBGTztlMiMAFT70QFAh2IBtgpbI2iQC4AFoP1L+8uvTpxYLrVhPhIjMBEUW7RB+e8SwESAITgTmOJDgigVBOAN6vhfLuh/X2YA948IQkTQnePZ5mKVPtoCADrkOspwmdgmqPYBwDoFaIOM/2JxQS2/VqFSWlX+mXozMCUqtrp/DWr8nJhEh9wAp3EhlQAHBFNaAWCG2Qho/wAoLrQqWMhCubQK288sAoUAAJlbo0Df7qv9UACT/CgjF1IADAmufdiEEIAH4HGnPlBVEhj3z5QMBS1RcQEFwjFGAMwUn/FN8X7h0GGdAEbAv4lq/3YPXhkCbV59GwQ7AvUXn5/gDZIAbIoD2xACIBEAwD3DJoBm5B8EXxSBtA2ZDBABBdfKf/ihAHxnMQdAADQC1yaEBmEPKi7ABubgS/kzzOsQKEBd+2cBfDIA2IaCAAiARtA3QAv9hwrr5c+fAwT1ut63WAC1uQkpbEOOBBQBABAAUdp3l5b+CQAbRF2j9S8WggVQV6d2VfafB5DTAIiA76N2AgiA6ggAAufw9PTswqL7TceCRvjMCdrtkjy1XX9p/sNcjiYQPskOCK9S9CpHAHAK4DAiIWgEzYDNdHW1VCpXlgtYfujlyqel+/djAK5aAAnh1wg/x8zzFAB0tlGUiCFIBgmhtfq5JM2XK+tV2Le09mEpZwAm+0pgXIT0gAG4LxKSAHPMGaoSQqpcVj+vS/fIixcoJ/33D7BDBJUOVwg3ORB4IF4VCoVqtVoo5GHesQN9WsqxBGZwl+AAQyKs430BgGCDgv9TuYEqdEjEKAEA7y6kAfSt5tXv+W8056R/CdD/LiRilcY26pkB83Ie5+pv+JcA8TOAcwAFCpSIVMgLIK8Gi5X8xv23lH/ToP4qhAKFZN1GnduoBtAEpcpGB2Fe+/ckcNENcFT0pSS5SgAAr+hnZxWAIlhc30gIL9ek/6kpKwF6neYVSon+NOZ8PUBe0isARdAuVQaf5cJKs3nyZBiA30YPi3513AcwZQHc1k+02u1ypTAQQn5ZLv9JDYBNKB4AAxCvi+GjGEOgCB61S2WWQth+807Hvw9A+ycAR8UASvgOgik6BPqZnEZYL/RVnkarWZyW/p0A5J0+6wF7QgyipHsbIhGA4JG6cH6p5mMWv7rYWijOTt+xASZcAPQdgpQYTFnvq3o8GTVTIAkUgmZYxzjQG96ycl+cNe/2ydUY4BgYEoNqDADuJ3MkAsOgbqDVqrzCveqQyF/lra6yuCifAheLTzv+EQAAgs/XD4vBNUqnmHcIBApB68mqplD6UlEqlxdLpVK7Xn/4EA/YQyMwg8dC0QyPi41oGADBCECAB7yrXbWl6tI8nk6jQXQE+Fs0ZgRGxMY0LDvkB5AEiIC8P0Dfaer69wTgvosCAP4HJ9AA2EjpA3abgCFIKPhHgYIjTGf4PPxvhMDfIVMitAgI1D7e5ZtmAbhfjgEA/jekUXSIR8AIdJHwxf2jQP4GkSej4+L3NOaLAGOA94mVaYi/y+oNgAOYETgsfldZAEg536kHgqaAsPzcPwII3eTS4veVlC3Ch204Qe9HVbh77j82AOxB+1LiTyiVsT9vFvdpm45xuLc+68ECYCMMgCMJ8Yc07Pu8EPYiMDjtx/vn94gR8ec0Zi7VIDAI5ANn1L2uD/FvCgQA+Mcmelj8SSV341bNMkCPiLD8xH98AKj/H6sRxoATzCIF4p7Yp/4xAUoIYET8eWX5cYZR7jBIv2TtlX34JwWa8AWwLy02Q4lhRGDPgc2gfnTMm9V3+ycTgENsJCE2SendhEAJBAbCeHd/dtr49wWA5d8MjboI2MfX4R324Z8MAAlgTGyuUsfMGND/P2BkPu8N97AP/2QHMgEcT4lNVzqjMgABjQHeyf9+QH/g3y7QkaT4K8pmSAhgoDoZifrnA3DEX/7NRAABpyDujf9c7/obANj/O0ofBAEguNAe2HcM8PGk+OtKDiuCeIQpx/KTARhNiX+iVDYDAiAQ83z5taL+HMkmxN8XYtjdYYCMc5iHfeY/8/cXnzOMIgemU8S+1Z/MaFL8H0pmDxqnynTXu3QfsH8s+7+47yiRHD2o2wTBPdqjlTk2lkyI/1Gp7OhwxmEeq58ZHs3++9bHZZHOjg0fO3gws9soc/DgseGxbHoT1v0X6Almagg4b48AAAAASUVORK5CYII=",
        reference: null,
        reference_hash: null,
        decimals: 18,
      },
    },
  });

  console.log("create account", 7);
  const usdtTokenAccount = await createAccount(accountMap.usdtTokenAccount);
  await usdtTokenAccount.deployContract(token_contract);
  await usdtTokenAccount.functionCall({
    contractId: usdtTokenAccount.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      total_supply: "1000000000000000000000000000",
      metadata: {
        spec: "ft-1.0.0",
        name: "Tether USD",
        symbol: "USDT",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2326A17B'/%3E%3Cpath fill='%23FFF' d='M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117'/%3E%3C/g%3E%3C/svg%3E",
        reference: null,
        reference_hash: null,
        decimals: 6,
      },
    },
  });

  // deploy x_token
  console.log("create account", 8);
  const x_token_contract = fs.readFileSync("../out/x_token.wasm");
  const xTokenAccount = await createAccount(accountMap.xTokenAccount);
  await xTokenAccount.deployContract(x_token_contract);
  await xTokenAccount.functionCall({
    contractId: xTokenAccount.accountId,
    methodName: "new",
    args: {
      x_token_name: "xJump",
      x_token_symbol: "XJMP",
      x_token_icon: "",
      x_token_decimals: 18,
      base_token_address: jumpTokenAccount.accountId,
    },
  });

  // deploy locked_token
  console.log("create account", 9);
  const locked_token_contract = fs.readFileSync("../out/locked_token.wasm");
  const lockedTokenAccount = await createAccount(accountMap.lockedTokenAccount);
  await lockedTokenAccount.deployContract(locked_token_contract);
  await lockedTokenAccount.functionCall({
    contractId: lockedTokenAccount.accountId,
    methodName: "new",
    args: {
      locked_token_name: "locked Jump",
      locked_token_symbol: "LOCKJMP",
      locked_token_icon: "",
      locked_token_decimals: 18,
      contract_config: {
        owner_id: ownerAccount.accountId,
        base_token: jumpTokenAccount.accountId,
        vesting_duration: (60 * 60 * 24 * 30).toString() + "000000000",
        fast_pass_cost: "500",
        fast_pass_acceleration: "2",
        fast_pass_beneficiary: xTokenAccount.accountId,
      },
    },
  });

  // deploy nfts for testing
  console.log("create account", 10);
  const nft_contract = fs.readFileSync("../out/nft_contract.wasm");
  const nftCollection1Account = await createAccount(
    accountMap.nftCollection1Account
  );
  await nftCollection1Account.deployContract(nft_contract);
  await nftCollection1Account.functionCall({
    contractId: nftCollection1Account.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      metadata: {
        spec: "nft-1.0.0",
        name: "NEAR Meerkat Kingdom",
        symbol: "NMK",
        icon: null,
        base_uri:
          "https://bafybeiht5jof3n265j3jd3rm2sfg6anf567sfgcgqko4oepf77a6ewe3um.ipfs.dweb.link",
        reference: null,
        reference_hash: null,
      },
    },
  });

  console.log("create account", 11);
  const nftCollection2Account = await createAccount(
    accountMap.nftCollection2Account
  );
  await nftCollection2Account.deployContract(nft_contract);
  await nftCollection2Account.functionCall({
    contractId: nftCollection2Account.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      metadata: {
        spec: "nft-1.0.0",
        name: "The Undead Army",
        symbol: "UNDEAD",
        icon: null,
        base_uri:
          "https://bafybeie2yio33xzp6rhjpxsgq2zplo57laygx5oikwyvxt5x654llwers4.ipfs.dweb.link",
        reference: null,
        reference_hash: null,
      },
    },
  });

  console.log("create account", 12);
  const nftCollection3Account = await createAccount(
    accountMap.nftCollection3Account
  );
  await nftCollection3Account.deployContract(nft_contract);
  await nftCollection3Account.functionCall({
    contractId: nftCollection3Account.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      metadata: {
        spec: "nft-1.0.0",
        name: "Secret Skellies Society",
        symbol: "BONEZ",
        icon: null,
        base_uri:
          "https://bafybeiewqydtijclzgpdgeymx7opqa7n37sz2jvaaa7l64v5dvmusva434.ipfs.dweb.link",
        reference: null,
        reference_hash: null,
      },
    },
  });

  // deploy nft staking
  console.log("create account", 13);
  const nft_staking_contract = fs.readFileSync("../out/nft_staking.wasm");
  const nftStaking = await createAccount(accountMap.nftStaking);
  await nftStaking.deployContract(nft_staking_contract);
  await nftStaking.functionCall({
    contractId: nftStaking.accountId,
    methodName: "new",
    args: {
      owner_id: ownerAccount.accountId,
      contract_tokens: [
        lockedTokenAccount.accountId,
        auroraTokenAccount.accountId,
      ],
    },
  });

  // deploy launchpad
  console.log("create account", 14);
  const launchpad_contract = fs.readFileSync("../out/launchpad.wasm");
  const launchpad = await createAccount(accountMap.launchpad);
  await launchpad.deployContract(launchpad_contract);
  await launchpad.functionCall({
    contractId: launchpad.accountId,
    methodName: "new",
    args: {
      owner: ownerAccount.accountId,
      contract_settings: {
        membership_token: xTokenAccount.accountId,
        token_lock_period: "86400000000000",
        tiers_minimum_tokens: [
          "1000000000000000000",
          "2000000000000000000",
          "3000000000000000000",
          "4000000000000000000",
          "5000000000000000000",
        ],
        tiers_entitled_allocations: ["10", "20", "30", "40", "50"],
        allowance_phase_2: "10",
        partner_dex: "dex_account.testnet",
      },
    },
  });

  // register contracts in eachother
  const users = [
    ownerAccount,
    userSampleAccount,
    jumpTokenAccount,
    auroraTokenAccount,
    skywardTokenAccount,
    octopusTokenAccount,
    usdtTokenAccount,
    xTokenAccount,
    lockedTokenAccount,
    launchpad,
    nftStaking,
    nftCollection3Account,
    nftCollection2Account,
    nftCollection1Account,
  ];
  const contracts = [
    jumpTokenAccount,
    auroraTokenAccount,
    skywardTokenAccount,
    octopusTokenAccount,
    usdtTokenAccount,
    xTokenAccount,
    lockedTokenAccount,
    launchpad,
    nftStaking,
  ];
  let promises = [];
  for (let user of users) {
    for (let contract of contracts) {
      promises.push(
        user.functionCall({
          contractId: contract.accountId,
          methodName: "storage_deposit",
          args: {
            account_id: user.accountId,
            registration_only: false,
          },
          gas: new BN("300000000000000"),
          attachedDeposit: new BN("1500000000000000000000000"),
        })
      );
    }
  }
  await Promise.all(promises);

  // setup minters in locked jump
  const minterContracts = [
    ownerAccount,
    xTokenAccount,
    lockedTokenAccount,
    launchpad,
    nftStaking,
  ];
  const promisesMint = [];
  for (let minter of minterContracts) {
    promisesMint.push(
      ownerAccount.functionCall({
        contractId: lockedTokenAccount.accountId,
        methodName: "add_minter",
        args: {
          new_minter: minter.accountId,
        },
        attachedDeposit: new BN("1"),
      })
    );
  }
  await Promise.all(promisesMint);

  // create sample locked jump
  await ownerAccount.functionCall({
    contractId: jumpTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: lockedTokenAccount.accountId,
      amount: "1003000000000000000000000",
      memo: null,
      msg: JSON.stringify({
        type: "Mint",
        account_id: ownerAccount.accountId,
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  // create launchpad listings
  console.log("Launchpad");

  let nowTimestamp = Math.floor(Date.now() / 1000);
  function increaseTimeStamp(nowTimestamp, daysIncrease) {
    let newTime = nowTimestamp + daysIncrease * 60 * 60 * 24;
    return newTime.toString();
  }

  await ownerAccount.functionCall({
    contractId: launchpad.accountId,
    methodName: "assign_guardian",
    args: { new_guardian: ownerAccount.accountId },
    attachedDeposit: new BN(1),
  });
  const listing1PreSaleTokens = "1000000000000000000000000";
  const listing1AllocationSize = "1000000000000000000000";
  const listing1AllocationPrice = "10000000";
  const listingLPtokens = "0";
  const listingLPprice = "0";
  const listing1_data = {
    project_owner: ownerAccount.accountId,
    project_token: octopusTokenAccount.accountId,
    price_token: usdtTokenAccount.accountId,
    listing_type: "Public",
    open_sale_1_timestamp_seconds: increaseTimeStamp(nowTimestamp, 1),
    open_sale_2_timestamp_seconds: increaseTimeStamp(nowTimestamp, 2),
    final_sale_2_timestamp_seconds: increaseTimeStamp(nowTimestamp, 3),
    liquidity_pool_timestamp_seconds: increaseTimeStamp(nowTimestamp, 4),
    total_amount_sale_project_tokens: listing1PreSaleTokens,
    token_allocation_size: listing1AllocationSize,
    token_allocation_price: listing1AllocationPrice,
    liquidity_pool_project_tokens: listingLPtokens,
    liquidity_pool_price_tokens: listingLPprice,
    fraction_instant_release: "10",
    fraction_cliff_release: "50",
    cliff_timestamp_seconds: increaseTimeStamp(nowTimestamp, 5),
    end_cliff_timestamp_seconds: increaseTimeStamp(nowTimestamp, 6),
    fee_price_tokens: "0",
    fee_liquidity_tokens: "0",
  };

  await ownerAccount.functionCall({
    contractId: launchpad.accountId,
    methodName: "create_new_listing",
    args: { listing_data: listing1_data },
    attachedDeposit: new BN(1),
  });
  await ownerAccount.functionCall({
    contractId: octopusTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: launchpad.accountId,
      amount: listing1PreSaleTokens,
      memo: null,
      msg: JSON.stringify({
        type: "FundListing",
        listing_id: "0",
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  const listing2PreSaleTokens = "1000000000000000000000000";
  const listing2AllocationSize = "1000000000000000000000";
  const listing2AllocationPrice = "10000000";
  const listing2LPtokens = "0";
  const listing2LPprice = "0";
  const listing2_data = {
    project_owner: ownerAccount.accountId,
    project_token: jumpTokenAccount.accountId,
    price_token: usdtTokenAccount.accountId,
    listing_type: "Private",
    open_sale_1_timestamp_seconds: increaseTimeStamp(nowTimestamp, 1),
    open_sale_2_timestamp_seconds: increaseTimeStamp(nowTimestamp, 2),
    final_sale_2_timestamp_seconds: increaseTimeStamp(nowTimestamp, 3),
    liquidity_pool_timestamp_seconds: increaseTimeStamp(nowTimestamp, 4),
    total_amount_sale_project_tokens: listing2PreSaleTokens,
    token_allocation_size: listing2AllocationSize,
    token_allocation_price: listing2AllocationPrice,
    liquidity_pool_project_tokens: listing2LPtokens,
    liquidity_pool_price_tokens: listing2LPprice,
    fraction_instant_release: "10",
    fraction_cliff_release: "50",
    cliff_timestamp_seconds: increaseTimeStamp(nowTimestamp, 5),
    end_cliff_timestamp_seconds: increaseTimeStamp(nowTimestamp, 6),
    fee_price_tokens: "0",
    fee_liquidity_tokens: "0",
  };

  await ownerAccount.functionCall({
    contractId: launchpad.accountId,
    methodName: "create_new_listing",
    args: { listing_data: listing2_data },
    attachedDeposit: new BN(1),
  });
  await ownerAccount.functionCall({
    contractId: jumpTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: launchpad.accountId,
      amount: listing2PreSaleTokens,
      memo: null,
      msg: JSON.stringify({
        type: "FundListing",
        listing_id: "1",
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  // create nft staking programs
  console.log("NFT Staking");
  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "add_guardian",
    args: { guardian: ownerAccount.accountId },
    attachedDeposit: new BN(1),
  });

  await ownerAccount.functionCall({
    contractId: lockedTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "30000000000000000000000",
      memo: null,
      msg: JSON.stringify({ type: "OwnerDeposit" }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });
  await ownerAccount.functionCall({
    contractId: auroraTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "30000000000000000000000",
      memo: null,
      msg: JSON.stringify({ type: "OwnerDeposit" }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  const collection_rps = {};
  collection_rps[lockedTokenAccount.accountId] = "20000000000000";
  collection_rps[auroraTokenAccount.accountId] = "20000000000000";
  collection_rps[usdtTokenAccount.accountId] = "30";
  const createStakingPayload = {
    collection_address: nftCollection1Account.accountId,
    collection_owner: ownerAccount.accountId,
    token_address: usdtTokenAccount.accountId,
    collection_rps,
    min_staking_period: "10000000000000",
    early_withdraw_penalty: "1000000000000",
    round_interval: 10,
  };
  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "create_staking_program",
    args: {
      payload: createStakingPayload,
    },
    attachedDeposit: new BN(1),
    gas: new BN(300000000000000),
  });

  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "move_contract_funds_to_collection",
    args: {
      collection: {
        type: "NFTContract",
        account_id: nftCollection1Account.accountId,
      },
      token_id: lockedTokenAccount.accountId,
      amount: "1000000000000000000000",
    },
    attachedDeposit: new BN(1),
  });
  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "move_contract_funds_to_collection",
    args: {
      collection: {
        type: "NFTContract",
        account_id: nftCollection1Account.accountId,
      },
      token_id: auroraTokenAccount.accountId,
      amount: "1000000000000000000000",
    },
    attachedDeposit: new BN(1),
  });

  await ownerAccount.functionCall({
    contractId: usdtTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "1000000000000",
      memo: null,
      msg: JSON.stringify({
        type: "CollectionOwnerDeposit",
        collection: {
          type: "NFTContract",
          account_id: nftCollection1Account.accountId,
        },
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  // create staking program 2
  const collection_rps2 = {};
  collection_rps2[lockedTokenAccount.accountId] = "20000000000000";
  collection_rps2[auroraTokenAccount.accountId] = "20000000000000";
  collection_rps2[usdtTokenAccount.accountId] = "30";
  const createStakingPayload2 = {
    collection_address: nftCollection2Account.accountId,
    collection_owner: ownerAccount.accountId,
    token_address: usdtTokenAccount.accountId,
    collection_rps: collection_rps2,
    min_staking_period: "10000000000000",
    early_withdraw_penalty: "1000000000000",
    round_interval: 10,
  };
  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "create_staking_program",
    args: {
      payload: createStakingPayload2,
    },
    attachedDeposit: new BN(1),
    gas: new BN(300000000000000),
  });

  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "move_contract_funds_to_collection",
    args: {
      collection: {
        type: "NFTContract",
        account_id: nftCollection2Account.accountId,
      },
      token_id: lockedTokenAccount.accountId,
      amount: "1000000000000000000000",
    },
    attachedDeposit: new BN(1),
  });
  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "move_contract_funds_to_collection",
    args: {
      collection: {
        type: "NFTContract",
        account_id: nftCollection2Account.accountId,
      },
      token_id: auroraTokenAccount.accountId,
      amount: "1000000000000000000000",
    },
    attachedDeposit: new BN(1),
  });

  await ownerAccount.functionCall({
    contractId: usdtTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "1000000000000",
      memo: null,
      msg: JSON.stringify({
        type: "CollectionOwnerDeposit",
        collection: {
          type: "NFTContract",
          account_id: nftCollection2Account.accountId,
        },
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  // create staking program 3
  const collection_rps3 = {};
  collection_rps3[lockedTokenAccount.accountId] = "20000000000000";
  collection_rps3[auroraTokenAccount.accountId] = "20000000000000";
  collection_rps3[usdtTokenAccount.accountId] = "30";
  const createStakingPayload3 = {
    collection_address: nftCollection3Account.accountId,
    collection_owner: ownerAccount.accountId,
    token_address: usdtTokenAccount.accountId,
    collection_rps: collection_rps3,
    min_staking_period: "10000000000000",
    early_withdraw_penalty: "1000000000000",
    round_interval: 10,
  };
  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "create_staking_program",
    args: {
      payload: createStakingPayload3,
    },
    attachedDeposit: new BN(1),
    gas: new BN(300000000000000),
  });

  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "move_contract_funds_to_collection",
    args: {
      collection: {
        type: "NFTContract",
        account_id: nftCollection3Account.accountId,
      },
      token_id: lockedTokenAccount.accountId,
      amount: "1000000000000000000000",
    },
    attachedDeposit: new BN(1),
  });
  await ownerAccount.functionCall({
    contractId: nftStaking.accountId,
    methodName: "move_contract_funds_to_collection",
    args: {
      collection: {
        type: "NFTContract",
        account_id: nftCollection3Account.accountId,
      },
      token_id: auroraTokenAccount.accountId,
      amount: "1000000000000000000000",
    },
    attachedDeposit: new BN(1),
  });

  await ownerAccount.functionCall({
    contractId: usdtTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "1000000000000",
      memo: null,
      msg: JSON.stringify({
        type: "CollectionOwnerDeposit",
        collection: {
          type: "NFTContract",
          account_id: nftCollection3Account.accountId,
        },
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });
}

testnetSetup();
