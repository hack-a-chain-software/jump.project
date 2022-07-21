import create from "zustand";
import { Contract, WalletConnection } from "near-api-js";

import {
  getAmount,
  Transaction,
  executeMultipleTransactions,
} from "../hooks/near";

export const useNftStaking = create<{
  contract: any;
  init: (connection: WalletConnection) => Promise<void>;
  stake: (
    connection: WalletConnection,
    collection: any,
    tokenId: string
  ) => Promise<void>;
  unstakeAll: () => Promise<void>;
  unstake: () => Promise<void>;
  claimRewards: () => Promise<void>;
  viewStaked: () => Promise<any>;
}>((set, get) => ({
  contract: null,

  init: async (connection: WalletConnection) => {
    if (get().contract) {
      return;
    }

    const account = await connection.account();

    const contract = new Contract(
      account,
      import.meta.env.VITE_STAKING_CONTRACT,
      {
        viewMethods: ["view_staked", "storage_balance_of"],
        changeMethods: [
          "unstake",
          "claim_rewards",
          "storage_deposit",
          "withdraw_reward",
        ],
      }
    );

    try {
      set({
        contract,
      });
    } catch (e) {
      console.warn(e);
    }
  },

  viewStaked: async () => {
    return await get().contract?.view_staked({
      account_id: "mateussantana.testnet",
      collection: {
        type: "NFTContract",
        account_id: "negentra_base_nft",
      },
    });
  },

  stake: async (
    connection: WalletConnection,
    collection: any,
    tokenId: string
  ) => {
    const transactions: Transaction[] = [];

    try {
      const stakingStorage = await get().contract?.storage_balance_of({
        account_id: collection.contractId,
      });

      if (!stakingStorage || stakingStorage.total < "0.10") {
        transactions.push({
          receiverId: import.meta.env.VITE_STAKING_CONTRACT,
          functionCalls: [
            {
              methodName: "storage_deposit",
              args: {
                account_id: collection.contractId,
                registration_only: false,
              },
              amount: "0.25",
            },
          ],
        });
      }
    } catch (e) {
      console.warn(e);
    }

    transactions.push({
      receiverId: collection.contractId,
      functionCalls: [
        {
          methodName: "nft_transfer_call",
          args: {
            receiver_id: import.meta.env.VITE_STAKING_CONTRACT,
            token_id: tokenId,
            approval_id: null,
            memo: null,
            msg: JSON.stringify({
              type: "Stake",
            }),
          },
        },
      ],
    });

    executeMultipleTransactions(transactions, connection);
  },

  unstake: async () => {
    //
  },

  unstakeAll: async () => {
    //
  },

  claimRewards: async () => {
    //
  },
}));
