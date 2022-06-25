import { Flex, useColorMode } from "@chakra-ui/react";
import { useNearUser } from "react-near";
import { MoonIcon, WalletIcon } from "../../assets/svg";
import { JumpTextIcon } from "../../assets/svg/jump-text";
import { contractName } from "../../env/contract";
import { Button } from "./button";
import { If } from "./if";

export function Header() {
  const user = useNearUser(contractName);
  const { toggleColorMode } = useColorMode();

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
            condition={!!user.isConnected}
            fallback={
              <Button onClick={() => user.connect()}>
                Connect Wallet
                <WalletIcon />
              </Button>
            }
          >
            <Button onClick={user.disconnect}>
              Disconnect Wallet
              <WalletIcon />
            </Button>
          </If>
        </Flex>
      </Flex>
    </div>
  );
}
