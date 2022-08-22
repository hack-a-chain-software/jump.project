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

  async function sendTokens(tokenAccount, quantity, receiver) {
    await ownerAccount.functionCall({
      contractId: tokenAccount,
      methodName: "storage_deposit",
      args: {
        account_id: receiver,
        registration_only: false,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN("1500000000000000000000000"),
    });
    await ownerAccount.functionCall({
      contractId: tokenAccount,
      methodName: "ft_transfer",
      args: {
        receiver_id: receiver,
        amount: quantity,
        memo: null,
      },
      attachedDeposit: new BN(1),
      gas: new BN("300000000000000"),
    });
  }

  async function mintNft(nftCollection, receiver) {
    console.log(nftCollection);
    await ownerAccount.functionCall({
      contractId: nftCollection,
      methodName: "nft_mint",
      args: {
        receiver_id: receiver,
      },
      attachedDeposit: new BN("1000000000000000000000000"),
      gas: new BN("300000000000000"),
    });
  }

  for (const seededUser of seededUsers) {
    // send usdt to invest in launchpad listings
    await sendTokens(accountMap.usdtTokenAccount, "10000000", seededUser);
    // send jump token to be able to invest in launchpad
    await sendTokens(
      accountMap.jumpTokenAccount,
      "10000000000000000000",
      seededUser
    );
    // send locked jump token to be able to check vesting page
    await sendTokens(
      accountMap.lockedTokenAccount,
      "10000000000000000000",
      seededUser
    );

    // mint nfts
    for (let i = 0; i < 4; i++) {
      await mintNft(accountMap.nftCollection1Account, seededUser);
      await mintNft(accountMap.nftCollection2Account, seededUser);
      await mintNft(accountMap.nftCollection3Account, seededUser);

      await mintNft(accountMap["Good Fortune Felines"], seededUser);
      await mintNft(accountMap["Nephilim"], seededUser);
      await mintNft(accountMap["El Café Cartel - Gen 1"], seededUser);
      await mintNft(accountMap["Near Tinker Union"], seededUser);
      await mintNft(accountMap["The Dons"], seededUser);
      await mintNft(accountMap["Near Future: Classic Art"], seededUser);
      await mintNft(accountMap["NEARton NFT"], seededUser);
      await mintNft(accountMap["Antisocial Ape Club"], seededUser);
      await mintNft(accountMap["Mara"], seededUser);
      await mintNft(accountMap["MR. BROWN"], seededUser);
      await mintNft(accountMap["Bullish Bulls"], seededUser);
    }
  }
}

testnetSeed(process.argv);
