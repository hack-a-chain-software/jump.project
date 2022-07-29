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
  const random_prefix = crypto.randomBytes(20).toString("hex");
  const accountMap = {
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
  };

  const storeData = (data, path) => {
    try {
      fs.writeFileSync(path, JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };
  storeData(accountMap, "./account_map.json");

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

  // create account function
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
        icon: "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 288 288' style='enable-background:new 0 0 288 288;' xml:space='preserve'%3E %3Cstyle type='text/css'%3E .st0%7Bfill:%2370D44B;%7D .st1%7Bfill:%23FFFFFF;%7D %3C/style%3E %3Cpath class='st0' d='M144,0L144,0c79.5,0,144,64.5,144,144v0c0,79.5-64.5,144-144,144h0C64.5,288,0,223.5,0,144v0 C0,64.5,64.5,0,144,0z'/%3E %3Cpath class='st1' d='M144,58.8c7.6,0,14.5,4.3,17.9,11.1l56.2,112.5c4.9,9.9,0.9,21.9-9,26.8c-2.8,1.4-5.8,2.1-8.9,2.1H87.8 c-11,0-20-9-20-20c0-3.1,0.7-6.2,2.1-8.9l56.2-112.5C129.5,63,136.4,58.7,144,58.8 M144,45c-12.8,0-24.5,7.2-30.2,18.7L57.6,176.2 c-8.3,16.7-1.6,36.9,15.1,45.3c4.7,2.3,9.9,3.6,15.1,3.6h112.5c18.6,0,33.8-15.1,33.8-33.7c0-5.2-1.2-10.4-3.6-15.1L174.2,63.7 C168.5,52.2,156.8,45,144,45z'/%3E %3C/svg%3E",
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
        icon: "data:image/png;base64,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",
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
        name: "Classy Kangaroo NFT",
        symbol: "ROO",
        icon: null,
        base_uri:
          "https://bafybeic3unknzrqczvuzhcx2d3dflqush2n2awz3t7usgtyuwosfrju65m.ipfs.dweb.link",
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
        jumpTokenAccount.accountId,
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
    project_token: skywardTokenAccount.accountId,
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
    contractId: skywardTokenAccount.accountId,
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
    contractId: jumpTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "300000000000000",
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
      amount: "300000000000000",
      memo: null,
      msg: JSON.stringify({ type: "OwnerDeposit" }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  const collection_rps = {};
  collection_rps[jumpTokenAccount.accountId] = "1000";
  collection_rps[auroraTokenAccount.accountId] = "1000";
  collection_rps[usdtTokenAccount.accountId] = "1000";
  const createStakingPayload = {
    collection_address: nftCollection1Account.accountId,
    collection_owner: ownerAccount.accountId,
    token_address: usdtTokenAccount.accountId,
    collection_rps,
    min_staking_period: "10000000000000",
    early_withdraw_penalty: "1000000000000",
    round_interval: 200,
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
      token_id: jumpTokenAccount.accountId,
      amount: "10000000000000",
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
      amount: "10000000000000",
    },
    attachedDeposit: new BN(1),
  });

  await ownerAccount.functionCall({
    contractId: usdtTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "10000000000000",
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
  collection_rps2[jumpTokenAccount.accountId] = "1000";
  collection_rps2[auroraTokenAccount.accountId] = "1000";
  collection_rps2[usdtTokenAccount.accountId] = "1000";
  const createStakingPayload2 = {
    collection_address: nftCollection2Account.accountId,
    collection_owner: ownerAccount.accountId,
    token_address: usdtTokenAccount.accountId,
    collection_rps: collection_rps2,
    min_staking_period: "10000000000000",
    early_withdraw_penalty: "1000000000000",
    round_interval: 200,
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
      token_id: jumpTokenAccount.accountId,
      amount: "10000000000000",
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
      amount: "10000000000000",
    },
    attachedDeposit: new BN(1),
  });

  await ownerAccount.functionCall({
    contractId: usdtTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "10000000000000",
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
  collection_rps3[jumpTokenAccount.accountId] = "1000";
  collection_rps3[auroraTokenAccount.accountId] = "1000";
  collection_rps3[usdtTokenAccount.accountId] = "1000";
  const createStakingPayload3 = {
    collection_address: nftCollection3Account.accountId,
    collection_owner: ownerAccount.accountId,
    token_address: usdtTokenAccount.accountId,
    collection_rps: collection_rps3,
    min_staking_period: "10000000000000",
    early_withdraw_penalty: "1000000000000",
    round_interval: 200,
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
      token_id: jumpTokenAccount.accountId,
      amount: "10000000000000",
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
      amount: "10000000000000",
    },
    attachedDeposit: new BN(1),
  });

  await ownerAccount.functionCall({
    contractId: usdtTokenAccount.accountId,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: nftStaking.accountId,
      amount: "10000000000000",
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
