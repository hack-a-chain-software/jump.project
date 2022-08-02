import * as R from "ramda";
import {
  Box,
  BoxProps,
  Flex,
  Image,
  Text,
  useColorModeValue,
  Skeleton,
} from "@chakra-ui/react";
import { useTheme } from "../../../hooks/theme";
import { ValueBox } from "../../shared";
import { formatNumber } from "@near/ts";
import { StakingToken } from "@/stores/nft-staking-store";

export function NFTStakingCard(
  props: BoxProps & { name: string; logo: string; rewards: StakingToken[] }
) {
  const { jumpGradient, gradientBoxTopCard, glassyWhiteOpaque } = useTheme();

  return (
    <Box
      color="white"
      cursor="pointer"
      p="3px"
      background={useColorModeValue("transparent", jumpGradient)}
      borderRadius="26px"
      {...(R.omit(
        ["name", "logo", "tokens", "frequency", "rewards"],
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
            <Skeleton
              height="60px"
              width="60px"
              borderRadius={30}
              isLoaded={!!props.logo}
            >
              <Image src={props.logo} w="60px" h="60px" borderRadius={30} />
            </Skeleton>

            <Skeleton height="51px" isLoaded={!!props.name}>
              <Text fontSize={34} fontWeight="800" letterSpacing="-0.03em">
                {props.name}
              </Text>
            </Skeleton>

            <Skeleton height="54px" width="500px" isLoaded={!!props.name}>
              <Text
                w="500px"
                fontSize={18}
                fontWeight="600"
                letterSpacing="-0.03em"
              >
                Earn JUMP, ACOVA, CGK as rewards by staking on {props.name}{" "}
                staking pool
              </Text>
            </Skeleton>
          </Flex>
          <Flex gap={5}>
            {props.rewards?.map(({ name, symbol, perMonth, decimals }, i) => (
              <ValueBox
                borderColor={glassyWhiteOpaque}
                title={name + " Rewards"}
                value={formatNumber(Number(perMonth), decimals) + " " + symbol}
                bottomText="Per Month"
                key={"nft-staking-rewards" + i}
              />
            ))}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
