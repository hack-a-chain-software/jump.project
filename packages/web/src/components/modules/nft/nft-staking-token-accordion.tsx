import BN from "bn.js";
import { motion } from "framer-motion";
import { InfoIcon } from "@/assets/svg";
import { ValueBox } from "@/components";
import { useTheme } from "@/hooks/theme";
import { formatNumber } from "@near/ts";
import { Token, StakingToken } from "@/stores/nft-staking-store";
import { Flex, Text, Image, useColorModeValue } from "@chakra-ui/react";
import { useMemo } from "react";
import { format, isBefore, addMilliseconds } from "date-fns";

export function TokenAccordion({
  token,
  rewards,
  metadata,
  token_id,
  balance,
  stakedAt,
  minStakedPeriod,
  penalty,
}: Token & {
  rewards: StakingToken[];
  minStakedPeriod: string;
  penalty: string;
  token: string;
}) {
  const { jumpGradient, gradientBoxTopCard, glassyWhiteOpaque } = useTheme();

  const staked = useMemo(() => {
    return new Date(Number(stakedAt) / 1000000);
  }, [stakedAt, token_id]);

  const endPenalty = useMemo(() => {
    return addMilliseconds(staked, Number(minStakedPeriod) / 1000000);
  }, [minStakedPeriod, token_id]);

  const hasWithdrawPenalty = useMemo(() => {
    const today = new Date();

    return isBefore(today, endPenalty);
  }, [staked, endPenalty, token_id]);

  const withdrawPenalty = useMemo(() => {
    const denom = new BN("10000000000000000000000");
    const penaltyBN = new BN(penalty);

    return penaltyBN.div(denom).toString() + "%";
  }, [rewards, token_id, penalty]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      key={"nft-staking-token-accordion" + token_id}
    >
      <Flex width="100%" flexDirection="column">
        <Flex width="100%">
          <Flex width="309px" height="298px">
            <Image
              width="100%"
              height="100%"
              borderRadius="20px"
              src={metadata.media}
            />
          </Flex>

          <Flex
            flexGrow="1"
            height="298px"
            marginLeft="20px"
            padding="3px"
            borderRadius="25px"
            background={useColorModeValue("transparent", jumpGradient)}
          >
            <Flex
              flexGrow="1"
              borderRadius="25px"
              boxSize="border-box"
              bg={useColorModeValue(jumpGradient, gradientBoxTopCard)}
            >
              <Flex
                flexGrow="1"
                borderRadius="25px"
                boxSize="border-box"
                flexDirection="column"
                padding="35px 39px 35px 39px"
                bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
              >
                <Flex marginBottom="25px" flexDirection="column">
                  <Text
                    color="white"
                    fontSize="20px"
                    fontWeight="700"
                    letterSpacing="-0.03em"
                  >
                    {metadata.description}
                  </Text>

                  <Text
                    color="white"
                    fontSize="24px"
                    fontWeight="600"
                    lineHeight="29px"
                  >
                    {metadata.title}
                  </Text>
                </Flex>

                <Flex gap="15px" width="100%">
                  {rewards?.map(({ account_id, name, symbol, decimals }, i) => (
                    <ValueBox
                      minWidth="250px"
                      borderColor={glassyWhiteOpaque}
                      title={name + " Rewards"}
                      color="white"
                      value={
                        formatNumber(Number(balance[account_id]), decimals) +
                        " " +
                        symbol
                      }
                      bottomText={`Total accumulated`}
                      key={"nft-staking-rewards" + i}
                    />
                  ))}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex
          width="100%"
          background="#EB5757"
          borderRadius="20px"
          minHeight="90px"
          alignItems="center"
          padding="0px 32px"
          margin="22px 0px 36px 0px"
          opacity={hasWithdrawPenalty ? 1 : 0}
        >
          <InfoIcon color="white" />

          <Text
            color="white"
            fontSize="20px"
            fontWeight="400"
            lineHeight="24px"
            marginLeft="16px"
          >
            This NFT is subject to an early withdraw penalty of{" "}
            {withdrawPenalty}, wait until
            {format(endPenalty, " dd MMMM, yyyy - HH:mm a")}
          </Text>
        </Flex>
      </Flex>
    </motion.div>
  );
}
