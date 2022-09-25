const nearAPI = require("near-api-js");
const { KeyPair } = require("near-workspaces");
const fs = require("fs");

function storeData(data, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function createAccount(account_id, execution_data) {
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.publicKey;
  await execution_data.keyStore.setKey(
    execution_data.config.networkId,
    account_id,
    keyPair
  );
  try {
    await execution_data.accountCreator.createAccount(account_id, publicKey);
    return await execution_data.near.account(account_id);
  } catch (err) {
    if (err.toString().includes("TooManyRequestsError:")) {
      await sleep(1000 * 60 * 1);
      return await createAccount(account_id, execution_data);
    } else {
      throw err;
    }
  }
}

async function registerContracts(users, contracts) {
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
}

async function deployToken(
  newTokenName,
  total_supply,
  metadata,
  execution_data
) {
  const tokenContract = fs.readFileSync("../../out/tokenContract.wasm");
  const tokenName = execution_data.accountMap.prefix + newTokenName;
  const account = await createAccount(
    execution_data.accountMap.prefix + newTokenName,
    execution_data
  );
  await account.deployContract(tokenContract);
  await account.functionCall({
    contractId: account.accountId,
    methodName: "new",
    args: {
      owner_id: execution_data.connAccountMap.ownerAccount.accountId,
      total_supply,
      metadata,
    },
  });
  execution_data.connAccountMap.tokenName = account;
  execution_data.cccountMap.tokenName = account.accountId;
}

module.exports = { storeData, createAccount, registerContracts, deployToken };
