import axios from "axios";
import { BN } from "bn.js";

export async function viewMethod(
  contractId: string,
  methodName: string,
  args: any
) {
  const response = await axios.post(
    "https://rpc.mainnet.near.org",
    createArgs(contractId, methodName, args)
  );

  if (response.data.error) {
    throw new Error(response.data.error.data);
  }
  if (response.data.result.error) {
    throw new Error(response.data.result.error);
  }
  return JSON.parse(Buffer.from(response.data.result.result).toString("utf-8"));
}
function createArgs(contractId: string, methodName: string, args: any) {
  const argsBase64 = Buffer.from(JSON.stringify(args)).toString("base64");

  return {
    jsonrpc: "2.0",
    id: "dontcare",
    method: "query",
    params: {
      request_type: "call_function",
      finality: "final",
      account_id: contractId,
      method_name: methodName,
      args_base64: argsBase64,
    },
  };
}
export function toBig(value: string, decimals: number) {
  return new BN(value).mul(new BN(10).pow(new BN(decimals))).toString();
}
