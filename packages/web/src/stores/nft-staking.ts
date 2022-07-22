import create from "zustand";
import { Contract, WalletConnection } from "near-api-js";
import { Transaction, executeMultipleTransactions } from "../hooks/near";

export const useNftStaking = create<{
  contract: any;
  connection: WalletConnection | null;
  init: (connection: WalletConnection) => Promise<void>;
  stake: (collection: any, tokenId: string) => Promise<void>;
  unstake: (tokens: Array<string>) => Promise<void>;
  claimRewards: () => Promise<void>;
  viewStaked: () => Promise<any>;
}>((set, get) => ({
  contract: null,
  connection: null,

  init: async (connection: WalletConnection) => {
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
        connection,
      });
    } catch (e) {
      console.warn(e);
    }
  },

  stake: async (collection: string, tokenId: string) => {
    const transactions: Transaction[] = [];

    try {
      const stakingStorage = await get().contract?.storage_balance_of({
        account_id: get().connection?.getAccountId(),
      });

      if (!stakingStorage || stakingStorage.total < "0.10") {
        transactions.push({
          receiverId: import.meta.env.VITE_STAKING_CONTRACT,
          functionCalls: [
            {
              methodName: "storage_deposit",
              args: {
                account_id: get().connection?.getAccountId(),
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

    executeMultipleTransactions(
      transactions,
      get().connection as WalletConnection
    );
  },

  unstake: async (tokens: Array<string>) => {
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
                  account_id: "negentra_base_nft.testnet",
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

  viewStaked: async () => {
    try {
      return await get().contract?.view_staked({
        account_id: "mateussantana.testnet",
        collection: {
          type: "n_f_t_contract",
          account_id: "negentra_base_nft.testnet",
        },
      });
    } catch (e) {
      console.log(e);

      return;
    }
  },
}));
