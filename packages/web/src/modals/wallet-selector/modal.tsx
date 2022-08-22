import {
  Flex,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";

import React, { useEffect, useState } from "react";
import type { ModuleState } from "@near-wallet-selector/core";

import { GradientText } from "@/components";

import { useWalletSelector } from "@/context/wallet-selector";
import { WalletModuleItem } from "./submodules/wallet-module-item";

const modalRadius = 20;

export function WalletSelectorModal(props: {}) {
  const { jumpGradient, glassyWhiteOpaque } = useTheme();

  const { selector, showModal, toggleModal } = useWalletSelector();

  const [modules, setModules] = useState<ModuleState[]>([]);

  useEffect(() => {
    const subscription = selector.store.observable.subscribe((state) => {
      state.modules.sort((current, next) => {
        if (current.metadata.deprecated === next.metadata.deprecated) {
          return 0;
        }

        return current.metadata.deprecated ? 1 : -1;
      });

      setModules(state.modules);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleWalletClick = async (module: ModuleState) => {
    try {
      const { available } = module.metadata;

      if (module.type === "injected" && !available) {
        return;
      }

      const wallet = await module.wallet();

      if (wallet.type === "hardware") {
        return;
      }

      await wallet.signIn({
        contractId: import.meta.env.VITE_NFT_STAKING_CONTRACT,
        methodNames: [],
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Modal
      closeOnEsc
      closeOnOverlayClick
      blockScrollOnMount={true}
      isCentered
      isOpen={showModal}
      onClose={() => toggleModal()}
    >
      <ModalOverlay backdropFilter={"blur(20px)"} border="none" />

      <ModalContent
        id="content"
        flexDirection="row"
        bg="transparent"
        borderRadius={modalRadius}
        overflow="hidden"
      >
        <ModalBody
          overflow="hidden"
          borderRadius={modalRadius}
          width="max-content"
          minWidth="max-content"
          bg={jumpGradient}
          padding="0"
        >
          <Box
            padding="34px"
            bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
          >
            <Flex marginBottom="24px">
              <GradientText
                mb="-5px"
                fontWeight="800"
                fontSize={24}
                color="white"
              >
                Connect Wallet
              </GradientText>
            </Flex>
            <Flex flexDirection="column" className="space-y-[12px]">
              {modules.map((module) => (
                <WalletModuleItem
                  {...module.metadata}
                  key={"wallet-selector-modal-module" + module.id}
                  onClick={() => handleWalletClick(module)}
                />
              ))}
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
