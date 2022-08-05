import { useNearQuery } from "react-near";

export function useTokenMetadata(token_id: string) {
  return useNearQuery<{
    decimals: number;
  }>("ft_metadata", {
    contract: token_id,
    poolInterval: 1000 * 60,
    debug: true,
  });
}

export function useTokenBalance(token_id: string, account_id: string) {
  return useNearQuery<string, { account_id: string }>("ft_balance_of", {
    contract: token_id,
    variables: {
      account_id,
    },
    poolInterval: 1000 * 60,
    skip: !account_id,
    debug: true,
  });
}
