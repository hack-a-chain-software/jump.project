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

import { addDays, addMilliseconds } from "date-fns";

export const Vesting = () => {
  const { glassyWhiteOpaque } = useTheme();

  const rewards = ["JUMP", "ACOVA", "CGK"];

  const { user } = getNear(import.meta.env.VITE_LOCKED_CONTRACT);

  const { data: items, loading } = useNearQuery("view_vesting_paginated", {
    contract: import.meta.env.VITE_LOCKED_CONTRACT,
    variables: {
      account_id: user.address,
      initial_id: "0",
      size: "30",
    },
    skip: !user.isConnected,
  });

  const { data: token } = useNearQuery("ft_metadata", {
    contract: "jump_token.testnet",
    skip: !user.isConnected,
  });

  console.log("token info", token);
  console.log("vesting paginated", items);

  return (
    <PageContainer loading={loading}>
      <TopCard
        gradientText="Locked Jump"
        bigText="Lock. Unlock. Withdraw."
        bottomDescription="Manage and Withdraw your locked tokens that you have vesting  period"
        py
        content={
          <>
            {rewards.map((token, i) => (
              <ValueBox
                borderColor={glassyWhiteOpaque}
                title={token + " Rewards"}
                value={10 + " " + token}
                bottomText="All amount locked"
                key={i}
              />
            ))}
          </>
        }
      />

      <If condition={!loading && !isEmpty(items)}>
        {items && (
          <Stack spacing="32px">
            {items.map(
              (
                {
                  locked_value,
                  start_timestamp,
                  vesting_duration,
                  withdrawn_tokens,
                },
                index
              ) => (
                <VestingCard
                  token={token}
                  withdraw={() => {}}
                  buyPass={() => {}}
                  totalAmount={locked_value}
                  key={"vesting-" + index}
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

      <If condition={!loading && isEmpty(items)}>
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
