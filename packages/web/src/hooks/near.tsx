import BN from "bn.js";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { baseDecode } from "borsh";
import { useNearWallet, useNearUser } from "react-near";
import { Account, ConnectConfig, utils, WalletConnection } from "near-api-js";
import {
  functionCall,
  createTransaction,
  Action,
} from "near-api-js/lib/transaction";
import { NearEnvironment, NearProvider } from "react-near";
import toast from "react-hot-toast";

const { PublicKey } = utils;

export const getNear = (contract: string) => {
  const wallet = useNearWallet();
  const user = useNearUser(contract);

  return {
    user,
    wallet,
  };
};

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

export interface Transaction {
  receiverId: string;
  functionCalls: TransactionFunctionCallOptions[];
}

export const getGas = (gas?: string): BN =>
  gas ? new BN(gas) : new BN("100000000000000");

export const getAmount = (amount?: string | undefined): BN => {
  const value = amount ? utils.format.parseNearAmount(amount) : "1";

  return new BN(String(value));
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

interface INearContext {
  isFullyConnected: boolean | undefined;
  contracts: {
    staking: {
      isConnected: boolean;
      address: string | null;
      account: Account | undefined;
      balance: number;
      refreshBalance: () => Promise<void>;
      connect: (
        title?: string | undefined,
        successUrl?: string | undefined,
        failureUrl?: string | undefined
      ) => Promise<void>;
      disconnect: () => Promise<void>;
      loading: boolean | undefined;
    };
    nftStaking: {
      isConnected: boolean;
      address: string | null;
      account: Account | undefined;
      balance: number;
      refreshBalance: () => Promise<void>;
      connect: (
        title?: string | undefined,
        successUrl?: string | undefined,
        failureUrl?: string | undefined
      ) => Promise<void>;
      disconnect: () => Promise<void>;
      loading: boolean | undefined;
    };
  };
  connectWallet: () => Promise<void>;
  wallet: WalletConnection | null;
  disconnectWallet: () => Promise<void>;
}

const nearContractsContext = createContext<Partial<INearContext>>({});

export const NearContractsProvider: React.FC<
  PropsWithChildren<Record<any, any>>
> = ({ children }) => {
  const wallet = useNearWallet();

  const nftStakingNearUser = useNearUser(
    import.meta.env.VITE_NFT_STAKING_CONTRACT
  );

  const stakingNearUser = useNearUser(import.meta.env.VITE_STAKING_CONTRACT);

  const connectWallet = async () => {
    if (!wallet) return console.warn("No Wallet Connected!");
    await wallet.requestSignIn();
    await nftStakingNearUser.connect();
    await stakingNearUser.connect();
  };

  const disconnectWallet = async () => {
    if (!wallet) return console.warn("No Wallet Connected!");
    await nftStakingNearUser.disconnect();
    await stakingNearUser.disconnect();
    wallet?.signOut();
  };

  useEffect(() => {
    if (wallet?.getAccountId()) {
      toast.success("Welcome " + wallet.getAccountId());
    }
  }, [wallet]);

  const isFullyConnected = useMemo(() => {
    return (
      wallet?.isSignedIn() &&
      stakingNearUser.isConnected &&
      nftStakingNearUser.isConnected
    );
  }, [wallet, stakingNearUser]);

  return (
    <nearContractsContext.Provider
      value={{
        connectWallet,
        contracts: {
          nftStaking: nftStakingNearUser,
          staking: stakingNearUser,
        },
        disconnectWallet,
        isFullyConnected,
        wallet,
      }}
    >
      {children}
    </nearContractsContext.Provider>
  );
};

export const useNearContractsAndWallet = () => {
  return useContext(nearContractsContext);
};
