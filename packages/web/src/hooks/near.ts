import BN from "bn.js";
import React from "react";
import { baseDecode } from "borsh";
import { ConnectConfig, utils, WalletConnection } from "near-api-js";
import {
  functionCall,
  createTransaction,
  Action,
} from "near-api-js/lib/transaction";
import { NearEnvironment, NearProvider } from "react-near";

const { PublicKey } = utils;

export const ProviderNear: React.FC<
  {
    environment?: NearEnvironment;
    children?: React.ReactNode;
  } & Partial<ConnectConfig>
> = NearProvider as any;

export interface TransactionFunctionCallOptions {
  gas?: string;
  amount?: string;
  methodName: string;
  args: object;
}

interface Transaction {
  receiverId: string;
  functionCalls: TransactionFunctionCallOptions[];
}

export const getGas = (gas?: string): BN =>
  gas ? new BN(gas) : new BN("100000000000000");

export const getAmount = (amount?: string): BN => {
  const value = utils.format.parseNearAmount(amount);

  return new BN(value || "1");
};

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  connection: WalletConnection
) => {
  const nearTransactions = await Promise.all(
    transactions.map(({ receiverId, functionCalls }, index) => {
      return getTransaction(
        connection,
        receiverId,
        index + 1,
        functionCalls.map(({ methodName, args, gas, amount }) =>
          functionCall(methodName, args, getGas(gas), getAmount(amount))
        )
      );
    })
  );

  return connection.requestSignTransactions(nearTransactions);
};

export const getTransaction = async (
  connection: WalletConnection,
  receiverId: string,
  nonceOffset: string | number,
  actions: Action[]
) => {
  const account = connection.account();

  const localKey = await account.connection.signer.getPublicKey(
    account.accountId,
    account.connection.networkId
  );

  const accessKey = await account.accessKeyForTransaction(
    receiverId,
    actions,
    localKey
  );

  if (!accessKey) {
    throw new Error(
      `Cannot find matching key for transaction sent to ${receiverId}`
    );
  }

  const block = await account.connection.provider.block({ finality: "final" });

  const blockHash = baseDecode(block.header.hash);

  const publicKey = PublicKey.from(accessKey.public_key);

  const nonce = accessKey.access_key.nonce + nonceOffset;

  return createTransaction(
    account.accountId,
    publicKey,
    receiverId,
    nonce,
    actions,
    blockHash
  );
};
