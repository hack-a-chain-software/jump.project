import axios from "axios";
import { BN } from "bn.js";
import shell from "shelljs";

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
export async function isValidAccount(accountId: string): Promise<boolean> {
  await exec(`near state ${accountId}`, {
    silent: true,
  }).catch((_err) => {
    return false;
  });

  return true;
}

export async function isValidNftContract(contractId: string): Promise<boolean> {
  await viewMethod(contractId, "nft_metadata", {}).catch((_err) => {
    return false;
  });

  return true;
}

export async function isValidNep141Contract(
  contractId: string
): Promise<boolean> {
  await viewMethod(contractId, "ft_metadata", {}).catch((_err) => {
    return false;
  });

  return true;
}

function exec(cmd: string, options?: any) {
  return new Promise<string>((resolve, reject) => {
    shell.exec(cmd, { async: true, ...options }, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}
