import create from "zustand";
import {
  Contract,
  WalletConnection,
  ConnectedWalletAccount,
} from "near-api-js";

export const useCollection = create<{
  contract: any;
  tokens: Array<any>;
  loading: boolean;
  initContract: (
    account: ConnectedWalletAccount,
    collection: string
  ) => Promise<void>;
  fetchTokens: (
    connection: WalletConnection,
    collection: string
  ) => Promise<void>;
}>((set, get) => ({
  tokens: [],
  loading: true,
  contract: null,

  initContract: async (account: ConnectedWalletAccount, collection: string) => {
    const contract = new Contract(account, collection, {
      viewMethods: ["nft_tokens_for_owner"],
      changeMethods: ["nft_transfer_call"],
    });

    try {
      set({
        contract,
      });
    } catch (e) {
      console.warn(e);
    }
  },

  fetchTokens: async (connection: WalletConnection, collection: string) => {
    set({
      loading: true,
    });

    const account = await connection.account();

    if (!get().contract || get().contract.account_id !== collection) {
      await get().initContract(account, collection);
    }

    const tokens = await get().contract?.nft_tokens_for_owner({
      account_id: account.accountId,
    });

    try {
      set({
        tokens,
        loading: false,
      });
    } catch (e) {
      console.warn(e);
    }
  },
}));
