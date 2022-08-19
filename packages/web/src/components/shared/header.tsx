import { Flex, useColorMode } from "@chakra-ui/react";
import { MoonIcon, WalletIcon } from "../../assets/svg";
import { JumpTextIcon } from "../../assets/svg/jump-text";
import { Button } from "./button";
import { If } from "./if";
import { MenuIcon, LogoutIcon } from "@/assets/svg";
import { JumpIcon } from "../../assets/svg/jump-logo";
import { useWalletSelector } from "@/context/wallet-selector";
import { MobileNav } from "./mobile-nav";
import { useState } from "react";

export function Header() {
  const { toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);

  const { accountId, toggleModal, signOut } = useWalletSelector();

  return (
    <div className="z-10 backdrop-blur-lg pt-[30px] bg-transparent fixed top-0 right-0 z-2 left-0 flex items-center justify-center">
      <Flex className="flex px-10 pb-8 items-center w-[100%] justify-between">
        <Flex alignItems="center" className="space-x-[48px]">
          <JumpIcon />

          <Flex className="hidden md:block">
            <JumpTextIcon />
          </Flex>
        </Flex>
        <Flex alignItems="center" gap={5}>
          <Button onClick={toggleColorMode}>
            <MoonIcon />
          </Button>
          <If
            condition={!!accountId}
            fallback={
              <Button onClick={() => toggleModal()}>
                <Flex className="hidden md:block">Connect Wallet</Flex>
                <WalletIcon />
              </Button>
            }
          >
            <Button onClick={() => signOut()}>
              <Flex className="hidden md:block">{accountId}</Flex>
              <LogoutIcon />
            </Button>
          </If>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="block md:hidden"
          >
            <Button onClick={() => setIsOpen(true)}>
              <MenuIcon />
            </Button>
          </Flex>

          <MobileNav isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} />
        </Flex>
      </Flex>
    </div>
  );
}
