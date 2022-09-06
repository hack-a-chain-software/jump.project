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

  let invalidSet = new Set();
  let callbackList = [];

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

  function invalidCallback(user, err) {
    const err_string = err.toString();
    if (err_string.includes("account ID is invalid")) {
      invalidSet.add(user);
    } else {
      throw err;
    }
  }

  async function mintNft(nftCollection, receiver) {
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

  for (let seededUser of seededUsers) {
    seededUser = seededUser.toLowerCase();
    // send usdt to invest in launchpad listings
    callbackList.push(
      sendTokens(accountMap.usdtTokenAccount, "1000000000", seededUser).catch(
        (e) => invalidCallback(seededUser, e)
      )
    );

    // send jump token to be able to invest in launchpad
    callbackList.push(
      sendTokens(
        accountMap.jumpTokenAccount,
        "10000000000000000000",
        seededUser
      ).catch((e) => invalidCallback(seededUser, e))
    );
    // send locked jump token to be able to check vesting page
    callbackList.push(
      sendTokens(
        accountMap.lockedTokenAccount,
        "10000000000000000000",
        seededUser
      ).catch((e) => invalidCallback(seededUser, e))
    );

    // mint nfts
    for (let i = 0; i < 1; i++) {
      callbackList.push(
        mintNft(accountMap.nftCollection1Account, seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap.nftCollection2Account, seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap.nftCollection3Account, seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );

      callbackList.push(
        mintNft(accountMap["Good Fortune Felines"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["Nephilim"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["El Café Cartel - Gen 1"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["Near Tinker Union"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["The Dons"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["Near Future: Classic Art"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["NEARton NFT"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["Antisocial Ape Club"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["Mara"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["MR. BROWN"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
      callbackList.push(
        mintNft(accountMap["Bullish Bulls"], seededUser).catch((e) =>
          invalidCallback(seededUser, e)
        )
      );
    }
  }

  await Promise.all(callbackList);
  console.log("Invalid account IDs:", invalidSet);
}

async function batched(all) {
  function* chunks(arr, n) {
    for (let i = 0; i < arr.length; i += n) {
      yield arr.slice(i, i + n);
    }
  }
  let count = 0;
  for (let chunk of chunks(all, 10)) {
    count += chunk.length;
    console.log(count);
    await testnetSeed(chunk);
  }
}

batched(process.argv);
