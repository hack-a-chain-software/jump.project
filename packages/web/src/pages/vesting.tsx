import { Stack, Flex, Text } from "@chakra-ui/react";
import {
  If,
  TopCard,
  VestingCard,
  PageContainer,
  ValueBox,
} from "../components";
import isEmpty from "lodash/isEmpty";
import { useNearQuery } from "react-near";
import { useTheme } from "@jump/src/hooks/theme";
import { getNear } from "@jump/src/hooks/near";

import { addMilliseconds } from "date-fns";
import { useMemo } from "react";
import { formatNumber } from "@near/ts";

export const Vesting = () => {
  const { glassyWhiteOpaque } = useTheme();

  const { user } = getNear(import.meta.env.VITE_LOCKED_CONTRACT);

  const { data: items = [], loading: vestingLoading } = useNearQuery(
    "view_vesting_paginated",
    {
      contract: import.meta.env.VITE_LOCKED_CONTRACT,
      variables: {
        account_id: user.address,
        initial_id: "0",
        size: "1000",
      },
      skip: !user.isConnected,
    }
  );

  const { data: token, loading: tokenLoading } = useNearQuery("ft_metadata", {
    contract: import.meta.env.VITE_BASE_TOKEN,
    skip: !user.isConnected,
  });

  const data = useMemo(() => {
    if (vestingLoading && tokenLoading) {
      return;
    }

    return items.reduce(
      (prev, token) => {
        prev.items.push(token);

        prev.totalLocked +=
          Number(token.locked_value) -
          Number(token.available_to_withdraw) -
          Number(token.withdrawn_tokens);
        prev.totalUnlocked += Number(token.available_to_withdraw);
        prev.totalWithdrawn += Number(token.withdrawn_tokens);

        return prev;
      },
      {
        token,
        items: [],
        totalLocked: 0,
        totalUnlocked: 0,
        totalWithdrawn: 0,
      }
    );
  }, [vestingLoading, tokenLoading]);

  return (
    <PageContainer loading={vestingLoading || tokenLoading}>
      <TopCard
        gradientText="Locked Jump"
        bigText="Lock. Unlock. Withdraw."
        bottomDescription="Manage and Withdraw your locked tokens that you have vesting  period"
        py
        content={
          <>
            <ValueBox
              borderColor={glassyWhiteOpaque}
              title="Total Locked"
              value={
                user.isConnected
                  ? `${formatNumber(
                      data?.totalLocked,
                      data?.token?.decimals
                    )} ${data?.token?.symbol}`
                  : "Connect Wallet  "
              }
              bottomText="All amount locked"
            />

            <ValueBox
              borderColor={glassyWhiteOpaque}
              title="Total Unlocked"
              value={
                user.isConnected
                  ? `${formatNumber(
                      data?.totalUnlocked,
                      data?.token?.decimals
                    )} ${data?.token?.symbol}`
                  : "Connect Wallet"
              }
              bottomText="Unlocked amount"
            />

            <ValueBox
              borderColor={glassyWhiteOpaque}
              title="Total Withdrawn"
              value={
                user.isConnected
                  ? `${formatNumber(
                      data?.totalWithdrawn,
                      data?.token?.decimals
                    )} ${data?.token?.symbol}`
                  : "Connect Wallet"
              }
              bottomText="Total quantity "
            />
          </>
        }
      />

      <If
        fallback={
          user.isConnected ? (
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
        condition={!vestingLoading && !tokenLoading && !isEmpty(items)}
      >
        {items && (
          <Stack spacing="32px">
            {items.map(
              (
                {
                  fast_pass,
                  locked_value,
                  start_timestamp,
                  vesting_duration,
                  withdrawn_tokens,
                  available_to_withdraw,
                },
                index
              ) => (
                <VestingCard
                  id={String(index)}
                  token={token}
                  fast_pass={fast_pass}
                  totalAmount={locked_value}
                  key={"vesting-" + index}
                  availableWidthdraw={available_to_withdraw}
                  withdrawnTokens={withdrawn_tokens}
                  createdAt={new Date(start_timestamp / 1000000)}
                  endsAt={addMilliseconds(
                    new Date(start_timestamp / 1000000),
                    vesting_duration / 1000000
                  )}
                />
              )
            )}
          </Stack>
        )}
      </If>
    </PageContainer>
  );
};
