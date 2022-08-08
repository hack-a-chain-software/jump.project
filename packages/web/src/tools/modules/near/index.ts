import { utils, providers } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";
import { Transaction } from "@near/ts";

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  wallet: any
) => {
  return wallet.signAndSendTransactions({ transactions });
};

export const getTransaction = (
  signerId: string,
  receiverId: string,
  method: string,
  args: any,
  amount?: string
): Transaction => {
  return {
    signerId,
    receiverId,
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: method,
          args,
          gas: "300000000000000",
          deposit: utils.format.parseNearAmount(amount) || "1",
        },
      },
    ],
  };
};

export const viewFunction = async (
  selector,
  contractId,
  methodName,
  args = {}
) => {
  const { network } = selector.options;

  const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

  const serializedArgs = window.btoa(JSON.stringify(args));

  const res = await provider.query<CodeResult>({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  });

  return (
    res &&
    res.result.length > 0 &&
    JSON.parse(Buffer.from(res.result).toString())
  );
};
