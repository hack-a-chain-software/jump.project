// demonstrates how to query the state without setting
// up an account. (View methods only)
import { NearQuery } from "@/types";
import { providers } from "near-api-js";

require("dotenv").config();

const provider = new providers.JsonRpcProvider(process.env.NEAR_RPC_URL);

export interface CollectionMetaResponse {
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  base_uri: string;
}

export async function findCollectionMetadata(
  collection_address: string
): Promise<CollectionMetaResponse> {
  const rawResult = await provider.query<NearQuery>({
    request_type: "call_function",
    account_id: collection_address,
    method_name: "nft_metadata",
    finality: "optimistic",
    args_base64: "e30=",
  });

  // format result
  const res = JSON.parse(Buffer.from(rawResult.result).toString());
  return res;
}
