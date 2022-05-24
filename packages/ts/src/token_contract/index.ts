import { Account, Contract } from "near-api-js";
import { Option, WithNearParams } from "../helpers/types";

interface TokenMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: Buffer | null;
  decimals: number;
}

export interface TokenContract extends Contract {
  initialize(
    params: WithNearParams<{
      owner_id: Account["accountId"];
      total_supply: string;
      metadata: TokenMetadata;
    }>
  ): Promise<void>;

  new_default_meta(
    params: WithNearParams<{
      owner_id: Account["accountId"];
      total_supply: string;
    }>
  ): Promise<void>;

  ft_transfer_call(
    params: WithNearParams<{
      receiver_id: string;
      amount: string;
      memo: Option<string>;
      msg: string;
    }>
  ): Promise<void>;

  ft_total_supply(): Promise<string>;

  ft_balance_of(
    params: WithNearParams<{ account_id: string }>
  ): Promise<string>;
}
