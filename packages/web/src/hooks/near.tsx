import { useNearWallet, useNearUser } from "react-near";
import { ConnectConfig } from "near-api-js";
import { NearEnvironment, NearProvider } from "react-near";

/** @deprecated */
export const getNear = (contract: string) => {
  const wallet = useNearWallet();
  const user = useNearUser(contract);

  return {
    user,
    wallet,
  };
};

export const ProviderNear: React.FC<
  {
    environment?: NearEnvironment;
    children?: React.ReactNode;
  } & Partial<ConnectConfig>
> = NearProvider as any;
