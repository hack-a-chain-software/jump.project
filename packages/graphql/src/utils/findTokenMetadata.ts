// demonstrates how to query the state without setting
// up an account. (View methods only)
import { EnvVariables } from "@/env";
import { NearQuery } from "@/types";
import { providers } from "near-api-js";

const provider = new providers.JsonRpcProvider(EnvVariables.rpc_url);

export interface TokenMetadataResponse {
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}

export async function findTokenMetadata(
  token_address: string
): Promise<TokenMetadataResponse> {
  const rawResult = await provider.query<NearQuery>({
    request_type: "call_function",
    account_id: token_address,
    method_name: "ft_metadata",
    finality: "optimistic",
    args_base64: "e30=",
  });

  // format result
  const res = JSON.parse(Buffer.from(rawResult.result).toString());
  return res;
}
