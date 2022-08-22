import * as R from "ramda";
import {
  Box,
  BoxProps,
  Flex,
  Image,
  Text,
  useColorMode,
  useColorModeValue,
  Skeleton,
} from "@chakra-ui/react";
import isEmpty from "lodash/isEmpty";
import { useTheme } from "../../../hooks/theme";
import { If, ValueBox } from "../../shared";
import { formatNumber, StakingToken } from "@near/ts";

export function NFTStakingCard(
  props: BoxProps & { name?: string; logo?: string; rewards?: StakingToken[] }
) {
  const { jumpGradient, gradientBoxTopCard, glassyWhiteOpaque } = useTheme();

  const { colorMode } = useColorMode();

  const cardGradient = useColorModeValue("transparent", jumpGradient);
  const cardBg = useColorModeValue(jumpGradient, gradientBoxTopCard);
  const cardOpacity = useColorModeValue(glassyWhiteOpaque, "transparent");

  return (
    <Box
      color="white"
      cursor="pointer"
      p="3px"
      background={cardGradient}
      borderRadius="26px"
      {...(R.omit(
        ["name", "logo", "tokens", "frequency", "rewards"],
        props
      ) as Record<string, string>)}
    >
      <Box w="100%" bg={cardBg} borderRadius="24px">
        <Box
          display="flex"
          flexWrap="wrap"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          w="100%"
          p="40px"
          borderRadius="24px"
          gap={5}
          bg={cardOpacity}
          className={
            colorMode === "dark"
              ? "bg-black bg-opacity-[0.05] backdrop-blur-lg"
              : ""
          }
        >
          <Flex
            minHeight="165px"
            userSelect="none"
            direction="column"
            height="100%"
            justifyContent="space-between"
          >
            <Skeleton
              width="60px"
              height="60px"
              borderRadius={30}
              endColor="rgba(255,255,255,0.3)"
              isLoaded={!!props?.logo}
            >
              <Image src={props?.logo} w="51px" h="60px" borderRadius={30} />
            </Skeleton>

            <Skeleton
              minHeight="42px"
              borderRadius={12}
              isLoaded={!!props?.name}
              endColor="rgba(255,255,255,0.3)"
            >
              <Text fontSize={34} fontWeight="800" letterSpacing="-0.03em">
                {props?.name}
              </Text>
            </Skeleton>

            <Skeleton
              minHeight="54px"
              borderRadius={12}
              maxWidth="500px"
              isLoaded={!!props?.name}
              endColor="rgba(255,255,255,0.3)"
            >
              <Text
                maxWidth="500px"
                fontSize={18}
                fontWeight="600"
                letterSpacing="-0.03em"
              >
                Earn {props.rewards?.map(({ symbol }) => symbol).join(", ")} as
                rewards by staking on {props?.name} staking pool
              </Text>
            </Skeleton>
          </Flex>

          <If
            fallback={
              <Flex flexWrap="wrap" gap={5}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    width="210px"
                    height="114px"
                    maxWidth="200px"
                    borderRadius={20}
                    endColor="rgba(255,255,255,0.3)"
                    key={"nft-staking-card-reward=" + i}
                    isLoaded={!!!isEmpty(props.rewards)}
                  />
                ))}
              </Flex>
            }
            condition={!isEmpty(props.rewards)}
          >
            <Flex
              flexGrow={1}
              flexWrap="wrap"
              gap={5}
              className="justify-start 2xl:justify-end"
            >
              {props.rewards?.map(({ name, symbol, perMonth, decimals }, i) => (
                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  title={name + " Rewards"}
                  value={
                    formatNumber(Number(perMonth), decimals) + " " + symbol
                  }
                  flex="1"
                  bottomText="Per Month"
                  key={"nft-staking-rewards" + i}
                  className="w-full max-w-[100%] xl:max-w-[300px] min-w-[210px]"
                />
              ))}
            </Flex>
          </If>
        </Box>
      </Box>
    </Box>
  );
}
