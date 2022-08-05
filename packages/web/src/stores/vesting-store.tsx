import BN from "bn.js";
import create from "zustand";
import { WalletConnection, Contract } from "near-api-js";
import { Transaction, executeMultipleTransactions } from "../hooks/near";
import { NearContractViewCall } from "@near/ts";

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

interface TokenContract extends Contract {
  ft_metadata: NearContractViewCall<any, Token>;
}

interface VestingContract extends Contract {
  view_vesting_paginated: NearContractViewCall<
    { account_id: string; initial_id: string; size: string },
    Vesting[]
  >;
  view_vesting_vector_len: NearContractViewCall<{ account_id: string }, string>;
  view_contract_data: NearContractViewCall<any, ContractData>;
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
  getInvestorInfo: (connection: WalletConnection) => Promise<void>;
  getVestings: (connection: WalletConnection) => Promise<void>;
  fastPass: (
    vesting: string,
    storage: any,
    amount: number,
    passCost: number,
    connection: WalletConnection
  ) => Promise<void>;
  withdraw: (
    vestings: string[],
    storage: any,
    connection: WalletConnection
  ) => Promise<void>;
}>((set, get) => ({
  vestings: [],
  loading: true,
  investorInfo: {},

  getInvestorInfo: async (connection) => {
    const tokenContract = new Contract(
      connection.account(),
      import.meta.env.VITE_BASE_TOKEN,
      {
        viewMethods: ["ft_metadata"],
        changeMethods: [],
      }
    ) as TokenContract;

    const token = await tokenContract.ft_metadata();

    const vestingContract = new Contract(
      connection.account(),
      import.meta.env.VITE_LOCKED_CONTRACT,
      {
        viewMethods: ["view_contract_data"],
        changeMethods: [],
      }
    ) as VestingContract;

    const contractData = await vestingContract.view_contract_data();

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

  getVestings: async (connection) => {
    const contract = new Contract(
      connection.account(),
      import.meta.env.VITE_LOCKED_CONTRACT,
      {
        viewMethods: ["view_vesting_paginated", "view_vesting_vector_len"],
        changeMethods: [],
      }
    ) as VestingContract;

    const totalVestings = await contract.view_vesting_vector_len({
      account_id: connection.getAccountId(),
    });

    const vestings: Vesting[] = [];

    const pages = get().getPages(totalVestings, 10);

    for (let i = 0; i <= pages; i++) {
      const items = await contract.view_vesting_paginated({
        account_id: connection.getAccountId(),
        initial_id: String(i * 10),
        size: "10",
      });

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

  withdraw: async (vestings, storage, connection) => {
    const transactions: Transaction[] = [];

    if (!storage || storage.total < "0.10") {
      transactions.push({
        receiverId: import.meta.env.VITE_BASE_TOKEN,
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

    vestings.forEach((vesting) => {
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
    });

    executeMultipleTransactions(transactions, connection as WalletConnection);
  },

  fastPass: async (vesting, storage, amount, passCost, connection) => {
    const transactions: Transaction[] = [];

    if (!storage || storage.total < "0.10") {
      transactions.push({
        receiverId: import.meta.env.VITE_BASE_TOKEN,
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
      receiverId: import.meta.env.VITE_BASE_TOKEN,
      functionCalls: [
        {
          methodName: "ft_transfer_call",
          args: {
            amount: String((amount * passCost) / 10000),
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
