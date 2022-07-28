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

export const useVestingStore = create<{
  contract: NFTStakingContract | null;
  connection: WalletConnection | null;
  validate: (tokens: Array<string>, message?: string) => void;
  init: (connection: WalletConnection) => Promise<void>;
  withdraw: (vesting: string, storage?: any) => Promise<void>;
}>((set, get) => ({
  token: null,
  contract: null,
  connection: null,

  init: async (connection: WalletConnection) => {
    try {
      set({
        connection: connection as WalletConnection,
        contract: new Contract(
          connection.account(),
          import.meta.env.VITE_LOCKED_CONTRACT,
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

  withdraw: async (vesting: string, storage: any) => {
    const { contract, connection } = get();

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
