import { WalletIcon } from "@jump/src/assets/svg";
import { useNearContractsAndWallet } from "@jump/src/hooks/near";
import toast from "react-hot-toast";
import { If } from "..";
import { Button } from "./button";

type Props = {
  fallback?: JSX.Element;
};

export function ConnectWalletButton() {
  const { wallet, connectWallet } = useNearContractsAndWallet();

  function connect() {
    toast.promise(connectWallet(), {
      loading: "Connecting with near",
      success: "The Wallet is fully connect",
      error: "Failed to connect the wallet",
    });
  }

  return (
    <If>
      <Button
        color="white"
        border="1px solid white"
        bg="transparent"
        justifyContent="space-between"
        onClick={connect}
      >
        Unstake <WalletIcon />
      </Button>
    </If>
  );
}
