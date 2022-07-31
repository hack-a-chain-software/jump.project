import create from "zustand";
import { Contract, WalletConnection } from "near-api-js";
import { Transaction, executeMultipleTransactions } from "@/tools";
import { NearContractViewCall, NearMutableContractCall } from "@near/ts";
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

export interface StakingProgram {
  collection: Collection;
  collection_owner: string;
  collection_treasury: any;
  token_address: string;
  farm: Farm;
  stakingTokenRewards?: FToken[];
  min_staking_period: string;
  early_withdraw_penalty: string;
  collectionMetadata?: CollectionMetaResponse;
}

export interface FToken {
  spec: string;
  name: string;
  symbol: string;
  icon: any;
  reference: any;
  reference_hash: any;
  decimals: number;
  perMonth?: number;
  account_id?: string;
  userBalance?: number;
}

export interface CollectionMetaResponse {
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  base_uri: string;
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

interface TokenContract extends Contract {
  ft_metadata: NearContractViewCall<any, FToken>;
}

interface CollectionContract extends Contract {
  nft_token: NearContractViewCall<{ token_id: string }, Token>;
  nft_metadata: NearContractViewCall<any, CollectionMetaResponse>;
}

interface NFTStakingContract extends Contract {
  storage_balance_of: NearContractViewCall<{ account_id: string }, any>;
  view_staked: NearContractViewCall<
    { account_id: string; collection: { account_id: string; type: string } },
    string[]
  >;
  view_staking_program: NearContractViewCall<
    { collection: { type: string; account_id: string } },
    StakingProgram
  >;
  view_staked_nft_balance: NearContractViewCall<
    { nft_id: [{ type: string; account_id: string }, string] },
    any
  >;
}

export const useNftStaking = create<{
  loading: boolean;
  tokens: Token[];
  stakingInfo: Partial<StakingProgram>;
  fetchStakingInfo: (
    connection: WalletConnection,
    collection: string
  ) => Promise<void>;
  fetchUserTokens: (
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
  stakingInfo: {},
  loading: false,

  fetchStakingInfo: async (connection, collection) => {
    set({
      loading: true,
    });

    const contract = new Contract(
      connection.account(),
      import.meta.env.VITE_NFT_STAKING_CONTRACT,
      {
        viewMethods: ["view_staking_program"],
        changeMethods: [],
      }
    ) as NFTStakingContract;

    const stakingProgram = await contract.view_staking_program({
      collection: {
        type: "NFTContract",
        account_id: collection,
      },
    });

    const collectionContract = new Contract(connection.account(), collection, {
      viewMethods: ["nft_metadata"],
      changeMethods: [],
    }) as CollectionContract;

    const collectionMetadata = await collectionContract.nft_metadata();

    const secondsPerMonth = 2592000;
    const interval = stakingProgram.farm.round_interval;
    const distributions = stakingProgram.farm.distributions;

    const stakingRewards: FToken[] = [];

    for (const key in distributions) {
      const contract = new Contract(connection.account(), key, {
        viewMethods: ["ft_metadata"],
        changeMethods: [],
      }) as TokenContract;

      const metadata = await contract.ft_metadata();

      const { reward } = distributions[key];

      stakingRewards.push({
        ...metadata,
        account_id: key,
        perMonth: (secondsPerMonth * Number(reward)) / Number(interval),
      });
    }

    set({
      stakingInfo: {
        ...stakingProgram,
        collectionMetadata,
        stakingTokenRewards: stakingRewards.sort((a, b) =>
          a.symbol.localeCompare(b.symbol)
        ),
      },
    });
  },

  fetchUserTokens: async (connection, collection) => {
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

      const {
        stakingInfo: { stakingTokenRewards },
      } = get();

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

        tokens.push({ ...token, balance });
      }

      set({
        tokens,
        stakingInfo: {
          ...get().stakingInfo,
          stakingTokenRewards: stakingTokenRewards?.map((item) => {
            return {
              ...item,
              userBalance: tokens.reduce(
                (sum, { balance }) => sum + balance[item.account_id || ""],
                0
              ),
            };
          }),
        },
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

  claimRewards: async (connection, tokens, collection) => {
    const transactions: any = [];

    tokens.forEach((item) => {
      transactions.push({
        receiverId: import.meta.env.VITE_NFT_STAKING_CONTRACT,
        functionCalls: [
          {
            methodName: "claim_reward",
            args: {
              collection: {
                type: "NFTContract",
                account_id: collection,
              },
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
}));
