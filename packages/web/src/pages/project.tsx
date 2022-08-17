import BN from "bn.js";
import {
  useViewInvestorAllowance,
  useViewInvestorAllocation,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import { isBefore } from "date-fns";
import { Box, Flex, Image, Text, Skeleton } from "@chakra-ui/react";
import { useLaunchPadProjectQuery } from "@near/apollo";
import { Fragment, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  DiscordIcon,
  TelegramIcon,
  TwitterIcon,
  WalletIcon,
  WebIcon,
  WhitepaperIcon,
} from "../assets/svg";
import {
  Button,
  Card,
  GradientText,
  If,
  PageContainer,
  NumberInput,
} from "../components";
import { BackButton } from "../components/shared/back-button";
import { ProjectStats } from "@/components";
import { useTheme } from "../hooks/theme";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";
import { formatNumber } from "@near/ts";
import { useTokenBalance, useTokenMetadata } from "@/hooks/modules/token";

/**
 * @description - Launchpad project details page
 * @name Project
 */
export const Project = () => {
  const [tickets, setTickets] = useState(0);
  const { id } = useParams();

  const { buyTickets, withdrawAllocations } = useLaunchpadStore();
  const { accountId, selector } = useWalletSelector();

  const { data: { launchpad_project: launchpadProject } = {}, loading } =
    useLaunchPadProjectQuery({
      variables: {
        accountId: accountId as string,
        projectId: id ?? "",
      },
    });

  const { data: investorAllocation, loading: loadingAllocation } =
    useViewInvestorAllocation(accountId!, id!);

  const { data: totalAllowanceData = "0", loading: loadingTotalAllowance } =
    useViewTotalEstimatedInvestorAllowance(accountId!);

  const { data: priceTokenBalance, loading: loadingPriceTokenBalance } =
    useTokenBalance(launchpadProject?.price_token!, accountId!);

  const { data: metadataPriceToken, loading: isPriceTokenMetadataLoading } =
    useTokenMetadata(launchpadProject?.price_token!);

  const allocationsAvailable = useMemo(() => {
    return new BN(totalAllowanceData).sub(
      new BN(investorAllocation.allocationsBought ?? "0")
    );
  }, [totalAllowanceData, investorAllocation.allocationsBought]);

  const finalPrice = useMemo(() => {
    if (!metadataPriceToken?.decimals && launchpadProject) {
      return "0";
    }

    return formatNumber(
      new BN(launchpadProject?.token_allocation_price ?? "0"),
      metadataPriceToken?.decimals!
    );
  }, [launchpadProject, metadataPriceToken?.decimals]);

  const isLoading = useMemo(
    () =>
      loadingAllocation ||
      isPriceTokenMetadataLoading ||
      loadingTotalAllowance ||
      loading,
    [
      loadingAllocation,
      isPriceTokenMetadataLoading,
      loadingTotalAllowance,
      loading,
    ]
  );

  const retrieveTokens = () => {
    if (typeof launchpadProject?.listing_id && launchpadProject?.price_token) {
      withdrawAllocations(
        launchpadProject.listing_id,
        launchpadProject.price_token,
        accountId!,
        selector
      );
    }
  };

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
    const date = new Date(Number(start_timestamp ?? "0"));

    return date.toLocaleDateString();
  };

  const enabledSales = useMemo(() => {
    const now = new Date();
    const startSale = new Date(
      Number(launchpadProject?.open_sale_1_timestamp!)
    );

    return isBefore(startSale, now);
  }, [launchpadProject]);

  const enabledSale = useMemo(() => {
    const now = new Date();

    const endAt = new Date(Number(launchpadProject?.final_sale_2_timestamp!));

    return isBefore(now, endAt);
  }, [launchpadProject]);

  const ticketsAmount = useMemo(() => {
    return new BN(launchpadProject?.token_allocation_price!).mul(
      new BN(tickets.toString())
    );
  }, [tickets]);

  const hasTicketsAmount = useMemo(() => {
    return new BN(priceTokenBalance ?? "0").gte(ticketsAmount);
  }, [ticketsAmount, priceTokenBalance]);

  const navigate = useNavigate();

  const navigateToExternalURL = (uri: string) => {
    window.open(uri);
  };

  const { jumpGradient } = useTheme();

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
                  src={launchpadProject?.project_token_info?.image || ""}
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
                  {finalPrice} {launchpadProject?.price_token_info?.symbol}
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
                {launchpadProject?.project_name}
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
                {launchpadProject?.description_token}
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
              <Text children={launchpadProject?.description_project} />
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
                  enabledSale || investorAllocation.allocationsBought === "0"
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

        <Card className="col-span-12 lg:col-span-6 xl:col-span-4 relative">
          <If condition={!enabledSales}>
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

        <ProjectStats launchpadProject={launchpadProject} />
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
          <If condition={!!launchpadProject?.discord}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() => navigateToExternalURL(launchpadProject?.discord!)}
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <DiscordIcon />
            </Flex>
          </If>
          <If condition={!!launchpadProject?.twitter}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpadProject?.twitter as string)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <TwitterIcon />
            </Flex>
          </If>
          <If condition={!!launchpadProject?.telegram}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpadProject?.telegram as string)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <TelegramIcon />
            </Flex>
          </If>

          <If condition={!!launchpadProject?.website}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpadProject?.website as string)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <WebIcon />
            </Flex>
          </If>
          <If condition={!!launchpadProject?.whitepaper}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpadProject?.whitepaper as string)
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
