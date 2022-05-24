import { Account, Contract } from "near-api-js";
import { WithNearParams } from "../helpers/types";

export type UserData = {
  balance: string;
  user_rps: string;
  unclaimed_rewards: string;
};

export interface StakingContract extends Contract {
  initialize_staking(
    config: WithNearParams<{
      owner: Account["accountId"];
      token_address: Account["accountId"];
      yield_per_period: string;
      period_duration: string;
    }>
  ): Promise<void>;
  get_user_data(
    config: WithNearParams<{
      account_id: Account["accountId"];
    }>
  ): Promise<UserData>;
  unregister_storage(config: WithNearParams<unknown>): Promise<void>;
  register_storage(
    config: WithNearParams<{ account_id: Account["accountId"] }>
  ): Promise<void>;
  claim(config: WithNearParams<unknown>): Promise<void>;
  unstake(config: WithNearParams<unknown>): Promise<void>;
  unstake_all(config: WithNearParams<unknown>): Promise<void>;
}
