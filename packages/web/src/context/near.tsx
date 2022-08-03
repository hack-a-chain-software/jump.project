import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useStaking } from "@/stores/staking-store";
import { WalletConnection, Account } from "near-api-js";
import {
  useEffect,
  createContext,
  useMemo,
  PropsWithChildren,
  useContext,
} from "react";
import { useNearUser, useNearWallet } from "react-near";

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

const nearContractsContext = createContext<INearContext | null>(null);

export const NearContractsProvider: React.FC<
  PropsWithChildren<Record<any, any>>
> = ({ children }) => {
  const wallet = useNearWallet();

  const { init: initStaking } = useStaking();
  const { init: initLaunchpad } = useLaunchpadStore();

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
      initStaking(wallet);
      initLaunchpad(wallet);
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
  return useContext(nearContractsContext) as INearContext;
};
