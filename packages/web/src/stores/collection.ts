import create from "zustand";
import { Contract, WalletConnection } from "near-api-js";

export const useCollection = create<{
  contract: any;
  init: (
    walletConnection: WalletConnection,
    collectionId: string
  ) => Promise<void>;
  getTokens: (walletConnection: WalletConnection) => Promise<any>;
}>((set, get) => ({
  contract: null,

  init: async (walletConnection: WalletConnection, collectionId: string) => {
    if (get().contract && get().contract.contractId === collectionId) {
      return;
    }

    const account = await walletConnection.account();

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

  getTokens: async (
    walletConnection: WalletConnection,
    collectionId: string = "negentra_base_nft.testnet"
  ) => {
    if (!get().contract) {
      await get().init(walletConnection, collectionId);
    }

    const account = await walletConnection.account();

    const nfts = await get().contract?.nft_tokens_for_owner({
      account_id: account.accountId,
    });

    console.log(nfts);

    return nfts;
  },
}));
