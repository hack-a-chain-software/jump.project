import { providers } from "near-api-js";

export interface TransactionPayload {
  status: any;
  transaction: Transaction;
}

export interface Transaction {
  actions: Action[];
  hash: string;
  nonce: number;
  public_key: string;
  receiver_id: string;
  signature: string;
  signer_id: string;
}

export interface Action {
  FunctionCall: FunctionCall;
}

export interface FunctionCall {
  args: string;
  deposit: string;
  gas: number;
  method_name: string;
}

const rpcProviders = {
  testnet: "https://archival-rpc.testnet.near.org",
  mainnet: "https://archival-rpc.mainnet.near.org",
};

const actions = [
  {
    error: "We had a problem with your request, for more details visit:",
    success: "Successfully redeemed tokens",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "ft_faucet";
    },
  },
  {
    error: "We had a problem with your request, for more details visit:",
    success: "Successfully redeemed tokens",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "nft_faucet";
    },
  },
  {
    error: "We had a problem withdrawing your allocations, learn more at:",
    success: "Successfully withdrawn locations",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "withdraw_allocations";
    },
  },
  {
    error: "Something happened when buying your tickets, learn more:",
    success: "Tickets purchased successfully",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      const args = window.atob(action.FunctionCall.args);

      return (
        action.FunctionCall.method_name === "ft_transfer_call" &&
        args.includes("BuyAllocation")
      );
    },
  },
  {
    error: "We were unable to update your membership, see more at:",
    success: "Membership updated successfully",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      const args = window.atob(action.FunctionCall.args);

      return (
        action.FunctionCall.method_name === "ft_transfer_call" &&
        args.includes("VerifyAccount")
      );
    },
  },
  {
    error: "We were unable to update your membership, see more at:",
    success: "Membership updated successfully",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "decrease_membership_tier";
    },
  },
  {
    error: "We were unable to stake your tokens, see more at:",
    success: "Successfully staked NFTs",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "nft_transfer_call";
    },
  },
  {
    error: "We We were unable to remove your NFTs, see more at:",
    success: "NFTs successfully withdrawn",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "unstake";
    },
  },
  {
    error: "We were unable to redeem your rewards, see more at:",
    success: "Successfully redeemed rewards",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "withdraw_reward";
    },
  },
  {
    error: "We were unable to stake your Jumps, see more at:",
    success: "Jump staked successfully",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      const args = window.atob(action.FunctionCall.args);

      return (
        action.FunctionCall.method_name === "ft_transfer_call" &&
        args.includes("mint")
      );
    },
  },
  {
    error: "We had a problem redeeming your tokens, see more at:",
    success: "Jump tokens redeemed successfully",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "burn_x_token";
    },
  },
  {
    error: "We had a problem deploying your Token, see more at:",
    success: "Token successfully deployed",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "deploy_new_contract";
    },
  },
  {
    error: "We had a problem redeeming your jump tokens, see more at:",
    success: "Successfully redeemed Jump tokens",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      return action.FunctionCall.method_name === "withdraw_locked_tokens";
    },
  },
  {
    error: "We had a problem purchasing your fastpass, see more at:",
    success: "FastPass successfully purchased",
    check: ({ transaction: { actions } }: TransactionPayload) => {
      const [action] = actions;

      const args = window.atob(action.FunctionCall.args);

      return (
        action.FunctionCall.method_name === "ft_transfer_call" &&
        args.includes("BuyFastPass")
      );
    },
  },
];

export const provider = new providers.JsonRpcProvider(
  rpcProviders[import.meta.env.VITE_NEAR_NETWORK]
);

export const getTransactionState = async (txHash: string, accountId: string) =>
  await provider.txStatus(txHash, accountId);

export const getTransactionsAction = (
  transactions: Partial<TransactionPayload>[]
) => {
  return transactions
    .map((payload) => {
      const action = actions.find(({ check }) =>
        check(payload as TransactionPayload)
      );

      if (!action) {
        return;
      }

      const status =
        Object.keys(payload.status)[0] === "Failure" ? "error" : "success";

      return {
        status,
        payload,
        message: action[status],
        ...action,
      };
    })
    .filter((item) => item)[0];
};
