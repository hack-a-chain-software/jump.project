// demonstrates how to query the state without setting
// up an account. (View methods only)
import { NearQuery } from "@/types";
import { providers } from "near-api-js";

require("dotenv").config();

const provider = new providers.JsonRpcProvider(process.env.NEAR_RPC_URL);

export interface StakedMetaResponse {
  title: string;
  description: string;
  media: string;
}

export async function findStakedMetadata(
  collection_id: string,
  nft_id: string
): Promise<StakedMetaResponse> {
  const args = {
    token_id: nft_id,
  };

  const rawResult = await provider.query<NearQuery>({
    request_type: "call_function",
    account_id: collection_id,
    method_name: "nft_token",
    finality: "optimistic",
    args_base64: btoa(JSON.stringify(args)),
  });

  // format result
  const res = JSON.parse(Buffer.from(rawResult.result).toString());

  return res?.metadata;
}
