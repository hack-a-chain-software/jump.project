import { Stack, Flex, Skeleton, useColorModeValue } from "@chakra-ui/react";
import {
  If,
  TopCard,
  VestingCard,
  PageContainer,
  ValueBox,
  Select,
  GradientButton,
  Empty,
} from "../components";
import isEmpty from "lodash/isEmpty";
import { useTheme } from "@/hooks/theme";
import { addMilliseconds, isBefore } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { getUTCDate } from "@near/ts";
import { ContractData, Token, useVestingStore } from "@/stores/vesting-store";
import { useWalletSelector } from "@/context/wallet-selector";
import Big from "big.js";

export const Vesting = () => {
  const { glassyWhiteOpaque, darkPurple } = useTheme();

  const { accountId, selector } = useWalletSelector();

  const [filter, setFilter] = useState<string | null>(null);

  const {
    getInvestorInfo,
    getVestings,
    withdraw,
    cleanupData,
    investorInfo,
    vestings,
    loading,
  } = useVestingStore();

  useEffect(() => {
    (async () => {
      if (!accountId) {
        cleanupData();

        return;
      }

      await getVestings(selector, accountId);
      await getInvestorInfo(selector);
    })();
  }, [accountId]);

  const filtered = useMemo(() => {
    if (!filter) {
      return vestings;
    }

    return vestings.filter(({ start_timestamp, vesting_duration }) => {
      const created = getUTCDate(Number(start_timestamp) / 1000000);

      const endAt = addMilliseconds(
        created,
        Number(vesting_duration) / 1000000
      );

      const today = getUTCDate();

      if (filter === "complete") {
        return isBefore(endAt, today);
      }

      if (filter === "runing") {
        return isBefore(today, endAt);
      }

      return false;
    });
  }, [filter, vestings]);

  const isLoading = useMemo(() => {
    if (!accountId) {
      return false;
    }

    return isEmpty(investorInfo);
  }, [investorInfo, accountId]);

  const decimals = useMemo(() => {
    return new Big(10).pow(investorInfo?.token?.decimals || 1);
  }, [investorInfo]);

  const totalLocked = useMemo(() => {
    return new Big(investorInfo?.totalLocked || 1).div(decimals).toFixed(2);
  }, [investorInfo, decimals]);

  const totalUnlocked = useMemo(() => {
    return new Big(investorInfo?.totalUnlocked || 1).div(decimals).toFixed(2);
  }, [investorInfo, decimals]);

  const totalWithdrawn = useMemo(() => {
    return new Big(investorInfo?.totalWithdrawn || 1).div(decimals).toFixed(2);
  }, [investorInfo, decimals]);

  const stepItems = useMemo(() => {
    const items = [
      {
        title: "Jump Vesting",
        element: ".top-card",
        intro: (
          <div>
            <span>
              This is the Jump Vesting page, here you can follow and redeem all
              the rewards received by Jump.
            </span>
          </div>
        ),
      },
      {
        title: "Total Locked",
        element: ".amount-locked",
        intro: (
          <div>
            <span>This is your amount of locked tokens.</span>
          </div>
        ),
      },
      {
        title: "Total Unlocked",
        element: ".amount-unlocked",
        intro: (
          <div className="flex flex-col">
            <span>Here you can find your amount of unlocked tokens.</span>
          </div>
        ),
      },
      {
        title: "Total Withdrawn",
        element: ".amount-withdrawn",
        intro: (
          <div className="flex flex-col">
            <span>
              This is the total amount of tokens you have withdrawn so far.
            </span>
          </div>
        ),
      },
    ];

    if (accountId! && !isEmpty(vestings)) {
      items.push({
        title: "Vesting Card",
        element: ".vesting-card",
        intro: (
          <div className="flex flex-col">
            <span className="mb-2">
              This section shows all the currently active programs you invested
              in.
            </span>

            <span>
              You can claim the available amount of tokens, buy a fast pass or
              wait until the end of the vesting period.
            </span>
          </div>
        ),
      });
    }

    return items;
  }, [accountId, vestings]);

  return (
    <PageContainer>
      <TopCard
        gradientText="Jump Vesting"
        bigText="Lock. Unlock. Withdraw."
        bottomDescription="Manage and Withdraw your locked tokens that you have vesting  period"
        py
        stepItems={stepItems}
        content={
          accountId ? (
            <Flex gap="1.25rem" flex="1" className="flex-col lg:flex-row">
              <Skeleton
                height="114px"
                borderRadius={20}
                className="md:min-w-[240px]"
                endColor="rgba(255,255,255,0.3)"
                isLoaded={!isLoading}
              >
                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  className="amount-locked"
                  title="Total Locked"
                  value={
                    accountId
                      ? `${totalLocked} ${investorInfo?.token?.symbol}`
                      : "Connect Wallet"
                  }
                  bottomText="All amount locked"
                />
              </Skeleton>

              <Skeleton
                height="114px"
                borderRadius={20}
                className="md:min-w-[240px]"
                endColor="rgba(255,255,255,0.3)"
                isLoaded={!isLoading}
              >
                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  title="Total Unlocked"
                  className="amount-unlocked"
                  value={
                    accountId
                      ? `${totalUnlocked} ${investorInfo?.token?.symbol}`
                      : "Connect Wallet"
                  }
                  bottomText="Unlocked amount"
                />
              </Skeleton>

              <Skeleton
                height="114px"
                borderRadius={20}
                className="md:min-w-[240px]"
                endColor="rgba(255,255,255,0.3)"
                isLoaded={!isLoading}
              >
                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  title={accountId ? "Total Withdrawn" : ""}
                  className="amount-withdrawn"
                  value={
                    accountId
                      ? `${totalWithdrawn} ${investorInfo?.token?.symbol}`
                      : "Connect Wallet"
                  }
                  bottomText="Total quantity "
                />
              </Skeleton>
            </Flex>
          ) : (
            <></>
          )
        }
      />

      <If
        fallback={
          accountId
            ? !loading && <Empty text="No vestings available" />
            : loading && (
                <Empty text="You must be logged in to view all vestings" />
              )
        }
        condition={!isEmpty(investorInfo) && !isEmpty(vestings)}
      >
        <>
          <Flex justifyContent="space-between">
            <Select
              value={filter}
              placeholder="Filter"
              items={[
                { label: "Completed", value: "completed" },
                { label: "Runing", value: "runing" },
              ]}
              onChange={(value: string | null) => setFilter(value)}
            />

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
                    accountId as string,
                    selector
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
                  className="vesting-card"
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

export default Vesting;
