import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import type { AccountView } from "near-api-js/lib/providers/provider";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
/* import { setupSender } from "@near-wallet-selector/sender"; */
/* import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect"; */
import { tokenMetadata } from "@/interfaces";
import { viewFunction } from "@/tools";

interface TokenInterface {
  balance?: string | number;
  metadata?: tokenMetadata;
}
interface WalletSelectorContextValue {
  selector: WalletSelector;
  accounts: AccountState[];
  accountId: string | null;
  showModal: boolean;
  token: TokenInterface | undefined;
  xToken: TokenInterface | undefined;
  signOut: () => Promise<void>;
  toggleModal: () => void;
}

export type Account = AccountView & {
  account_id: string;
};

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<
  PropsWithChildren<Record<any, any>>
> = ({ children }) => {
  const [accountId, setAccountId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [token, setToken] = useState<TokenInterface>();
  const [xToken, setXToken] = useState<TokenInterface>();
  const [loaded, setLoaded] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  const signOut = async () => {
    if (!selector) {
      return;
    }

    const wallet = await selector.wallet();

    wallet.signOut();
  };

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: import.meta.env.VITE_NEAR_NETWORK || "testnet",
      debug: true,
      modules: [
        /*   setupNightlyConnect({
          url: "wss://relay.nightly.app/app",
          appMetadata: {
            additionalInfo: "",
            application: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
          },
        }), */
        setupNearWallet(),
        setupMeteorWallet() /* setupSender() */,
      ],
    });

    const state = _selector.store.getState();

    setAccounts(state.accounts);
    setSelector(_selector);

    const tokenMetadata = await viewFunction(
      _selector,
      import.meta.env.VITE_BASE_TOKEN,
      "ft_metadata"
    );

    setToken({
      metadata: tokenMetadata,
      ...(token || undefined),
    });

    const xTokenMetadata = await viewFunction(
      _selector,
      import.meta.env.VITE_STAKING_CONTRACT,
      "ft_metadata"
    );

    setXToken({
      metadata: xTokenMetadata,
      ...(token || undefined),
    });

    setLoaded(true);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialize wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map(({ accounts }) => accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        setAccounts(nextAccounts);
        setShowModal(false);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  useEffect(() => {
    const newAccount =
      accounts.find((account) => account.active)?.accountId || "";

    setAccountId(newAccount);
  }, [accounts]);

  useEffect(() => {
    if (!accountId || !loaded) {
      return;
    }

    (async () => {
      const tokenBalance = await viewFunction(
        selector,
        import.meta.env.VITE_BASE_TOKEN,
        "ft_balance_of",
        {
          account_id: accountId,
        }
      );

      setToken({
        balance: tokenBalance,
        ...(token || null),
      });

      const xTokenBalance = await viewFunction(
        selector,
        import.meta.env.VITE_STAKING_CONTRACT,
        "ft_balance_of",
        {
          account_id: accountId,
        }
      );

      setXToken({
        balance: xTokenBalance,
        ...(xToken || null),
      });
    })();
  }, [accountId, loaded]);

  if (!selector) {
    return null;
  }

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        accounts,
        accountId,
        showModal,
        signOut,
        toggleModal,
        token,
        xToken,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
