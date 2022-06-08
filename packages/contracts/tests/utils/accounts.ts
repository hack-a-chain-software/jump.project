/* eslint-disable @typescript-eslint/no-loss-of-precision */
import BN from "bn.js";
import { KeyPair, Account, utils } from "near-api-js";
import { setupNearWithEnvironment } from "./setupNear";
import { v4 } from "uuid";

export async function setupNearWithContractAccounts() {
  const { near, config } = await setupNearWithEnvironment();

  const masterAccount = new Account(near.connection, "test.near");

  console.log("Master Account initialized");

  const stakingContractKey = KeyPair.fromRandom("ed25519");
  const tokenContractKey = KeyPair.fromRandom("ed25519");
  const testAccountkey = KeyPair.fromRandom("ed25519");

  const masterBalance = await masterAccount.getAccountBalance();

  console.log("Keypairs Generated");

  console.log("Master Account Balance", masterBalance.available);

  const stakingAccountName = `${v4().slice(0, 15)}.test.near`;
  const tokenAccountName = `${v4().slice(0, 15)}.test.near`;
  const testAccountName = `${v4().slice(0, 15)}.test.near`;

  await masterAccount.createAccount(
    stakingAccountName,
    stakingContractKey.getPublicKey(),
    new BN(utils.format.parseNearAmount("100")!)
  );

  await masterAccount.createAccount(
    tokenAccountName,
    tokenContractKey.getPublicKey(),
    new BN(utils.format.parseNearAmount("100")!)
  );

  await masterAccount.createAccount(
    testAccountName,
    testAccountkey.getPublicKey(),
    new BN(utils.format.parseNearAmount("100")!)
  );

  config.keyStore.setKey(
    config.networkId,
    stakingAccountName,
    stakingContractKey
  );
  config.keyStore.setKey(config.networkId, tokenAccountName, tokenContractKey);
  config.keyStore.setKey(config.networkId, testAccountName, testAccountkey);

  const stakingAccount = new Account(near.connection, stakingAccountName);
  const tokenAccount = new Account(near.connection, tokenAccountName);
  const testAccount = new Account(near.connection, testAccountName);

  console.log("Accounts Created");

  const stakingAccountBalance = await stakingAccount.getAccountBalance();
  const tokenAccountBalance = await tokenAccount.getAccountBalance();

  console.log("Balances", stakingAccountBalance, tokenAccountBalance);

  return {
    near,
    config,
    stakingAccount,
    tokenAccount,
    testAccount,
    masterAccount,
  };
}
