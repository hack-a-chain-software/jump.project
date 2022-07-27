import create from "zustand";
import toast from "react-hot-toast";
import isEmpty from "lodash/isEmpty";
import { Contract, WalletConnection } from "near-api-js";
import { Transaction, executeMultipleTransactions } from "../hooks/near";
import { NearMutableContractCall } from "@near/ts";
import { NearConstants } from "@jump/src/constants";

interface NFTStakingContract extends Contract {
  storage_balance_of: NearMutableContractCall<{ account_id: string }>;
}

export const useNftStaking = create<{
  contract: NFTStakingContract | null;
  connection: WalletConnection | null;
  validate: (tokens: Array<string>, message?: string) => void;
  init: (connection: WalletConnection) => Promise<void>;
  stake: (collection: any, tokenId: string) => Promise<void>;
  unstake: (tokens: Array<string>, collection: string) => Promise<void>;
  claimRewards: (tokens: Array<string>) => Promise<void>;
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
            viewMethods: ["storage_balance_of"],
            changeMethods: ["storage_deposit"],
          }
        ) as NFTStakingContract,
      });
    } catch (e) {
      console.warn(e);
    }
  },

  stake: async (collection: string, tokenId: string) => {
    const { contract, connection } = get();

    const transactions: Transaction[] = [];

    try {
      const stakingStorage = await contract?.storage_balance_of(
        {
          account_id: connection?.getAccountId(),
        },
        NearConstants.AttachedGas,
        NearConstants.OneYOctoNear
      );

      if (!stakingStorage || stakingStorage.total < "0.10") {
        transactions.push({
          receiverId: import.meta.env.VITE_STAKING_CONTRACT,
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
    const { validate, connection } = get();

    try {
      validate(tokens);
    } catch (e) {
      console.warn(e);

      return;
    }

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
            gas: NearConstants.AttachedGas,
          },
        ],
      });
    });

    executeMultipleTransactions(transactions, connection as WalletConnection);
  },

  claimRewards: async (tokens: Array<string>) => {
    //
    const { validate } = get();

    try {
      validate(tokens, "You don't have rewards available");
    } catch (e) {
      console.warn(e);

      return;
    }
  },

  validate: (
    tokens: Array<string>,
    message = "Ooops! Select tokens to continue"
  ) => {
    const { connection, contract } = get();

    if (!connection || !contract) {
      throw toast("connect wallet pls");
    }

    if (isEmpty(tokens)) {
      throw toast(message);
    }
  },
}));
