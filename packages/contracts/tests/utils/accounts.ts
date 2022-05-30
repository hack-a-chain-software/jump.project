/* eslint-disable @typescript-eslint/no-loss-of-precision */
import BN from "bn.js";
import { KeyPair, Account } from "near-api-js";
import { setupNearWithEnvironment } from "./setupNear";

const PerYoctoNEAR = 10000000000000000000000;

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

  await masterAccount.createAccount(
    "staking.test.near",
    stakingContractKey.getPublicKey(),
    new BN(10)
  );

  await masterAccount.createAccount(
    "token.test.near",
    tokenContractKey.getPublicKey(),
    new BN(10)
  );
  await masterAccount.createAccount(
    "testacc.test.near",
    testAccountkey.getPublicKey(),
    new BN(10)
  );

  const stakingAccount = new Account(near.connection, "staking.test.near");
  const tokenAccount = new Account(near.connection, "token.test.near");
  const testAccount = new Account(near.connection, "testacc.test.near");

  console.log("Accounts Created");

  // This will fund the acounts with some yoctoNEAR to be sure that the
  await masterAccount.sendMoney(
    stakingAccount.accountId,
    new BN(1819999999999999999500)
  );
  await masterAccount.sendMoney(
    tokenAccount.accountId,
    new BN(1819999999999999999500)
  );
  await masterAccount.sendMoney(
    testAccount.accountId,
    new BN(1819999999999999999500)
  );

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
