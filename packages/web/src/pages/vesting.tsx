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
        size: "30",
      },
      skip: !user.isConnected,
    }
  );

  const { data: token, loading: tokenLoading } = useNearQuery("ft_metadata", {
    contract: "jump_token.testnet",
    skip: !user.isConnected,
  });

  console.log(items);

  const data = useMemo(() => {
    if (vestingLoading && tokenLoading) {
      return;
    }

    return items.reduce(
      (prev, token) => {
        prev.items.push(token);

        prev.totalLocked += Number(token.locked_value);
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

  console.log(items);

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
              value={`${formatNumber(
                data?.totalLocked,
                data?.token?.decimals
              )} ${data?.token?.symbol}`}
              bottomText="All amount locked"
            />

            <ValueBox
              borderColor={glassyWhiteOpaque}
              title="Total Unlocked"
              value={`${formatNumber(
                data?.totalUnlocked,
                data?.token?.decimals
              )} ${data?.token?.symbol}`}
              bottomText="All amount locked"
            />

            <ValueBox
              borderColor={glassyWhiteOpaque}
              title="Total Withdrawn"
              value={`${formatNumber(
                data?.totalWithdrawn,
                data?.token?.decimals
              )} ${data?.token?.symbol}`}
              bottomText="All amount locked"
            />
          </>
        }
      />

      <If condition={!vestingLoading && !tokenLoading && !isEmpty(items)}>
        {items && (
          <Stack spacing="32px">
            {items.map(
              (
                {
                  locked_value,
                  start_timestamp,
                  vesting_duration,
                  withdrawn_tokens,
                  available_to_withdraw,
                },
                index
              ) => (
                <VestingCard
                  id={index}
                  token={token}
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

      <If condition={!vestingLoading && !tokenLoading && isEmpty(items)}>
        <Flex width="100%" justifyContent="center" marginTop="120px">
          <Text
            color="#EB5757"
            fontSize="20px"
            fontWeight="400"
            lineHeight="24px"
            marginLeft="16px"
          >
            Oops! No collections available
          </Text>
        </Flex>
      </If>
    </PageContainer>
  );
};
