import { motion } from "framer-motion";
import { Stack, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import {
  If,
  TopCard,
  VestingCard,
  PageContainer,
  ValueBox,
  Select,
  GradientButton,
} from "../components";
import isEmpty from "lodash/isEmpty";
import { useTheme } from "@/hooks/theme";
import { useNearQuery } from "react-near";
import { useNearContractsAndWallet } from "@/context/near";
import { addMilliseconds, isBefore } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { formatNumber } from "@near/ts";
import { ContractData, Token, useVestingStore } from "@/stores/vesting-store";
import { WalletConnection } from "near-api-js";

export const Vesting = () => {
  const { glassyWhiteOpaque, darkPurple } = useTheme();

  const { wallet, isFullyConnected } = useNearContractsAndWallet();

  const [filter, setFilter] = useState("");

  const {
    getInvestorInfo,
    getVestings,
    withdraw,
    investorInfo,
    vestings,
    loading,
  } = useVestingStore();

  const { data: storage } = useNearQuery("storage_balance_of", {
    contract: "jump_token.testnet",
    variables: {
      account_id: wallet?.getAccountId(),
    },
    skip: !isFullyConnected,
  });

  useEffect(() => {
    (async () => {
      if (!isFullyConnected) {
        return;
      }

      await getVestings(wallet as WalletConnection);
      await getInvestorInfo(wallet as WalletConnection);
    })();
  }, [isFullyConnected]);

  const filtered = useMemo(() => {
    if (!filter) {
      return vestings;
    }

    return vestings.filter(({ start_timestamp, vesting_duration }) => {
      const created = new Date(start_timestamp / 1000000);

      const endAt = addMilliseconds(created, vesting_duration / 1000000);

      const today = new Date();

      if (filter === "complete") {
        return isBefore(endAt, today);
      }

      if (filter === "runing") {
        return isBefore(today, endAt);
      }

      return false;
    });
  }, [filter, vestings]);

  return (
    <PageContainer>
      <TopCard
        gradientText="Locked Jump"
        bigText="Lock. Unlock. Withdraw."
        bottomDescription="Manage and Withdraw your locked tokens that you have vesting  period"
        py
        content={
          !loading && (
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Flex className="space-x-[1.25rem]">
                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  title="Total Locked"
                  value={
                    isFullyConnected
                      ? `${formatNumber(
                          investorInfo?.totalLocked || 0,
                          investorInfo?.token?.decimals || 0
                        )} ${investorInfo?.token?.symbol}`
                      : "Connect Wallet"
                  }
                  bottomText="All amount locked"
                />

                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  title="Total Unlocked"
                  value={
                    isFullyConnected
                      ? `${formatNumber(
                          investorInfo?.totalUnlocked || 0,
                          investorInfo?.token?.decimals || 0
                        )} ${investorInfo?.token?.symbol}`
                      : "Connect Wallet"
                  }
                  bottomText="Unlocked amount"
                />

                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  title="Total Withdrawn"
                  value={
                    isFullyConnected
                      ? `${formatNumber(
                          investorInfo?.totalWithdrawn || 0,
                          investorInfo?.token?.decimals || 0
                        )} ${investorInfo?.token?.symbol}`
                      : "Connect Wallet"
                  }
                  bottomText="Total quantity "
                />
              </Flex>
            </motion.div>
          )
        }
      />

      <If
        fallback={
          isFullyConnected ? (
            <Flex
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Flex
                marginX="auto"
                height="100%"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
              >
                <Text
                  fontWeight="800"
                  fontSize={30}
                  letterSpacing="-0.03em"
                  mb={3}
                >
                  Oops! No vestings available
                </Text>
              </Flex>
            </Flex>
          ) : (
            <Flex
              marginX="auto"
              height="100%"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Text
                fontWeight="800"
                fontSize={30}
                letterSpacing="-0.03em"
                mb={3}
              >
                You must be logged in to view all vestings
              </Text>

              <Text
                _hover={{
                  opacity: 0.8,
                }}
                // onClick={() => toggleStakeModal()}
                marginTop="-12px"
                cursor="pointer"
                color="#761BA0"
                fontWeight="800"
                fontSize={34}
                letterSpacing="-0.03em"
                mb={3}
              >
                Connect Wallet!
              </Text>
            </Flex>
          )
        }
        condition={!isEmpty(investorInfo) && !isEmpty(vestings)}
      >
        <>
          <Flex justifyContent="space-between">
            <Select
              onChange={(event) => setFilter(event?.target?.value)}
              placeholder="Filter"
            >
              <option value="completed">Completed</option>
              <option value="runing">Runing</option>
            </Select>

            <Flex maxW="330px">
              <GradientButton
                width="150px"
                onClick={() => {
                  withdraw(
                    vestings
                      .filter(({ available_to_withdraw }) => {
                        return (
                          Number(available_to_withdraw) >
                          Math.pow(10, investorInfo.token?.decimals || 0)
                        );
                      })
                      .map(({ id }) => String(id)),
                    storage,
                    wallet as WalletConnection
                  );
                }}
                justifyContent="center"
                bg={useColorModeValue("white", darkPurple)}
              >
                Claim All
              </GradientButton>
            </Flex>
          </Flex>
          {vestings && (
            <Stack spacing="32px">
              {filtered.map((vesting, index) => (
                <VestingCard
                  {...vesting}
                  token={investorInfo.token as Token}
                  contractData={investorInfo.contractData as ContractData}
                  key={"vesting-" + index}
                />
              ))}
            </Stack>
          )}
        </>
      </If>
    </PageContainer>
  );
};
