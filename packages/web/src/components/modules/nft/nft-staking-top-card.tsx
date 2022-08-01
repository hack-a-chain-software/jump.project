import * as R from "ramda";
import {
  Box,
  BoxProps,
  Flex,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTheme } from "../../../hooks/theme";
import { ValueBox } from "../../shared";
import { formatNumber } from "@near/ts";
import { useNftStaking } from "@/stores/nft-staking-store";

export function NFTStakingTopCard(props: BoxProps) {
  const { jumpGradient, gradientBoxTopCard, glassyWhiteOpaque } = useTheme();
  const { stakingInfo } = useNftStaking();

  return (
    <Box
      color="white"
      cursor="pointer"
      p="3px"
      background={useColorModeValue("transparent", jumpGradient)}
      borderRadius="26px"
      {...(R.omit(
        ["collectionName", "collectionLogo", "tokens", "frequency", "rewards"],
        props
      ) as Record<string, string>)}
    >
      <Box
        w="100%"
        bg={useColorModeValue(jumpGradient, gradientBoxTopCard)}
        borderRadius="24px"
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          w="100%"
          p="40px"
          borderRadius="24px"
          bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
        >
          <Flex userSelect="none" direction="column">
            <Image
              src={stakingInfo.collectionMetadata?.icon}
              w="60px"
              h="60px"
              borderRadius={30}
            />
            <Text fontSize={34} fontWeight="800" letterSpacing="-0.03em">
              {stakingInfo.collectionMetadata?.name}
            </Text>
            <Text
              w="500px"
              fontSize={18}
              fontWeight="600"
              letterSpacing="-0.03em"
            >
              Earn JUMP, ACOVA, CGK as rewards by staking on{" "}
              {stakingInfo.collectionMetadata?.name} staking pool
            </Text>
          </Flex>
          <Flex gap={5}>
            {stakingInfo?.stakingTokenRewards?.map(
              ({ name, symbol, perMonth, decimals }, i) => (
                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  title={name + " Rewards"}
                  value={
                    formatNumber(Number(perMonth), decimals) + " " + symbol
                  }
                  bottomText="Per Month"
                  key={"nft-staking-rewards" + i}
                />
              )
            )}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
