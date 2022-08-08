import BN from "bn.js";
import create from "zustand";
import {
  viewFunction,
  getTransaction,
  executeMultipleTransactions,
} from "@/tools";
import type { WalletSelector } from "@near-wallet-selector/core";

import { Transaction } from "@near/ts";

export interface Vesting {
  id?: string;
  beneficiary: string;
  locked_value: string;
  start_timestamp: string;
  vesting_duration: string;
  fast_pass: boolean;
  withdrawn_tokens: string;
  available_to_withdraw: string;
}

export interface InvestorInfo {
  token: Token;
  contractData: ContractData;
  totalLocked: BN;
  totalUnlocked: BN;
  totalWithdrawn: BN;
}

export interface Token {
  spec: string;
  name: string;
  symbol: string;
  icon: any;
  reference: any;
  reference_hash: any;
  decimals: number;
}

export interface ContractData {
  owner_id: string;
  base_token: string;
  vesting_duration: string;
  fast_pass_cost: string;
  fast_pass_acceleration: string;
  fast_pass_beneficiary: string;
}

export const useVestingStore = create<{
  loading: boolean;
  vestings: Vesting[];
  investorInfo: Partial<InvestorInfo>;
  getPages: (total: string, limit: number) => number;
  getInvestorInfo: (connection: WalletSelector) => Promise<void>;
  getVestings: (connection: WalletSelector, accountId: string) => Promise<void>;
  fastPass: (
    vesting: string,
    storage: any,
    amount: number,
    passCost: number,
    accountId: string,
    connection: WalletSelector
  ) => Promise<void>;
  withdraw: (
    vestings: string[],
    storage: any,
    accountId: string,
    connection: WalletSelector
  ) => Promise<void>;
}>((set, get) => ({
  vestings: [],
  loading: true,
  investorInfo: {},

  getInvestorInfo: async (connection) => {
    const token = await viewFunction(
      connection,
      import.meta.env.VITE_BASE_TOKEN,
      "ft_metadata"
    );

    const contractData = await viewFunction(
      connection,
      import.meta.env.VITE_LOCKED_CONTRACT,
      "view_contract_data"
    );

    const investorInfo = get().vestings.reduce(
      (info: InvestorInfo, vesting: Vesting) => {
        const locked = new BN(vesting.locked_value);
        const available = new BN(vesting.available_to_withdraw);
        const totalWithdrawn = new BN(vesting.withdrawn_tokens);

        info.totalLocked = info.totalLocked.add(
          locked.sub(available).sub(totalWithdrawn)
        );

        info.totalUnlocked = info.totalUnlocked.add(available);
        info.totalWithdrawn = info.totalWithdrawn.add(totalWithdrawn);

        return info;
      },
      {
        token,
        contractData,
        totalLocked: new BN(0),
        totalUnlocked: new BN(0),
        totalWithdrawn: new BN(0),
      }
    );

    set({
      investorInfo,
      loading: false,
    });
  },

  getVestings: async (connection, accountId) => {
    const totalVestings = await viewFunction(
      connection,
      import.meta.env.VITE_LOCKED_CONTRACT,
      "view_vesting_vector_len",
      {
        account_id: accountId,
      }
    );

    const vestings: Vesting[] = [];

    const pages = get().getPages(totalVestings, 10);

    for (let i = 0; i <= pages; i++) {
      const items = await viewFunction(
        connection,
        import.meta.env.VITE_LOCKED_CONTRACT,
        "view_vesting_paginated",
        {
          account_id: accountId,
          initial_id: String(i * 10),
          size: "10",
        }
      );

      vestings.push(...items);
    }

    set({
      vestings: vestings.map((item, i) => ({ ...item, id: String(i) })),
    });
  },

  getPages: (total, limit) => {
    const base = Number(total) / limit;

    if (!base || base < 1) {
      return 1;
    }

    if (base % 1 !== 0) {
      return base + 1;
    }

    return base;
  },

  withdraw: async (vestings, storage, accountId, connection) => {
    const transactions: Transaction[] = [];

    if (!storage || storage.total < "0.10") {
      transactions.push(
        getTransaction(
          accountId,
          import.meta.env.VITE_BASE_TOKEN,
          "storage_deposit",
          {
            account_id: accountId,
            registration_only: false,
          },
          "0.25"
        )
      );
    }

    vestings.forEach((vesting) => {
      transactions.push(
        getTransaction(
          accountId,
          import.meta.env.VITE_LOCKED_CONTRACT,
          "withdraw_locked_tokens",
          {
            vesting_id: vesting,
          }
        )
      );
    });

    const wallet = await connection.wallet();

    executeMultipleTransactions(transactions, wallet);
  },

  fastPass: async (
    vesting,
    storage,
    amount,
    passCost,
    accountId,
    connection
  ) => {
    const transactions: Transaction[] = [];

    if (!storage || storage.total < "0.10") {
      transactions.push(
        getTransaction(
          accountId,
          import.meta.env.VITE_BASE_TOKEN,
          "storage_deposit",
          {
            account_id: accountId,
            registration_only: false,
          },
          "0.25"
        )
      );
    }

    transactions.push(
      getTransaction(
        accountId,
        import.meta.env.VITE_BASE_TOKEN,
        "ft_transfer_call",
        {
          amount: String((amount * passCost) / 10000),
          receiver_id: import.meta.env.VITE_LOCKED_CONTRACT,
          memo: null,
          msg: JSON.stringify({
            type: "BuyFastPass",
            account_id: connection?.getAccountId(),
            vesting_index: vesting,
          }),
        }
      )
    );

    const wallet = await connection.wallet();

    executeMultipleTransactions(transactions, wallet);
  },
}));
