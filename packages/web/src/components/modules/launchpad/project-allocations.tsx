import BN from "bn.js";
import { isBefore, format } from "date-fns";
import { formatNumber, getUTCDate } from "@near/ts";
import { WalletIcon } from "@/assets/svg";
import { Fragment, useMemo, useState, useCallback } from "react";
import { Flex, Text, Skeleton } from "@chakra-ui/react";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";
import { launchpadProject, investorAllocation } from "@/interfaces";
import { Card, If, GradientText, NumberInput, Button } from "@/components";

export function ProjectAllocations({
  isLoading,
  launchpadProject,
  priceTokenBalance,
  totalAllowanceData,
  investorAllocation,
  investorAllowance,
}: {
  isLoading: boolean;
  investorAllowance: string;
  priceTokenBalance: string;
  totalAllowanceData: string;
  launchpadProject: launchpadProject;
  investorAllocation: investorAllocation;
}) {
  const { accountId, selector } = useWalletSelector();
  const { buyTickets } = useLaunchpadStore();

  const [tickets, setTickets] = useState(0);

  const allocationsAvailable = useMemo(() => {
    return new BN(investorAllowance ?? "0");
  }, [investorAllowance]);

  const onJoinProject = useCallback(
    (amount: number) => {
      if (
        typeof launchpadProject?.listing_id &&
        launchpadProject?.price_token
      ) {
        buyTickets(
          new BN(amount)
            .mul(new BN(launchpadProject.token_allocation_price || 0))
            .toString(),
          launchpadProject.price_token,
          launchpadProject.listing_id,
          accountId!,
          selector
        );
      }
    },
    [
      1,
      accountId,
      launchpadProject?.project_token,
      launchpadProject?.token_allocation_price,
    ]
  );

  const formatDate = (start_timestamp?: string) => {
    const date = getUTCDate(Number(start_timestamp ?? "0"));
    return format(date, "mm/dd/yyyy");
  };

  const enabledSales = useMemo(() => {
    const now = new Date();
    const startSale = new Date(
      Number(launchpadProject?.open_sale_1_timestamp!)
    );

    return isBefore(startSale, now);
  }, [launchpadProject]);

  const ticketsAmount = useMemo(() => {
    return new BN(launchpadProject?.token_allocation_price!).mul(
      new BN(tickets.toString())
    );
  }, [tickets]);

  const hasTicketsAmount = useMemo(() => {
    return new BN(priceTokenBalance ?? "0").gte(ticketsAmount);
  }, [ticketsAmount, priceTokenBalance]);

  // const isEndSale = useMemo(() => {

  // }, []);

  return (
    <Card className="col-span-12 lg:col-span-6 xl:col-span-4 relative">
      <If condition={!enabledSales && !isLoading}>
        <Flex className="absolute inset-0 rounded-[24px] z-[2] bg-opacity-[.2] backdrop-blur-[10px] bg-black flex items-center justify-center flex-col">
          <Text
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="24px"
            as="h1"
          >
            Await start sales
          </Text>

          <Text
            color="white"
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="24px"
            mb="-20px"
            as="h1"
            children={formatDate(launchpadProject?.open_sale_1_timestamp!)}
          />
        </Flex>
      </If>

      <Flex direction="column" flex={1} gap={1} className="h-full">
        <Skeleton isLoaded={!isLoading} className="rounded-[16px]">
          <GradientText fontWeight="800" letterSpacing="-0,03em" fontSize={24}>
            Join Project
          </GradientText>
        </Skeleton>

        <Skeleton
          isLoaded={!isLoading}
          className="w-full min-h-[55px] rounded-[16px]"
        >
          <Text
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="50px"
            marginTop="-8px"
            lineHeight="50px"
            as="h1"
          >
            {launchpadProject?.project_name}
          </Text>
        </Skeleton>

        <Skeleton
          isLoaded={!isLoading}
          className="h-[92.5px] rounded-[16px] my-[30px]"
        >
          <Flex gap="5px" direction="column" maxWidth="380px">
            <Flex flexWrap="wrap" justifyContent="space-between">
              <Text>
                Your Balance:{" "}
                {formatNumber(
                  new BN(priceTokenBalance ?? "0"),
                  launchpadProject?.price_token_info?.decimals!
                )}{" "}
                {launchpadProject?.price_token_info?.symbol}
              </Text>
            </Flex>

            <NumberInput
              min={0}
              value={tickets}
              max={allocationsAvailable.toNumber()}
              onChange={(value) => setTickets(value || 0)}
            />

            <Text>
              You can buy: {formatNumber(allocationsAvailable, 0) + " "}
              allocations
            </Text>
          </Flex>
        </Skeleton>

        <If
          condition={!!accountId}
          fallback={
            <Button
              disabled={true}
              onClick={() => onJoinProject(tickets)}
              justifyContent="space-between"
              w="100%"
              maxWidth="380px"
            >
              Connect Wallet
            </Button>
          }
        >
          <Skeleton
            isLoaded={!isLoading}
            className="w-full min-h-[60px] rounded-[16px]"
          >
            <Button
              onClick={() => onJoinProject(tickets)}
              justifyContent="space-between"
              w="100%"
              maxWidth="380px"
              bg={hasTicketsAmount ? "white" : "#EB5757"}
              isDisabled={!hasTicketsAmount || tickets === 0}
            >
              Join{" "}
              {tickets > 0 ? (
                <Fragment>
                  For:{" "}
                  {formatNumber(
                    ticketsAmount,
                    new BN(launchpadProject?.price_token_info?.decimals!)
                  )}{" "}
                  {launchpadProject?.price_token_info?.symbol}
                </Fragment>
              ) : (
                "Project"
              )}
              <WalletIcon />
            </Button>
          </Skeleton>
        </If>
      </Flex>
    </Card>
  );
}
