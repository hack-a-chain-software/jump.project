import { ConnectWallet } from "@/components";
import { NearConstants } from "@/constants";
import { Transaction } from "@/tools";
import { NearContractViewCall, NearMutableContractCall } from "@near/ts";
import { WalletConnection } from "near-api-js";
import { Contract } from "near-api-js";
import toast from "react-hot-toast";
import create from "zustand/react";

interface LaunchpadContract extends Contract {
  withdraw_allocations: NearMutableContractCall<{
    listing_id: string;
  }>;
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

export const useLaunchpadStore = create<{
  contract: LaunchpadContract | null;
  connection: WalletConnection | null;
  init(connection: WalletConnection): Promise<void>;
  buyTickets(amount: number): Promise<void>;
  withdrawAllocations(listingId: string): Promise<void>;
}>((set, get) => ({
  contract: null,
  connection: null,

  async init(connection) {
    set({
      connection,
      contract: new Contract(
        connection.account(),
        import.meta.env.VITE_JUMP_LAUNCHPAD_CONTRACT,
        {
          changeMethods: ["withdraw_allocations"],
          viewMethods: [],
        }
      ) as LaunchpadContract,
    });
  },

  async withdrawAllocations(listing_id) {
    const { contract, connection } = get();

    try {
      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      await contract.withdraw_allocations(
        {
          listing_id,
        },
        NearConstants.AttachedGas
      );

      toast.success(
        "You have withdrawn all the available allocations for this project with success!"
      );
    } catch (error) {
      return console.error(toast.error(`Withdraw Allocations Error: ${error}`));
    }
  },

  async buyTickets(_amount) {
    const { contract, connection } = get();
    try {
      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      const stakingStorage = await contract.storage_balance_of({
        account_id: connection.getAccountId(),
      });

      const transactions: Transaction[] = [];

      if (!stakingStorage) {
        transactions.push({
          receiverId: import.meta.env.VITE_JUMP_LAUNCHPAD_CONTRACT,
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

      // O que fazer aqui
    } catch (error) {
      return console.error(
        toast.error(`Buy Tickets to Launchpad Error: ${error}`)
      );
    }
  },
}));
