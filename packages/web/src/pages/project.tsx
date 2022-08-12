import BN from "bn.js";
import {
  useViewInvestorAllocation,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import { Box, Flex, Image, Input, Text, Skeleton } from "@chakra-ui/react";
import { useLaunchPadProjectQuery } from "@near/apollo";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  DiscordIcon,
  TelegramIcon,
  TwitterIcon,
  WalletIcon,
  WebIcon,
  WhitepaperIcon,
} from "../assets/svg";
import { Button, Card, GradientText, If, PageContainer } from "../components";
import { BackButton } from "../components/shared/back-button";
import { ProjectStats } from "@/components";
import { useTheme } from "../hooks/theme";
import { useNearQuery } from "react-near";
import { useTokenBalance } from "@/hooks/modules/token";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";
import { formatNumber } from "@near/ts";

/**
 * @description - Launchpad project details page
 * @name Project
 */
export const Project = () => {
  const [tickets, setTickets] = useState(0);
  const { id } = useParams();

  const { accountId, selector } = useWalletSelector();

  const { data: { launchpad_project } = {}, loading } =
    useLaunchPadProjectQuery({
      variables: {
        accountId: accountId as string,
        projectId: id || "",
      },
    });

  const { data: investorAllocation, loading: loadingAllocation } =
    useViewInvestorAllocation(accountId!, id!);

  const navigate = useNavigate();

  const { jumpGradient } = useTheme();

  const { data: totalAllowanceData = "0", loading: loadingTotalAllowance } =
    useViewTotalEstimatedInvestorAllowance(accountId!);

  const navigateToExternalURL = (uri: string) => {
    window.open(uri);
  };

  const { buyTickets, withdrawAllocations } = useLaunchpadStore();

  const { data: priceTokenBalance, loading: loadingPriceTokenBalance } =
    useTokenBalance(launchpad_project?.price_token!, accountId!);

  const { data: metadataPriceToken, loading: isPriceTokenMetadataLoading } =
    useNearQuery<
      {
        decimals: number;
      },
      { account_id: string }
    >("ft_metadata", {
      contract: launchpad_project?.price_token!,
      poolInterval: 1000 * 60,
      skip: !launchpad_project?.price_token,
      debug: true,
    });

  const { data: metadataProjectToken, loading: isProjectTokenLoading } =
    useNearQuery<
      {
        decimals: number;
      },
      { account_id: string }
    >("ft_metadata", {
      contract: launchpad_project?.project_token as string,
      poolInterval: 1000 * 60,
      skip: !launchpad_project?.project_token,
      debug: true,
    });

  const finalPrice = useMemo(() => {
    if (!metadataPriceToken?.decimals && launchpad_project) {
      return 0;
    }

    return Number(
      Number(launchpad_project?.token_allocation_price || 0) *
        10 ** -(metadataPriceToken?.decimals || 0)
    );
  }, [launchpad_project, metadataPriceToken?.decimals]);

  const isLoading = useMemo(
    () =>
      loadingAllocation ||
      isPriceTokenMetadataLoading ||
      isProjectTokenLoading ||
      loadingTotalAllowance ||
      loading ||
      loadingPriceTokenBalance,
    [
      loadingAllocation,
      isPriceTokenMetadataLoading,
      isProjectTokenLoading,
      loadingTotalAllowance,
      loading,
      loadingPriceTokenBalance,
    ]
  );

  const retrieveTokens = () => {
    if (
      typeof launchpad_project?.listing_id &&
      launchpad_project?.price_token
    ) {
      withdrawAllocations(
        launchpad_project.price_token,
        launchpad_project.listing_id,
        accountId as string,
        selector
      );
    }
  };

  const onJoinProject = useCallback(
    (amount: number) => {
      if (
        typeof launchpad_project?.listing_id &&
        launchpad_project?.price_token
      ) {
        buyTickets(
          new BN(amount)
            .mul(new BN(launchpad_project.token_allocation_price || 0))
            .toString(),
          launchpad_project.price_token,
          launchpad_project.listing_id,
          accountId as string,
          selector
        );
      }
    },
    [
      launchpad_project?.project_token,
      launchpad_project?.token_allocation_price,
      1,
    ]
  );

  const formatDate = (start_timestamp?: string) => {
    const date = new Date(Number(start_timestamp ?? "0"));

    return date.toLocaleDateString();
  };

  const totalRaise = useMemo(() => {
    const {
      total_amount_sale_project_tokens = "",
      token_allocation_price = "",
      token_allocation_size = "",
    } = launchpad_project || {};

    const totalAmount = new BN(total_amount_sale_project_tokens!);
    const allocationPrice = new BN(token_allocation_price!);
    const allocationSize = new BN(token_allocation_size || "1");

    return totalAmount.mul(allocationPrice).div(allocationSize);
  }, [launchpad_project]);

  const stats = useMemo(() => {
    return {
      price: {
        name: "Price",
        items: [
          {
            label: "Total raise (in price token)",
            value: formatNumber(totalRaise, metadataPriceToken?.decimals ?? 0),
          },
          {
            label: "Project tokens for sale",
            value: launchpad_project?.total_amount_sale_project_tokens!,
          },
          {
            label: "Allocation size",
            value: launchpad_project?.token_allocation_size!,
          },
          {
            label: "How many allocations you can still buy",
            value: "100,00", // view_investor_allowance(listing_id)
          },
          {
            label: "How many allocations you already bought",
            value: "100,00", // view_investor_allocation(listing_id)
          },
          {
            label: "Total allocations bought / total allocations",
            value: "100,00", // listing.allocations_sold / total_...
          },
        ],
      },
      vesting: {
        name: "Vesting",
        items: [
          {
            label: "Start sale date",
            value: formatDate(launchpad_project?.open_sale_1_timestamp!),
          },
          {
            label: "Start sale phase 2 date",
            value: formatDate(launchpad_project?.open_sale_2_timestamp!),
          },
          {
            label: "End sale date",
            value: formatDate(launchpad_project?.final_sale_2_timestamp!),
          },
          {
            label: "DEX Launch date",
            value: formatDate(launchpad_project?.liquidity_pool_timestamp!), // TODO
          },
          {
            label: "Vesting initial release %",
            value: launchpad_project?.fraction_instant_release + "%",
          },
          {
            label: "Vesting cliff release %",
            value: launchpad_project?.fraction_cliff_release + "%",
          },
          {
            label: "Vesting final release %",
            value: "99%", // 100 - instant - cliff
          },
          {
            label: "Vesting cliff launchpad_project date",
            value: formatDate(launchpad_project?.cliff_timestamp!),
          },
          {
            label: "Vesting cliff end date",
            value: formatDate(launchpad_project?.end_cliff_timestamp!),
          },
        ],
      },
    };
  }, [launchpad_project]);

  return (
    <PageContainer>
      <BackButton onClick={() => navigate("/")} />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-6">
          <Flex className="flex-col space-y-[8px] w-full">
            <Flex alignItems="center" mb="5px" gap={3}>
              <Skeleton
                className="w-[50px] h-[50px] rounded-full"
                isLoaded={!isLoading}
              >
                <Image
                  className="w-[50px] h-[50px]"
                  src={launchpad_project?.project_token_info?.image || ""}
                />
              </Skeleton>

              <Skeleton
                className="min-w-[200px] rounded-[16px]"
                isLoaded={!isLoading}
              >
                <Text
                  fontWeight="800"
                  fontFamily="Inter"
                  letterSpacing="-0.06em"
                  fontSize="30px"
                  as="h1"
                  color="white"
                >
                  {finalPrice} {launchpad_project?.price_token_info?.symbol}
                </Text>
              </Skeleton>
            </Flex>
            <Skeleton
              className="w-full rounded-[16px] min-h-[60px]"
              isLoaded={!isLoading}
            >
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="40px"
                as="h1"
              >
                {launchpad_project?.project_name}
              </Text>
            </Skeleton>

            <Skeleton
              className="w-full rounded-[16px] min-h-[30px]"
              isLoaded={!isLoading}
            >
              <Text
                fontWeight="500"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="20px"
                as="h1"
              >
                {launchpad_project?.description_token}
              </Text>
            </Skeleton>
          </Flex>
        </Card>

        <Card className="w-full col-span-12 lg:col-span-6 xl:col-span-3">
          <Flex className="flex-col space-y-[12px] h-full w-full">
            <Text
              fontWeight="800"
              fontFamily="Inter"
              letterSpacing="-0.05em"
              fontSize="40px"
              as="h1"
            >
              About
            </Text>

            <Skeleton
              className="w-full min-h-[48px] rounded-[16px]"
              isLoaded={!isLoading}
            >
              <Text children={launchpad_project?.description_project} />
            </Skeleton>
          </Flex>
        </Card>

        <Card className="col-span-12 lg:col-span-6 xl:col-span-3">
          <Flex className="flex-col space-y-[12px] h-full w-full">
            <GradientText
              fontWeight="800"
              letterSpacing="-0,03em"
              fontSize={24}
            >
              User Area
            </GradientText>

            <Skeleton isLoaded={!isLoading} w="100%" borderRadius="15px">
              <Button
                disabled={
                  !new BN(investorAllocation.totalTokensBought).gt(new BN(0))
                }
                onClick={() => retrieveTokens()}
                justifyContent="space-between"
                w="100%"
              >
                Retrieve Tokens
                <WalletIcon />
              </Button>
            </Skeleton>
          </Flex>
        </Card>

        <Card className="col-span-12 lg:col-span-6 xl:col-span-4">
          <Flex direction="column" flex={1} gap={1} className="h-full">
            <Skeleton isLoaded={!isLoading} className="rounded-[16px]">
              <GradientText
                fontWeight="800"
                letterSpacing="-0,03em"
                fontSize={24}
              >
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
                {launchpad_project?.project_name}
              </Text>
            </Skeleton>

            <Skeleton
              isLoaded={!isLoading}
              className="h-[92.5px] rounded-[16px] my-[30px]"
            >
              <Flex gap="5px" direction="column" maxWidth="380px">
                <Text>
                  Balance - {priceTokenBalance || "0"}{" "}
                  {launchpad_project?.price_token_info?.symbol}
                </Text>
                <Input
                  value={tickets}
                  type="number"
                  onChange={(e) => setTickets(Number(e.target.value))}
                  bg="white"
                  color="black"
                  placeholder="Tickets"
                  variant="filled"
                  _hover={{ bg: "white" }}
                  _focus={{ bg: "white" }}
                />
                <Text>
                  You have{" "}
                  {Number(totalAllowanceData) -
                    Number(investorAllocation.allocationsBought)}{" "}
                  tickets available to deposit
                </Text>
              </Flex>
            </Skeleton>

            <If
              condition={!!accountId}
              fallback={
                <Flex justifyContent="space-between" w="100%">
                  Connect Wallet
                  <WalletIcon />
                </Flex>
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
                >
                  Join Project
                  <WalletIcon />
                </Button>
              </Skeleton>
            </If>
          </Flex>
        </Card>

        <ProjectStats isLoading={isLoading} stats={stats} />
      </div>

      <Box
        bg={jumpGradient}
        p="30px"
        display="flex"
        flexWrap="wrap"
        gap={5}
        alignItems="center"
        justifyContent="space-between"
        borderRadius={20}
      >
        <Flex direction="column">
          <Text
            letterSpacing="-0.03em"
            mb="-5px"
            color="white"
            fontWeight="800"
          >
            Project
          </Text>
          <Text
            color="white"
            fontWeight="800"
            letterSpacing="-0.03em"
            fontSize="20px"
          >
            Social Networks
          </Text>
        </Flex>
        <Flex color="white" gap={1}>
          <If condition={!!launchpad_project?.discord}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() => navigateToExternalURL(launchpad_project?.discord!)}
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <DiscordIcon />
            </Flex>
          </If>
          <If condition={!!launchpad_project?.twitter}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpad_project?.twitter as string)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <TwitterIcon />
            </Flex>
          </If>
          <If condition={!!launchpad_project?.telegram}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpad_project?.telegram as string)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <TelegramIcon />
            </Flex>
          </If>

          <If condition={!!launchpad_project?.website}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpad_project?.website as string)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <WebIcon />
            </Flex>
          </If>
          <If condition={!!launchpad_project?.whitepaper}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpad_project?.whitepaper as string)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <WhitepaperIcon />
            </Flex>
          </If>
        </Flex>
      </Box>
    </PageContainer>
  );
};
