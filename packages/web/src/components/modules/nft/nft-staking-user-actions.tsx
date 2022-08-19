import toast from "react-hot-toast";
import isEmpty from "lodash/isEmpty";
import { useTheme } from "@/hooks/theme";
import { WalletIcon } from "@/assets/svg";
import { useState } from "react";
import { useParams } from "react-router";
import { NFTStakeModal, NFTUnstakeModal } from "@/modals";
import { useNftStaking } from "@/stores/nft-staking-store";
import { Button, GradientText } from "@/components/shared";
import { Flex, Box, Text, useColorModeValue, Stack } from "@chakra-ui/react";
import { useWalletSelector } from "@/context/wallet-selector";

export function NFTStakingUserActions(props: any) {
  const { id = "" } = useParams();
  const collection = window.atob(id);

  const { accountId } = useWalletSelector();

  const { jumpGradient, darkPurple, gradientBoxTopCard, glassyWhiteOpaque } =
    useTheme();

  const { tokens } = useNftStaking();

  const [showStake, setShowStake] = useState(false);
  const [showUnstake, setShowUnstake] = useState(false);

  const toggleStakeModal = () => {
    if (!accountId) {
      return;
    }

    setShowStake(!showStake);
  };

  const toggleUnstakeModal = () => {
    if (!accountId) {
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
              <Text
                mt="-10px"
                fontWeight="semibold"
                fontSize={18}
                color="white"
              >
                This is the area wher you can interact with the Staking as a
                Investor
              </Text>
              <Stack mt="50px" gap={1}>
                <Button
                  onClick={() => toggleStakeModal()}
                  justifyContent="space-between"
                >
                  Stake NFT <WalletIcon />
                </Button>
                <Button
                  onClick={() => toggleUnstakeModal()}
                  justifyContent="space-between"
                >
                  Unstake All NFTs <WalletIcon />
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
