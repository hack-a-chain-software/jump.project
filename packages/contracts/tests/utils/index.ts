// import path from "path";
import fs from "fs";
import { KeyPair, connect, Account } from "near-api-js";
import { UrlAccountCreator } from "near-api-js/lib/account_creator";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { Near, NearConfig } from "near-api-js/lib/near";
import { v4 } from "uuid";

export async function createFullAccessKey(config: NearConfig) {
  const account_id = `${v4()}`;
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey().toString();
  const near = await connect(config);
  const account = await near.account(account_id);
  await config.keyStore?.setKey(config.networkId, publicKey, keyPair);
  await account.addKey(publicKey);
  return {
    near,
    account,
  };
}

export const createTestAccount = async ({
  config,
  keyStore,
  near,
}: {
  near: Near;
  config: NearConfig;
  keyStore: InMemoryKeyStore;
}): Promise<Account> => {
  const UrlCreator = new UrlAccountCreator(near.connection, config.helperUrl!);

  const accountId = `${v4()}.testnet`;
  const randomKey = KeyPair.fromRandom("ed25519");

  await UrlCreator.createAccount(accountId, randomKey.getPublicKey());

  keyStore.setKey(config.networkId, accountId, randomKey);

  const account = await near.account(accountId);
  return account;
};

export async function deployContract(
  contractAccount: Account,
  staticPath: string
) {
  await contractAccount.deployContract(
    fs.readFileSync(__dirname + "/../" + staticPath)
  );
}
