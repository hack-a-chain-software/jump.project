import { StakingContract, UserData } from "@near/ts";
import { Account } from "near-api-js";

const oneYOcto = "1";
const baseGas = "300000000000000";

/**
 * @name Staking
 * @description - This will handle the interactions
 * with the contract with better TS types
 */
export class Staking {
  private contract: StakingContract;

  /**
   * @constructor
   * @param contract
   */
  constructor(contract: any) {
    this.contract = contract as any;
  }

  async initialize_staking(params: {
    owner: Account["accountId"];
    token_address: Account["accountId"];
    yield_per_period: string;
    period_duration: string;
  }) {
    return await this.contract.initialize_staking({
      params,
      amount: oneYOcto,
      gas: baseGas,
    });
  }
  async get_user_data(params: {
    account_id: Account["accountId"];
  }): Promise<UserData> {
    return await this.contract.get_user_data({
      params,
    });
  }
  async unregister_storage() {
    return await this.contract.unregister_storage({
      gas: baseGas,
      amount: oneYOcto,
    });
  }
  async register_storage(params: { account_id: Account["accountId"] }) {
    await this.contract.register_storage({
      params,
      gas: baseGas,
      amount: oneYOcto,
    });
  }
  async claim() {
    await this.contract.claim({
      gas: baseGas,
      amount: oneYOcto,
    });
  }
  async unstake() {
    await this.contract.unstake({
      gas: baseGas,
      amount: oneYOcto,
    });
  }
  async unstake_all() {
    await this.contract.unstake_all({
      gas: baseGas,
      amount: oneYOcto,
    });
  }
}
