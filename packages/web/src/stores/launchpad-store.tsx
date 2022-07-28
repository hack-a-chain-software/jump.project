import bn from "bn.js";
import { ConnectWallet } from "@/components";
import { NearConstants } from "@/constants";
import { executeMultipleTransactions, Transaction } from "@/tools";
import { NearContractViewCall, NearMutableContractCall } from "@near/ts";
import { WalletConnection } from "near-api-js";
import { Contract } from "near-api-js";
import toast from "react-hot-toast";
import create from "zustand/react";
import { StakingContract } from "./staking-store";

interface LaunchpadContract extends Contract {
  withdraw_allocations: NearMutableContractCall<{
    listing_id: string;
  }>;
  storage_deposit: NearMutableContractCall<{
    account_id: string | null;
    registration_only: boolean | null;
  }>;
  view_investor: NearContractViewCall<
    { account_id: string },
    {
      account_id: string;
      storage_deposit: string;
      storage_used: string;
      is_listing_owner: string;
      staked_token: string;
      last_check: string;
    }
  >;

  view_contract_settings: NearContractViewCall<
    Record<any, any>,
    {
      membership_token: string;
      token_lock_period: string;
      tiers_minimum_tokens: string[];
      tiers_entitled_allocations: string[];
      allowance_phase_2: string;
      partner_dex: string;
    }
  >;
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
  buyTickets(
    amount: number,
    priceToken: string,
    listingId: string
  ): Promise<void>;
  withdrawAllocations(listingId: string, project_token: string): Promise<void>;
  increaseMembership(desiredLevel: number): Promise<void>;
  decreaseMembership(desiredLevel: number): Promise<void>;
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

  async withdrawAllocations(listing_id, project_token) {
    const { contract, connection } = get();

    try {
      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      const projectTokenContract = new Contract(
        connection?.account(),
        project_token,
        {
          changeMethods: ["storage_deposit"],
          viewMethods: ["storage_balance_of"],
        }
      ) as Contract & {
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
      };

      const projectTokenStorageBalance =
        projectTokenContract.storage_balance_of({
          account_id: connection.getAccountId(),
        });

      const transactions: Transaction[] = [];

      if (!projectTokenStorageBalance) {
        transactions.push({
          receiverId: projectTokenContract.contractId,
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

      transactions.push({
        receiverId: import.meta.env.VITE_JUMP_LAUNCHPAD_CONTRACT,
        functionCalls: [
          {
            methodName: "withdraw_allocations",
            args: {
              listing_id,
            },
            gas: NearConstants.AttachedGas,
          },
        ],
      });

      await executeMultipleTransactions(transactions, connection);

      toast.success(
        "You have withdrawn all the available allocations for this project with success!"
      );
    } catch (error) {
      return console.error(toast.error(`Withdraw Allocations Error: ${error}`));
    }
  },

  async buyTickets(amount, priceToken, listingId) {
    const { contract, connection } = get();
    try {
      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      const launchpadStorage = await contract.storage_balance_of({
        account_id: connection.getAccountId(),
      });

      const transactions: Transaction[] = [];

      if (!launchpadStorage) {
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

      transactions.push({
        receiverId: priceToken,
        functionCalls: [
          {
            methodName: "ft_transfer_call",
            args: {
              receiver_id: import.meta.env.VITE_STAKING_CONTRACT,
              amount,
              memo: null,
              msg: JSON.stringify({
                type: "BuyAllocation",
                listing_id: listingId,
              }),
            },
            gas: NearConstants.AttachedGas,
          },
        ],
      });

      await executeMultipleTransactions(transactions, connection);
    } catch (error) {
      return console.error(
        toast.error(`Buy Tickets to Launchpad Error: ${error}`)
      );
    }
  },
  async increaseMembership(desiredLevel) {
    try {
      const transactions: Transaction[] = [];

      const { connection, contract } = get();

      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      const { tiers_minimum_tokens } = await contract.view_contract_settings();

      const { staked_token } = await contract.view_investor({
        account_id: connection.getAccountId(),
      });

      const minTokens = tiers_minimum_tokens[desiredLevel - 1];

      transactions.push({
        receiverId: import.meta.env.VITE_STAKING_CONTRACT,
        functionCalls: [
          {
            methodName: "ft_transfer_call",
            args: {
              receiver_id: import.meta.env.VITE_STAKING_CONTRACT,
              amount: new bn(minTokens).sub(new bn(staked_token)).toString(),
              memo: null,
              msg: JSON.stringify({
                type: "VerifyAccount",
                membership_tier: desiredLevel.toString(),
              }),
            },
            gas: NearConstants.AttachedGas,
          },
        ],
      });

      await executeMultipleTransactions(transactions, connection);
    } catch (error) {
      return console.error(
        toast.error(`Error While Increasing Membership: ${error}`)
      );
    }
  },
  async decreaseMembership(desiredLevel) {
    try {
      const { connection, contract } = get();
      if (!connection || !contract) {
        return console.warn(toast((t) => <ConnectWallet t={t} />));
      }

      const transactions: Transaction[] = [];

      const stakingContract = new Contract(
        connection?.account(),
        import.meta.env.VITE_STAKING_CONTRACT,
        {
          changeMethods: [],
          viewMethods: ["storage_balance_of"],
        }
      ) as StakingContract;

      const stakingStorageBalance = await stakingContract.storage_balance_of({
        account_id: connection.getAccountId(),
      });

      if (!stakingStorageBalance) {
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

      transactions.push({
        receiverId: import.meta.env.VITE_JUMP_LAUNCHPAD_CONTRACT,
        functionCalls: [
          {
            methodName: "decrease_membership_tier",
            args: {
              desired_level: desiredLevel,
            },
            gas: NearConstants.AttachedGas,
          },
        ],
      });

      await executeMultipleTransactions(transactions, connection);
    } catch (error) {
      return console.error(
        toast.error(`Error While Decreasing Membership: ${error}`)
      );
    }
  },
}));
