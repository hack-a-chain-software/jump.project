import create from "zustand";
import { Contract, WalletConnection } from "near-api-js";

export const useCollection = create<{
  contract: any;
  tokens: Array<any>;
  loading: boolean;
  init: (
    connection: WalletConnection | null,
    collectionId: string
  ) => Promise<void>;
  fetchTokens: (
    connection: WalletConnection | null,
    collectionId: string
  ) => Promise<any>;
}>((set, get) => ({
  tokens: [],
  loading: true,
  contract: null,

  init: async (connection: WalletConnection | null, collectionId: string) => {
    if (!connection || get().contract?.contractId === collectionId) {
      return;
    }

    const account = await connection.account();

    const contract = new Contract(account, collectionId, {
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

  fetchTokens: async (
    connection: WalletConnection | null,
    collectionId: string
  ) => {
    if (!connection) {
      return;
    }

    set({
      loading: true,
    });

    await get().init(connection, collectionId);

    const tokens = await get().contract?.nft_tokens_for_owner({
      account_id: connection.getAccountId(),
    });

    console.log(tokens);

    try {
      setTimeout(() => {
        set({
          tokens,
          loading: false,
        });
      }, 120);
    } catch (e) {
      console.warn(e);
    }

    return tokens;
  },
}));
