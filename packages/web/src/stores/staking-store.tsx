import create from "zustand";
import { WalletConnection, Contract } from "near-api-js";
import toast from "react-hot-toast";
import { ConnectWallet } from "../components/modules/toasts";
import {
  FtOnTransfer,
  NearContractViewCall,
  NearMutableContractCall,
} from "@near/ts";
import { NearConstants } from "../constants";
import { JUMP_TOKEN, X_JUMP_TOKEN } from "../env/contract";

import {
  executeMultipleTransactions,
  getAmount,
  Transaction,
} from "../hooks/near";

interface StakingContract extends Contract {
  ft_on_transfer: FtOnTransfer;
  burn_x_token: NearMutableContractCall<{ quantity_to_burn: string }>;

  storage_deposit: NearMutableContractCall<{
    account_id: string | null;
    registration_only: boolean | null;
  }>;
  storage_balance_of: NearContractViewCall<
    {
      account_id: string;
    },
    {
      total: string;
      available: string;
    }
  >;
}

export const useStaking = create<{
  contract: StakingContract | null;
  connection: WalletConnection | null;
  init: (connection: WalletConnection) => Promise<void>;
  stakeXToken: (amount: string) => Promise<void>;
  burnXToken: (amount: string) => Promise<void>;
}>((set, get) => ({
  contract: null,
  connection: null,
  /** @description - initializes the store with the contract instance and the wallet connection */
  async init(connection) {
    try {
      set({
        connection,
        contract: new Contract(
          connection.account(),
          import.meta.env.VITE_STAKING_CONTRACT,
          {
            viewMethods: ["storage_balance_of"],
            changeMethods: ["ft_on_transfer", "burn_x_token"],
          }
        ) as StakingContract,
      });
    } catch (error) {
      console.warn("Staking Init Warning", error);
    }
  },
  /** @description - stakes tokens into the contract and sends the deposit to pay storage fees */
  async stakeXToken(amount) {
    const transactions: Transaction[] = [];
    const { contract, connection } = get();
    try {
      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      const stakingStorage = await contract.storage_balance_of({
        account_id: get().connection?.getAccountId(),
      });

      if (!stakingStorage) {
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

      transactions.push({
        receiverId: JUMP_TOKEN,
        functionCalls: [
          {
            methodName: "ft_transfer_call",
            args: {
              receiver_id: import.meta.env.VITE_STAKING_CONTRACT,
              amount,
              memo: null,
              msg: "mint",
            },
            gas: NearConstants.AttachedGas,
          },
        ],
      });

      await executeMultipleTransactions(transactions, connection);
      toast.success("Staking Complete");
    } catch (error) {
      return console.error(toast.error(`Stake Error: ${error}`));
    }
  },
  /** @description - unstakes tokens from the contract to the user wallet */
  async burnXToken(amount) {
    const transactions: Transaction[] = [];
    try {
      const { connection, contract } = get();
      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      const stakingStorage = await contract.storage_balance_of({
        account_id: get().connection?.getAccountId(),
      });

      if (!stakingStorage) {
        transactions.push({
          receiverId: JUMP_TOKEN,
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

      transactions.push({
        receiverId: X_JUMP_TOKEN,
        functionCalls: [
          {
            methodName: "burn_x_token",
            args: {
              quantity_to_burn: amount,
            },
            gas: NearConstants.AttachedGas,
          },
        ],
      });

      await executeMultipleTransactions(transactions, connection);

      toast.success("Staking Complete");
    } catch (error) {
      return console.error(toast.error(`Stake Error: ${error}`));
    }
  },
}));
