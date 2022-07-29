import create from "zustand";
import { Contract, WalletConnection } from "near-api-js";
import { Transaction, executeMultipleTransactions } from "@/tools";
import { NearContractViewCall } from "@near/ts";
import { NearConstants } from "@/constants";

export interface Token {
  balance?: any;
  id?: string;
  token_id: string;
  owner_id: string;
  metadata: Metadata;
  approved_account_ids: ApprovedAccountIds;
}

export interface Metadata {
  title: string;
  description: any;
  media: string;
  media_hash: any;
  copies: number;
  issued_at: any;
  expires_at: any;
  starts_at: any;
  updated_at: any;
  extra: any;
  reference: any;
  reference_hash: any;
}

export interface ApprovedAccountIds {}

export interface Program {
  collection: Collection;
  collection_owner: string;
  collection_treasury: any;
  token_address: string;
  farm: Farm;
  min_staking_period: string;
  early_withdraw_penalty: string;
}

export interface Collection {
  type: string;
  account_id: string;
}

export interface Farm {
  round_interval: number;
  start_at: number;
  distributions: any;
}

interface CollectionContract extends Contract {
  nft_token: NearContractViewCall<{ token_id: string }, Token>;
}

interface NFTStakingContract extends Contract {
  storage_balance_of: NearContractViewCall<{ account_id: string }, any>;
  view_staked: NearContractViewCall<
    { account_id: string; collection: { account_id: string; type: string } },
    string[]
  >;
  view_staked_nft_balance: NearContractViewCall<
    { nft_id: [{ type: string; account_id: string }, string] },
    any
  >;
}

export const useNftStaking = create<{
  loading: boolean;
  tokens: Token[];
  getTokens: (
    connection: WalletConnection,
    collection: string
  ) => Promise<void>;
  stake: (
    connection: WalletConnection,
    collection: string,
    tokenId: string
  ) => Promise<void>;
  unstake: (
    connection: WalletConnection,
    tokens: string[],
    collection: string
  ) => Promise<void>;
  claimRewards: (
    connection: WalletConnection,
    tokens: string[],
    collection: string
  ) => Promise<void>;
}>((set, get) => ({
  tokens: [],
  loading: false,

  getTokens: async (connection, collection) => {
    set({
      loading: true,
    });

    const stakingContract = new Contract(
      connection.account(),
      import.meta.env.VITE_NFT_STAKING_CONTRACT,
      {
        viewMethods: [
          "view_staked",
          "view_guardians",
          "view_staked_nft_balance",
        ],
        changeMethods: [],
      }
    ) as NFTStakingContract;

    const collectionContract = new Contract(connection.account(), collection, {
      viewMethods: ["nft_token"],
      changeMethods: [],
    }) as CollectionContract;

    try {
      const staked = await stakingContract.view_staked({
        account_id: connection.getAccountId(),
        collection: {
          type: "NFTContract",
          account_id: collection,
        },
      });

      const tokens: Token[] = [];

      for (let i = 0; i < staked.length; i++) {
        const balance = await stakingContract.view_staked_nft_balance({
          nft_id: [
            {
              type: "NFTContract",
              account_id: collection,
            },
            staked[i],
          ],
        });

        const token = await collectionContract.nft_token({
          token_id: staked[i],
        });

        tokens.push({ ...token, balance: balance });
      }

      set({
        tokens,
      });
    } catch (e) {
      console.warn(e);

      set({
        tokens: [],
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  stake: async (connection, collection, tokenId) => {
    const contract = new Contract(
      connection.account(),
      import.meta.env.VITE_NFT_STAKING_CONTRACT,
      {
        viewMethods: ["storage_balance_of"],
        changeMethods: [],
      }
    ) as NFTStakingContract;

    const transactions: Transaction[] = [];

    try {
      const stakingStorage = await contract?.storage_balance_of({
        account_id: connection?.getAccountId(),
      });

      if (!stakingStorage || stakingStorage?.available < "0.10") {
        transactions.push({
          receiverId: import.meta.env.VITE_NFT_STAKING_CONTRACT,
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
            receiver_id: import.meta.env.VITE_NFT_STAKING_CONTRACT,
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

  unstake: async (connection, tokens, collection) => {
    const transactions: any = [];

    tokens.forEach((item) => {
      transactions.push({
        receiverId: import.meta.env.VITE_NFT_STAKING_CONTRACT,
        functionCalls: [
          {
            methodName: "unstake",
            args: {
              token_id: [
                {
                  type: "NFTContract",
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

  claimRewards: async (connection, tokens, collection) => {},
}));
