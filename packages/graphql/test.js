// demonstrates how to query the state without setting
// up an account. (View methods only)
const { providers } = require("near-api-js");

const provider = new providers.JsonRpcProvider("https://rpc.mainnet.near.org");

async function findTokenMetadata(token_address) {
  const rawResult = await provider.query({
    request_type: "call_function",
    account_id: token_address,
    method_name: "ft_metadata",
    finality: "optimistic",
    args_base64: "e30=",
  });

  // format result
  const res = JSON.parse(Buffer.from(rawResult.result).toString());
  console.log(res);
  return res;
}

findTokenMetadata("usdc.tkn.near");
