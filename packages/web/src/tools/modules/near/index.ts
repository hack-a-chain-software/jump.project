import BN from "bn.js";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { baseDecode } from "borsh";
import { utils, WalletConnection } from "near-api-js";
import {
  functionCall,
  createTransaction,
  Action,
} from "near-api-js/lib/transaction";

const { PublicKey } = utils;

export const getGas = (gas?: string): BN =>
  gas ? new BN(gas) : new BN("100000000000000");

export const getAmount = (amount?: string | undefined): BN => {
  const value = amount ? utils.format.parseNearAmount(amount) : "1";

  return new BN(String(value));
};

export interface TransactionFunctionCallOptions {
  gas?: string;
  amount?: string;
  methodName: string;
  args: object;
}

export interface Transaction {
  receiverId: string;
  functionCalls: TransactionFunctionCallOptions[];
}

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
