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
  stakedAt?: number;
  metadata: Metadata;
  approved_account_ids: ApprovedAccountIds;
}

export interface StakedNFT {
  token_id: [TokenId, string];
  owner_id: string;
  staked_timestamp: number;
}

export interface TokenId {
  type: string;
  account_id: string;
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

export interface CollectionMetaResponse {
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  base_uri: string;
}

export interface StakingToken {
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  perMonth: number;
  account_id: string;
}

export interface TransactionObj {
  receiverId: string;
  functionCalls: FunctionCall[];
}

export interface FunctionCall {
  methodName: string;
  args: Args;
  gas: string;
  amount: string;
}

export interface TokenId {
  type: string;
  account_id: string;
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
  view_staked_nft_balance: NearContractViewCall<
    { nft_id: [{ type: string; account_id: string }, string] },
    any
  >;
  view_staked_nft: NearContractViewCall<
    { nft_id: [{ type: string; account_id: string }, string] },
    StakedNFT
  >;
}

export const useNftStaking = create<{
  loading: boolean;
  tokens: Token[];
  getTransaction: (
    receiver: string,
    method: string,
    args: any,
    amount?: string
  ) => TransactionObj;
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
    collection: string,
    rewards: any
  ) => Promise<void>;
  getTokenStorage: (
    token: string,
    connection: WalletConnection
  ) => Promise<any>;
}>((set, get) => ({
  tokens: [],
  loading: false,

  fetchUserTokens: async (connection, collection) => {
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
          "view_staked_nft",
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

        const { staked_timestamp } = await stakingContract.view_staked_nft({
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

        tokens.push({ ...token, balance, stakedAt: staked_timestamp });
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
    const { getTransaction } = get();

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
        transactions.push(
          getTransaction(
            import.meta.env.VITE_NFT_STAKING_CONTRACT,
            "storage_deposit",
            {
              account_id: connection?.getAccountId(),
              registration_only: false,
            },
            "0.25"
          )
        );
      }
    } catch (e) {
      console.warn(e);
    }

    transactions.push(
      getTransaction(collection, "nft_transfer_call", {
        receiver_id: import.meta.env.VITE_NFT_STAKING_CONTRACT,
        token_id: tokenId,
        approval_id: null,
        memo: null,
        msg: JSON.stringify({
          type: "Stake",
        }),
      })
    );

    executeMultipleTransactions(transactions, connection as WalletConnection);
  },

  unstake: async (connection, tokens, collection, balance) => {
    const { getTransaction } = get();

    const transactions: any = [];

    // for (const key in balance) {
    //   if (!balance[key]) {
    //     continue;
    //   }

    //   const storage = await get().getTokenStorage(key, connection);

    //   if (!storage) {
    //     transactions.push(
    //       getTransaction(
    //         key,
    //         "storage_deposit",
    //         {
    //           account_id: connection?.getAccountId(),
    //           registration_only: false,
    //         },
    //         "0.10",
    //       ),
    //     );
    //   }

    //   transactions.push(
    //     getTransaction(
    //       import.meta.env.VITE_NFT_STAKING_CONTRACT,
    //       "whitdraw",
    //       {
    //         token_id: [
    //           {
    //             type: "whitdraw",
    //             account_id: collection,
    //           },
    //           key,
    //         ],
    //       },
    //     ),
    //   );
    // }

    tokens.forEach((item) => {
      transactions.push(
        getTransaction(import.meta.env.VITE_NFT_STAKING_CONTRACT, "unstake", {
          token_id: [
            {
              type: "NFTContract",
              account_id: collection,
            },
            item,
          ],
        })
      );
    });

    executeMultipleTransactions(transactions, connection as WalletConnection);
  },

  getTokenStorage: async (token, connection) => {
    const contract = new Contract(connection.account(), token, {
      viewMethods: [],
      changeMethods: [],
    }) as NFTStakingContract;

    try {
      return await contract?.storage_balance_of({
        account_id: connection?.getAccountId(),
      });
    } catch (e) {
      return;
    }
  },

  getTransaction: (receiver, method, args, amount = "1") => {
    return {
      receiverId: receiver,
      functionCalls: [
        {
          args,
          amount,
          methodName: method,
          gas: NearConstants.AttachedGas,
        },
      ],
    };
  },
}));
