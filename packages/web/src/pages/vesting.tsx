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
import { useNearQuery } from "react-near";
import { useTheme } from "@/hooks/theme";
import { useNearContractsAndWallet } from "@/context/near";
import { addMilliseconds } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { formatNumber } from "@near/ts";

export const Vesting = () => {
  const { glassyWhiteOpaque, darkPurple } = useTheme();

  const { wallet, isFullyConnected } = useNearContractsAndWallet();

  const [vestingLoading, setVestingLoading] = useState(true);
  const [items, setItems] = useState([]);

  const getPages = (length) => {
    const base = length / 10;

    if (!base || base < 1) {
      return 1;
    }

    if (base % 1 !== 0) {
      return base + 1;
    }

    return base;
  };

  const { refetch } = useNearQuery("view_vesting_paginated", {
    contract: import.meta.env.VITE_LOCKED_CONTRACT,
    skip: true,
  });

  const { data: vestingLength, loading: loadingLeng } = useNearQuery(
    "view_vesting_vector_len",
    {
      contract: import.meta.env.VITE_LOCKED_CONTRACT,
      variables: {
        account_id: wallet?.getAccountId(),
      },
      skip: !isFullyConnected,
    }
  );

  useEffect(() => {
    (async () => {
      if (!loadingLeng) {
        return;
      }

      const pages = getPages(vestingLength);

      console.log(pages);

      const vestings = [];

      for (let i = 0; i <= pages; i++) {
        const page = await refetch({
          account_id: wallet?.getAccountId(),
          initial_id: String(i * 10),
          size: "10",
        });

        vestings.push(...page);
      }

      setItems(vestings);
      setVestingLoading(false);
    })();
  }, [loadingLeng, vestingLength]);

  const { data: token, loading: tokenLoading } = useNearQuery("ft_metadata", {
    contract: import.meta.env.VITE_BASE_TOKEN,
    skip: !isFullyConnected,
  });

  const { data: contract, loading: contractLoading } = useNearQuery(
    "view_contract_data",
    {
      skip: !isFullyConnected,
      contract: import.meta.env.VITE_LOCKED_CONTRACT,
    }
  );

  const data = useMemo(() => {
    if (vestingLoading || tokenLoading || contractLoading || loadingLeng) {
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
        contract,
        items: [],
        totalLocked: 0,
        totalUnlocked: 0,
        totalWithdrawn: 0,
      }
    );
  }, [vestingLoading, tokenLoading, contractLoading, loadingLeng]);

  return (
    <PageContainer loading={!data}>
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
                isFullyConnected
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
                isFullyConnected
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
                isFullyConnected
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
        condition={data && !isEmpty(items)}
      >
        <>
          <Flex justifyContent="space-between">
            <Select placeholder="Filter">
              <option value="option2">Completed</option>
              <option value="option3">Runing</option>
            </Select>

            <Flex maxW="330px">
              <GradientButton
                width="150px"
                onClick={() => {}}
                justifyContent="center"
                bg={useColorModeValue("white", darkPurple)}
              >
                Claim All
              </GradientButton>
            </Flex>
          </Flex>
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
                    contract={contract}
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
        </>
      </If>
    </PageContainer>
  );
};
