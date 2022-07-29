import create from "zustand";
import { WalletConnection } from "near-api-js";
import { Transaction, executeMultipleTransactions } from "../hooks/near";

export const useVestingStore = create<{
  fastPass: (
    vesting: string,
    storage: any,
    amount: number,
    connection: WalletConnection
  ) => Promise<void>;
  withdraw: (
    vesting: string,
    storage: any,
    connection: WalletConnection
  ) => Promise<void>;
}>(() => ({
  withdraw: async (
    vesting: string,
    storage: any,
    connection: WalletConnection
  ) => {
    const transactions: Transaction[] = [];

    if (!storage || storage.total < "0.10") {
      transactions.push({
        receiverId: "jump_token.testnet",
        functionCalls: [
          {
            methodName: "storage_deposit",
            args: {
              account_id: connection?.getAccountId(),
              registration_only: false,
            },
            amount: "0.25",
          },
        ],
      });
    }

    transactions.push({
      receiverId: import.meta.env.VITE_LOCKED_CONTRACT,
      functionCalls: [
        {
          methodName: "withdraw_locked_tokens",
          args: {
            vesting_id: vesting,
          },
        },
      ],
    });

    executeMultipleTransactions(transactions, connection as WalletConnection);
  },

  fastPass: async (
    vesting: string,
    storage: any,
    amount: number,
    connection: WalletConnection
  ) => {
    const transactions: Transaction[] = [];

    if (!storage || storage.total < "0.10") {
      transactions.push({
        receiverId: "jump_token.testnet",
        functionCalls: [
          {
            methodName: "storage_deposit",
            args: {
              account_id: connection?.getAccountId(),
              registration_only: false,
            },
            amount: "0.25",
          },
        ],
      });
    }

    transactions.push({
      receiverId: "jump_token.testnet",
      functionCalls: [
        {
          methodName: "ft_transfer_call",
          args: {
            amount: String(amount * 0.05),
            receiver_id: import.meta.env.VITE_LOCKED_CONTRACT,
            memo: null,
            msg: JSON.stringify({
              type: "BuyFastPass",
              account_id: connection?.getAccountId(),
              vesting_index: vesting,
            }),
          },
        },
      ],
    });

    executeMultipleTransactions(transactions, connection as WalletConnection);
  },
}));
