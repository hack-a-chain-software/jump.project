import toast from "react-hot-toast";
import isEmpty from "lodash/isEmpty";
import { useTheme } from "@/hooks/theme";
import { WalletIcon } from "@/assets/svg";
import { useState } from "react";
import { NFTStakeModal, NFTUnstakeModal } from "@/modals";
import { useNearContractsAndWallet } from "@/context/near";
import { useNftStaking } from "@/stores/nft-staking-store";
import { GradientButton, GradientText } from "@/components/shared";
import { Flex, Box, Text, useColorModeValue, Stack } from "@chakra-ui/react";

export function NFTStakingUserActions({ collection }: { collection: string }) {
  const { wallet, connectWallet } = useNearContractsAndWallet();
  const { jumpGradient, darkPurple, gradientBoxTopCard, glassyWhiteOpaque } =
    useTheme();

  const { tokens } = useNftStaking();

  const [showStake, setShowStake] = useState(false);
  const [showUnstake, setShowUnstake] = useState(false);

  const toggleStakeModal = () => {
    if (!wallet?.isSignedIn()) {
      connectWallet();

      return;
    }

    setShowStake(!showStake);
  };

  const toggleUnstakeModal = () => {
    if (!wallet?.isSignedIn()) {
      connectWallet();

      return;
    }

    if (isEmpty(tokens)) {
      toast("Ooops! You don't have staked NFT's ");

      return;
    }

    setShowUnstake(!showUnstake);
  };

  return (
    <>
      <NFTStakeModal
        isOpen={showStake}
        collection={collection}
        onClose={() => toggleStakeModal()}
      />

      <NFTUnstakeModal
        selected={tokens}
        isOpen={showUnstake}
        collection={collection}
        onClose={() => toggleUnstakeModal()}
      />

      <Flex flex={1}>
        <Box
          ml="20px"
          display="flex"
          p="3px"
          w="100%"
          background={useColorModeValue("transparent", jumpGradient)}
          borderRadius="26px"
        >
          <Box
            display="flex"
            flexDirection="column"
            w="100%"
            h="100%"
            borderRadius="24px"
            bg={useColorModeValue(jumpGradient, gradientBoxTopCard)}
          >
            <Box
              p="40px"
              bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
            >
              <GradientText
                mb="-5px"
                fontWeight="800"
                fontSize={16}
                color="white"
              >
                User Area
              </GradientText>
              <Text
                fontWeight="800"
                fontSize={30}
                letterSpacing="-0.03em"
                mb={3}
                color="white"
              >
                Interact with Your Position
              </Text>
              <Text mt="-10px" fontWeight="semibold" color="white">
                This is the area wher you can interact with the Staking as a
                Investor
              </Text>
              <Stack mt="50px" gap={1}>
                <GradientButton
                  onClick={() => toggleStakeModal()}
                  bg={useColorModeValue("white", darkPurple)}
                  justifyContent="space-between"
                >
                  Stake NFT <WalletIcon />
                </GradientButton>
                <GradientButton
                  onClick={() => toggleUnstakeModal()}
                  bg={useColorModeValue("white", darkPurple)}
                  justifyContent="space-between"
                >
                  Unstake All NFTs <WalletIcon />
                </GradientButton>
                <GradientButton
                  onClick={() => {}}
                  bg={useColorModeValue("white", darkPurple)}
                  justifyContent="space-between"
                >
                  Claim Pool Rewards <WalletIcon />
                </GradientButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
