const nearAPI = require("near-api-js");
const { homedir } = require("os");
const { BN } = require("near-workspaces");
const fs = require("fs");
const path = require("path");

const { connect, keyStores } = nearAPI;

async function testnetSeed(seededUsers) {
  seededUsers.splice(0, 2);

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

  const accountMapRaw = fs.readFileSync("account_map.json");
  const accountMap = JSON.parse(accountMapRaw);

  const ownerAccount = await near.account(accountMap.ownerAccount);

  for (const seededUser of seededUsers) {
    // send usdt to invest in launchpad listings
    const usdtQuantity = "10000000";
    await ownerAccount.functionCall({
      contractId: accountMap.usdtTokenAccount,
      methodName: "storage_deposit",
      args: {
        account_id: seededUser,
        registration_only: false,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN("1500000000000000000000000"),
    });
    await ownerAccount.functionCall({
      contractId: accountMap.usdtTokenAccount,
      methodName: "ft_transfer",
      args: {
        receiver_id: seededUser,
        amount: usdtQuantity,
        memo: null,
      },
      attachedDeposit: new BN(1),
      gas: new BN("300000000000000"),
    });

    // send jump token to be able to invest in launchpad
    const jumpQuantity = "10000000000000000000";
    await ownerAccount.functionCall({
      contractId: accountMap.jumpTokenAccount,
      methodName: "storage_deposit",
      args: {
        account_id: seededUser,
        registration_only: false,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN("1500000000000000000000000"),
    });
    await ownerAccount.functionCall({
      contractId: accountMap.jumpTokenAccount,
      methodName: "ft_transfer",
      args: {
        receiver_id: seededUser,
        amount: jumpQuantity,
        memo: null,
      },
      attachedDeposit: new BN(1),
      gas: new BN("300000000000000"),
    });

    // mint nfts
    for (let i = 0; i < 4; i++) {
      await ownerAccount.functionCall({
        contractId: accountMap.nftCollection1Account,
        methodName: "nft_mint",
        args: {
          receiver_id: seededUser,
        },
        attachedDeposit: new BN("1000000000000000000000000"),
        gas: new BN("300000000000000"),
      });
    }

    for (let i = 0; i < 2; i++) {
      await ownerAccount.functionCall({
        contractId: accountMap.nftCollection2Account,
        methodName: "nft_mint",
        args: {
          receiver_id: seededUser,
        },
        attachedDeposit: new BN("1000000000000000000000000"),
        gas: new BN("300000000000000"),
      });
    }

    for (let i = 0; i < 3; i++) {
      await ownerAccount.functionCall({
        contractId: accountMap.nftCollection3Account,
        methodName: "nft_mint",
        args: {
          receiver_id: seededUser,
        },
        attachedDeposit: new BN("1000000000000000000000000"),
        gas: new BN("300000000000000"),
      });
    }
  }
}

testnetSeed(process.argv);
