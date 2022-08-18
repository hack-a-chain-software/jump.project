import create from "zustand";
import {
  viewFunction,
  getTransaction,
  executeMultipleTransactions,
} from "@/tools";
import { Token, Transaction } from "@near/ts";
import type { WalletSelector } from "@near-wallet-selector/core";

export const useNftStaking = create<{
  loading: boolean;
  tokens: Token[];
  fetchUserTokens: (
    connection: WalletSelector,
    account: string,
    collection: string
  ) => Promise<void>;
  stake: (
    connection: WalletSelector,
    account: string,
    collection: string,
    tokenId: string
  ) => Promise<void>;
  unstake: (
    connection: WalletSelector,
    account: string,
    tokens: string[],
    collection: string,
    rewards: any
  ) => Promise<void>;
  getTokenStorage: (
    connection: WalletSelector,
    account: string,
    token: string
  ) => Promise<any>;
}>((set, get) => ({
  tokens: [],
  loading: false,

  fetchUserTokens: async (connection, account, collection) => {
    set({
      loading: true,
    });

    try {
      const staked = await viewFunction(
        connection,
        import.meta.env.VITE_NFT_STAKING_CONTRACT,
        "view_staked",
        {
          account_id: account,
          collection: {
            type: "NFTContract",
            account_id: collection,
          },
        }
      );

      const tokens: Token[] = [];

      for (let i = 0; i < staked.length; i++) {
        const balance = await viewFunction(
          connection,
          import.meta.env.VITE_NFT_STAKING_CONTRACT,
          "view_staked_nft_balance",
          {
            nft_id: [
              {
                type: "NFTContract",
                account_id: collection,
              },
              staked[i],
            ],
          }
        );

        const { staked_timestamp } = await viewFunction(
          connection,
          import.meta.env.VITE_NFT_STAKING_CONTRACT,
          "view_staked_nft",
          {
            nft_id: [
              {
                type: "NFTContract",
                account_id: collection,
              },
              staked[i],
            ],
          }
        );

        const token = await viewFunction(connection, collection, "nft_token", {
          token_id: staked[i],
        });

        tokens.push({ ...token, balance, stakedAt: staked_timestamp });
      }

      set({
        tokens,
      });
    } catch (e) {
      console.warn(e);

      set({
        tokens: [],
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  stake: async (connection, account, collection, tokenId) => {
    const wallet = await connection.wallet();

    const transactions: Transaction[] = [];

    const stakingStorage = await get().getTokenStorage(
      connection,
      account,
      import.meta.env.VITE_NFT_STAKING_CONTRACT
    );

    if (!stakingStorage || stakingStorage?.available < "0.10") {
      transactions.push(
        getTransaction(
          account,
          import.meta.env.VITE_NFT_STAKING_CONTRACT,
          "storage_deposit",
          {
            account_id: account,
            registration_only: false,
          },
          "0.25"
        )
      );
    }

    transactions.push(
      getTransaction(account, collection, "nft_transfer_call", {
        receiver_id: import.meta.env.VITE_NFT_STAKING_CONTRACT,
        token_id: tokenId,
        approval_id: null,
        memo: null,
        msg: JSON.stringify({
          type: "Stake",
        }),
      })
    );

    executeMultipleTransactions(transactions, wallet);
  },

  unstake: async (connection, account, tokens, collection, balance) => {
    const wallet = await connection.wallet();

    const transactions: any = [];

    tokens.forEach((item) => {
      transactions.push(
        getTransaction(
          account,
          import.meta.env.VITE_NFT_STAKING_CONTRACT,
          "unstake",
          {
            token_id: [
              {
                type: "NFTContract",
                account_id: collection,
              },
              item,
            ],
          }
        )
      );
    });

    for (const key in balance) {
      if (balance[key] === "0") {
        continue;
      }

      const storage = await get().getTokenStorage(connection, account, key);

      if (!storage) {
        transactions.push(
          getTransaction(
            account,
            key,
            "storage_deposit",
            {
              account_id: account,
              registration_only: false,
            },
            "0.10"
          )
        );
      }
    }

    for (const key in balance) {
      if (balance[key] === "0") {
        continue;
      }

      transactions.push(
        getTransaction(
          account,
          import.meta.env.VITE_NFT_STAKING_CONTRACT,
          "withdraw_reward",
          {
            collection: {
              type: "NFTContract",
              account_id: collection,
            },
            token_id: key,
          }
        )
      );
    }

    executeMultipleTransactions(transactions, wallet);
  },

  getTokenStorage: async (connection, account, token) => {
    try {
      return await await viewFunction(connection, token, "storage_balance_of", {
        account_id: account,
      });
    } catch (e) {
      return;
    }
  },
}));
