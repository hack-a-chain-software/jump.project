import create from "zustand";
import {
  viewFunction,
  getTransaction,
  executeMultipleTransactions,
} from "@/tools";
import { Token, Transaction } from "@near/ts";
import type { WalletSelector } from "@near-wallet-selector/core";
import { utils } from "near-api-js";
import Big from "big.js";

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
    tokens: string[]
  ) => Promise<void>;
  unstake: (
    connection: WalletSelector,
    account: string,
    tokens: Token[],
    collection: string
  ) => Promise<void>;
  getTokenStorage: (
    connection: WalletSelector,
    account: string,
    token: string
  ) => Promise<any>;
  getMinStorageCost: (
    connection: WalletSelector,
    token: string
  ) => Promise<any>;
  claimRewards: (
    connection: WalletSelector,
    account: string,
    tokens: Token[],
    collection: string
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

      /*   console.log({
        staked,
        connection,
        account,
        collection,
        tokens,
      }); */

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

  stake: async (connection, account, collection, tokens) => {
    const wallet = await connection.wallet();

    const transactions: Transaction[] = [];

    const stakingStorage = await get().getTokenStorage(
      connection,
      account,
      import.meta.env.VITE_NFT_STAKING_CONTRACT
    );

    if (
      !stakingStorage ||
      new Big(stakingStorage?.available).lte("100000000000000000000000")
    ) {
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

    tokens.forEach((tokenId) => {
      let approval_id: number | null = null;
      //TODO: temporary fix for neartopia
      if (
        collection.includes("neartopia") ||
        collection.includes("secretskelliessociety")
      ) {
        approval_id = 0;
      }
      transactions.push(
        getTransaction(account, collection, "nft_transfer_call", {
          receiver_id: import.meta.env.VITE_NFT_STAKING_CONTRACT,
          token_id: tokenId,
          approval_id: approval_id,
          memo: null,
          msg: JSON.stringify({
            type: "Stake",
          }),
        })
      );
    });

    await executeMultipleTransactions(transactions, wallet);
  },

  unstake: async (connection, account, tokens, collection) => {
    const wallet = await connection.wallet();

    const transactions: any = [];

    tokens.forEach(({ token_id }) => {
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
              token_id,
            ],
          }
        )
      );
    });

    const balances = tokens.reduce<string[]>((current, { balance }) => {
      for (const key in balance) {
        if (balance[key] === "0" || current.includes(key)) {
          continue;
        }

        current.push(key);
      }

      return current;
    }, []);

    for (const key of balances) {
      const storage = await get().getTokenStorage(connection, account, key);
      const storageMin = await get().getMinStorageCost(connection, key);
      const nearStorageCost = utils.format.formatNearAmount(storageMin?.min);

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
            nearStorageCost
          )
        );
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

    await executeMultipleTransactions(transactions, wallet);
  },

  claimRewards: async (connection, account, tokens, collection) => {
    const wallet = await connection.wallet();

    const transactions: any = [];

    tokens.forEach(({ token_id }) => {
      transactions.push(
        getTransaction(
          account,
          import.meta.env.VITE_NFT_STAKING_CONTRACT,
          "claim_reward",
          {
            collection: {
              type: "NFTContract",
              account_id: collection,
            },
            token_id: [
              {
                type: "NFTContract",
                account_id: collection,
              },
              token_id,
            ],
          }
        )
      );
    });

    const balances = tokens.reduce<string[]>((current, { balance }) => {
      for (const key in balance) {
        if (balance[key] === "0" || current.includes(key)) {
          continue;
        }

        current.push(key);
      }

      return current;
    }, []);

    for (const key of balances) {
      const storage = await get().getTokenStorage(connection, account, key);
      const storageMin = await get().getMinStorageCost(connection, key);
      const nearStorageCost = utils.format.formatNearAmount(storageMin?.min);

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
            nearStorageCost
          )
        );
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
      return await viewFunction(connection, token, "storage_balance_of", {
        account_id: account,
      });
    } catch (e) {
      return;
    }
  },

  getMinStorageCost: async (connection, token) => {
    try {
      return await viewFunction(connection, token, "storage_balance_bounds");
    } catch (e) {
      return;
    }
  },
}));
