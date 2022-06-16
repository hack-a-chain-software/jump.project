import { Flex, useColorMode, useColorModeValue } from "@chakra-ui/react";
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
      className={`pt-[30px] ${useColorModeValue(
        "bg-white",
        "bg-black"
      )} fixed top-0 right-0 z-2 left-[120px] flex items-center justify-center`}
    >
      <Flex
        borderBottomColor={useColorModeValue("grey.100", "grey.600")}
        borderBottomWidth={1}
        className="flex px-10 pb-8 items-center w-[100%] justify-between"
      >
        <JumpTextIcon />
        <Flex alignItems="center" gap={5}>
          <Button bg="brand.900" color="white" onClick={toggleColorMode}>
            <MoonIcon />
          </Button>
          <If
            condition={!!user.isConnected}
            fallback={
              <Button
                bg="brand.900"
                color="white"
                onClick={() => user.connect()}
              >
                Connect Wallet
                <WalletIcon />
              </Button>
            }
          >
            <Button bg="brand.900" color="white" onClick={user.disconnect}>
              Disconnect Wallet
              <WalletIcon />
            </Button>
          </If>
        </Flex>
      </Flex>
    </div>
  );
}
