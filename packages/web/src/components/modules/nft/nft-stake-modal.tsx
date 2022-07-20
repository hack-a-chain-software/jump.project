import {
  Flex,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  Text,
  ModalContentProps,
  Box,
  Grid,
  Image,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";

import { useNearWallet, useNearUser } from "react-near";

import { Button } from "@jump/src/components";
import { CloseIcon, CheckIcon, InfoIcon } from "@jump/src/assets/svg";
import { useTheme } from "@jump/src/hooks/theme";

import { useCollection } from "@jump/src/stores/collection";
import { contractName } from "@jump/src/env/contract";

const modalRadius = 20;

interface DialogParams extends Partial<ModalContentProps> {
  isOpen: boolean;
  onClose: () => void;
  stakeNFT: () => void;
}

export function NFTStakeModal({
  isOpen = false,
  onClose = () => {},
  stakeNFT = () => {},
  ...modalContentProps
}: Partial<DialogParams>) {
  const { jumpGradient } = useTheme();

  const wallet = useNearWallet();
  const user = useNearUser(contractName);

  const { tokens, loading, fetchTokens } = useCollection();

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (user.isConnected) {
      (async () => {
        await fetchTokens(wallet, "negentra_base_nft.testnet");
      })();
    }
  }, [user.isConnected]);

  return (
    <Modal
      closeOnEsc
      closeOnOverlayClick
      isCentered
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay backdropFilter="blur(20px)" border="none" />

      <ModalContent
        id="content"
        bg="transparent"
        minW="max-content"
        borderRadius={modalRadius}
        {...modalContentProps}
      >
        <Box bg={jumpGradient} p="6px" borderRadius={25}>
          <ModalBody
            p="30px"
            pl="40px"
            height="max-content"
            width="max-content"
            bg="rgba(0,0,0,0.8)"
            borderRadius={`${modalRadius}px`}
          >
            <Flex direction="column">
              <Text
                as="h1"
                mt="10px"
                mb="15px"
                fontSize="28px"
                fontWeight="bold"
                color="white"
              >
                Stake NFT
              </Text>

              <Grid
                templateColumns="repeat(3, 300px)"
                gap="34px"
                width="max-content"
              >
                {tokens.map(({ metadata, token_id }, i) => (
                  <Flex
                    key={"nft-stake-token" + i}
                    borderRadius="20px"
                    cursor="pointer"
                    width="309px"
                    height="309px"
                    position="relative"
                    onClick={() => setSelected(token_id)}
                  >
                    <Image
                      width="100%"
                      height="100%"
                      borderRadius="20px"
                      src={metadata.media}
                    />

                    <Flex
                      top="22px"
                      right="22px"
                      width="40px"
                      height="40px"
                      borderRadius="5px"
                      position="absolute"
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor={
                        selected === token_id ? "#FDCA68" : "#BDBDBD"
                      }
                    >
                      {selected === token_id && <CheckIcon />}
                    </Flex>

                    <Flex
                      position="absolute"
                      bottom="22px"
                      left="22px"
                      right="22px"
                      height="76px"
                      borderRadius="10px"
                      background="#c4c4c466"
                      backdropFilter="blur(100px)"
                      padding="21px 18px"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Flex flexDirection="column" marginRight="12px">
                        <Text
                          color="#000000"
                          lineHeight="15px"
                          fontSize="12px"
                          fontWeight="400"
                          fontFamily="Inter"
                          marginBottom="-3px"
                        >
                          {metadata.title}
                        </Text>

                        <Text
                          color="#000000"
                          lineHeight="19px"
                          fontSize="16px"
                          fontWeight="500"
                          fontFamily="Inter"
                        >
                          {metadata.description}
                        </Text>
                      </Flex>

                      <InfoIcon width="24px" height="24px" />
                    </Flex>
                  </Flex>
                ))}
              </Grid>

              <Flex marginX="auto" marginTop="48px">
                <Button px="50px" onClick={() => {}} bg="white" color="black">
                  Stake Now!
                </Button>
              </Flex>
            </Flex>
          </ModalBody>
        </Box>
      </ModalContent>
    </Modal>
  );
}
