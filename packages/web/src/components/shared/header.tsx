import { Flex, useColorMode } from "@chakra-ui/react";
import { MoonIcon, WalletIcon } from "../../assets/svg";
import { JumpTextIcon } from "../../assets/svg/jump-text";
import { Button } from "./button";
import { If } from "./if";
import { useWalletSelector } from "@/context/wallet-selector";
import { useEffect, useMemo } from "react";

export function Header() {
  const { toggleColorMode } = useColorMode();

  const { selector, accountId, toggleModal, signOut } = useWalletSelector();

  useEffect(() => {
    (async () => {
      const wallet = await selector.wallet();

      console.log("fucking wallet, bro", wallet);
    })();
  }, [selector]);

  return (
    <div
      className={`z-10 backdrop-blur-lg pt-[30px] bg-transparent fixed top-0 right-0 z-2 left-[120px] flex items-center justify-center`}
    >
      <Flex className="flex px-10 pb-8 items-center w-[100%] justify-between">
        <JumpTextIcon />
        <Flex alignItems="center" gap={5}>
          <Button onClick={toggleColorMode}>
            <MoonIcon />
          </Button>
          <If
            condition={!!accountId}
            fallback={
              <Button onClick={() => toggleModal()}>
                Connect Wallet
                <WalletIcon />
              </Button>
            }
          >
            <Button onClick={() => signOut()}>
              {accountId}
              <WalletIcon />
            </Button>
          </If>
        </Flex>
      </Flex>
    </div>
  );
}
