import { useMemo, useState } from "react";
import { useNearUser, useNearWallet } from "react-near";
import { LoadingLottie } from "../assets/animations";
import { Button } from "../components/button";
import { If } from "../components/if";
import { NearLogo } from "../components/nearLogo";
import { contractName } from "../env/contract";

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Home() {
  const [newGreetingForm, setNewGreetingForm] = useState("");
  const wallet = useNearWallet();
  const user = useNearUser(contractName);

  const connectToNear = async () => {
    await wallet?.requestSignIn();
    await user.connect();
  };

  const walletConnected = useMemo(() => !!wallet?.isSignedIn(), [wallet]);

  return (
    <div className="p-4 flex min-h-[70vh] flex-1 flex-col items-center justify-center">
      <If fallback={<LoadingLottie />} condition={!user.loading && !!wallet}>
        <div className="flex flex-col justify-between items-center mb-[-80px] px-4">
          <div className="mb-[-180px]">
            <NearLogo size={200} />
          </div>
          <LoadingLottie />
        </div>
        <If
          fallback={
            <>
              <div className="overflow-hidden">
                <h1 className="h-auto text-center font-[800] text-4xl tracking-[-0.06em] w3-animate-bottom overflow-hidden">
                  Welcome to the{" "}
                  <strong className="w3-animate-bottom">Near Monorepo</strong>
                </h1>
              </div>
              <h1 className="mb-8 max-w-[600px] text-center font-semibold opacity-[0.6] text-xl tracking-[-0.06em] ">
                A Monorepo that helps you building Dapps on NEAR in the right
                way, Please Sign In to Interact with The Sample Contract
              </h1>
              <Button onClick={connectToNear}>
                Click Here to Connect Your Wallet
              </Button>
            </>
          }
          condition={walletConnected}
        >
          <div className="overflow-hidden">
            <h1 className="h-auto text-center font-[800] text-4xl tracking-[-0.06em]  overflow-hidden delay-75">
              <strong className="mr-2 w3-animate-bottom">Hello</strong>
              {user.account?.accountId}
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="h-auto text-center font-[800] text-3xl tracking-[-0.06em] w3-animate-bottom overflow-hidden">
              Welcome to the Jump Project on NEAR Protocol
            </h1>
          </div>
          <h1 className="mt-3 max-w-[600px] text-center font-semibold opacity-[0.6] text-xl tracking-[-0.06em] w3-animate-fading-in">
            More Coming Soon
          </h1>
        </If>
      </If>
    </div>
  );
}
