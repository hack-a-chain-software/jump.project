import create from "zustand";
import { Contract, WalletConnection } from "near-api-js";
import { Transaction, executeMultipleTransactions } from "../hooks/near";

export const useNftStaking = create<{
  contract: any;
  connection: WalletConnection;
  init: (connection: WalletConnection) => Promise<void>;
  stake: (collection: any, tokenId: string) => Promise<void>;
  unstake: (tokens: Array<string>, collection: string) => Promise<void>;
  claimRewards: () => Promise<void>;
}>((set, get) => ({
  contract: null,
  connection: null,

  init: async (connection: WalletConnection) => {
    try {
      set({
        connection: connection as WalletConnection,
        contract: new Contract(
          connection.account(),
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
        ),
      });
    } catch (e) {
      console.warn(e);
    }
  },

  stake: async (collection: string, tokenId: string) => {
    const transactions: Transaction[] = [];

    const { contract, connection } = get();

    try {
      const stakingStorage = await contract.storage_balance_of({
        account_id: connection.getAccountId(),
      });

      if (!stakingStorage || stakingStorage.total < "0.10") {
        transactions.push({
          receiverId: import.meta.env.VITE_STAKING_CONTRACT,
          functionCalls: [
            {
              methodName: "storage_deposit",
              args: {
                account_id: connection.getAccountId(),
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
      receiverId: collection,
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

    executeMultipleTransactions(transactions, connection as WalletConnection);
  },

  unstake: async (tokens: Array<string>, collection: string) => {
    const transactions: any = [];

    tokens.forEach((item) => {
      transactions.push({
        receiverId: import.meta.env.VITE_STAKING_CONTRACT,
        functionCalls: [
          {
            methodName: "unstake",
            args: {
              token_id: [
                {
                  type: "n_f_t_contract",
                  account_id: collection,
                },
                item,
              ],
            },
            gas: "300000000000000",
          },
        ],
      });
    });

    executeMultipleTransactions(
      transactions,
      get().connection as WalletConnection
    );
  },

  claimRewards: async () => {
    //
  },
}));
