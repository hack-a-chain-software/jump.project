import BN from "bn.js";
import create from "zustand";
import { connect, Contract, WalletConnection } from "near-api-js";

import { getAmount, executeMultipleTransactions } from "../hooks/near";

import { contractName } from "../env/contract";

export const useNftStaking = create<{
  contract: any;
  init: (walletConnection: WalletConnection) => Promise<void>;
  stake: (
    walletConnection: WalletConnection,
    collection: any,
    tokenId: string
  ) => Promise<void>;
  unstakeAll: () => Promise<void>;
  unstake: () => Promise<void>;
  claimRewards: () => Promise<void>;
  viewStaked: () => Promise<any>;
}>((set, get) => ({
  contract: null,

  init: async (walletConnection: WalletConnection) => {
    if (get().contract) {
      return;
    }

    const account = await walletConnection.account();

    console.log(getAmount("1"));

    const contract = new Contract(account, contractName, {
      viewMethods: ["view_staked", "storage_balance_of"],
      changeMethods: [
        "unstake",
        "claim_rewards",
        "storage_deposit",
        "withdraw_reward",
      ],
    });

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

  stake: async (connection: WalletConnection, collection: any) => {
    const transactions = [];

    try {
      const stakingStorage = await get().contract?.storage_balance_of({
        account_id: collection.contractId,
      });

      if (!stakingStorage || stakingStorage.total < "0.10") {
        transactions.push({
          receiverId: contractName,
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
            receiver_id: contractName,
            token_id: "11",
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
