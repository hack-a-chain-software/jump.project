import create from "zustand";
import toast from "react-hot-toast";
import { getTransaction, executeMultipleTransactions } from "@/tools";
import type { WalletSelector } from "@near-wallet-selector/core";
import { utils } from "near-api-js";

export const useTokenLauncher = create<{
  createToken: (
    deployCost: string,
    accountId: string,
    prefix: string,
    args: string,
    connection: WalletSelector
  ) => Promise<void>;
}>(() => ({
  /** @description - stakes tokens into the contract and sends the deposit to pay storage fees */
  async createToken(deployCost, accountId, prefix, args, connection) {
    try {
      const nearDeployCost = utils.format.formatNearAmount(deployCost);

      const nearDeployCostFormatterd = Number(nearDeployCost)
        .toFixed(2)
        .toString();

      const transaction = getTransaction(
        accountId!,
        import.meta.env.VITE_TOKEN_LAUNCHER_CONTRACT,
        "deploy_new_contract",
        {
          contract_to_be_deployed: "token",
          deploy_prefix: prefix,
          args: args,
        },
        nearDeployCostFormatterd
      );

      const wallet = await connection.wallet();

      await executeMultipleTransactions([transaction], wallet);
    } catch (error) {
      return console.error(toast.error(`Token Launcher Error: ${error}`));
    }
  },
}));
