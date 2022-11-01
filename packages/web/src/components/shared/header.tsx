import { Flex, Text, useColorMode } from "@chakra-ui/react";
import { MoonIcon, MenuIcon } from "../../assets/svg";
import { JumpTextIcon } from "../../assets/svg/jump-text";
import { Button } from "./button";
import { MobileNav } from "./mobile-nav";
import { useState } from "react";
import { AirdropModal } from "@/modals";
import { Wallet } from "./wallet";

export function Header() {
  const { toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  return (
    <div className="z-10 pt-[30px] absolute top-0 right-0 z-2 left-0 flex items-center justify-center md:ml-[120px]">
      <AirdropModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
      <Flex className="flex px-10 pb-8 items-center w-[100%] justify-between">
        <Flex alignItems="center" className="space-x-[48px]">
          <Flex className="hidden md:block">
            <JumpTextIcon />
          </Flex>
        </Flex>
        <Flex alignItems="center" gap={5}>
          <Flex
            className="cursor-pointer hover:opacity-[.8]"
            onClick={() => setShowTokenModal(!showTokenModal)}
          >
            <Text fontSize={20} fontWeight="800" letterSpacing="-0.03em">
              Get Testnet Tokens
            </Text>
          </Flex>

          {/* <Button isDisabled={true} onClick={toggleColorMode}>
            <MoonIcon />
          </Button> */}

          <Wallet />

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
