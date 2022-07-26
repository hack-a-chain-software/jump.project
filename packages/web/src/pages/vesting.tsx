import { Stack, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import {
  If,
  TopCard,
  VestingCard,
  PageContainer,
  ValueBox,
} from "../components";
import isEmpty from "lodash/isEmpty";
import { useQuery } from "@apollo/client";
import { useTheme } from "@jump/src/hooks/theme";
import { NftStakingProjectsConnectionDocument } from "@near/apollo";

import { addDays, subDays } from "date-fns";

export const Vesting = () => {
  const navigate = useNavigate();

  const { jumpGradient, gradientBoxTopCard, glassyWhite, glassyWhiteOpaque } =
    useTheme();

  const { data, loading } = useQuery(NftStakingProjectsConnectionDocument);

  const items = data?.nft_staking_projects?.data;

  const rewards = ["JUMP", "ACOVA", "CGK"];

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
            {items.map((_, index) => (
              <VestingCard
                totalAmount={100}
                endsAt={addDays(new Date(), 2)}
                createdAt={subDays(new Date(), 2)}
                withdraw={() => {}}
                buyPass={() => {}}
                key={"vesting-" + index}
              />
            ))}
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
