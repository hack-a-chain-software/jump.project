import BN from "bn.js";
import {
  useViewInvestorAllocation,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import { Box, Flex, Image, Input, Text } from "@chakra-ui/react";
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
import { ProgressBar } from "../components/shared/progress-bar";
import { useTheme } from "../hooks/theme";
import { useNearQuery } from "react-near";
import { useTokenBalance } from "@/hooks/modules/token";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";

/**
 * @description - Launchpad project details page
 * @name Project
 */
export const Project = () => {
  const [tickets, setTickets] = useState(0);
  const { id } = useParams();

  const { accountId, selector } = useWalletSelector();

  const { data, loading } = useLaunchPadProjectQuery({
    variables: {
      accountId: accountId as string,
      projectId: id || "",
    },
  });

  const { data: investorAllocation, loading: loadingAllocation } =
    useViewInvestorAllocation(accountId as string, id as string);

  console.log(investorAllocation.totalTokensBought);

  const navigate = useNavigate();

  const { jumpGradient } = useTheme();

  const { data: totalAllowanceData = "0", loading: loadingTotalAllowance } =
    useViewTotalEstimatedInvestorAllowance(accountId as string);

  const navigateToExternalURL = (uri: string) => {
    window.open(uri);
  };

  const { buyTickets, withdrawAllocations } = useLaunchpadStore();

  const { data: priceTokenBalance, loading: loadingPriceTokenBalance } =
    useTokenBalance(
      data?.launchpad_project?.price_token as string,
      accountId as string
    );

  const { data: metadataUSDT, loading: isUSDTMetadataLoading } = useNearQuery<
    {
      decimals: number;
    },
    { account_id: string }
  >("ft_metadata", {
    contract: data?.launchpad_project?.price_token as string,
    poolInterval: 1000 * 60,
    skip: !data?.launchpad_project?.price_token,
    debug: true,
  });

  const { data: metadataProjectToken, loading: isProjectTokenLoading } =
    useNearQuery<
      {
        decimals: number;
      },
      { account_id: string }
    >("ft_metadata", {
      contract: data?.launchpad_project?.project_token as string,
      poolInterval: 1000 * 60,
      skip: !data?.launchpad_project?.project_token,
      debug: true,
    });

  const finalPrice = useMemo(() => {
    if (!metadataUSDT?.decimals && data?.launchpad_project) {
      return 0;
    }

    return Number(
      Number(data?.launchpad_project?.token_allocation_price || 0) *
        10 ** -(metadataUSDT?.decimals || 0)
    );
  }, [data?.launchpad_project, metadataUSDT?.decimals]);

  const isLoading = useMemo(
    () =>
      loadingAllocation ||
      isUSDTMetadataLoading ||
      isProjectTokenLoading ||
      loadingTotalAllowance ||
      loading ||
      loadingPriceTokenBalance,
    [
      loadingAllocation,
      isUSDTMetadataLoading,
      isProjectTokenLoading,
      loadingTotalAllowance,
      loading,
      loadingPriceTokenBalance,
    ]
  );

  const retrieveTokens = () => {
    if (
      typeof data?.launchpad_project?.listing_id &&
      data?.launchpad_project?.price_token
    ) {
      withdrawAllocations(
        data.launchpad_project.price_token,
        data.launchpad_project.listing_id,
        accountId as string,
        selector
      );
    }
  };

  const onJoinProject = useCallback(
    (amount: number) => {
      if (
        typeof data?.launchpad_project?.listing_id &&
        data?.launchpad_project?.price_token
      ) {
        buyTickets(
          new BN(amount)
            .mul(new BN(data.launchpad_project.token_allocation_price || 0))
            .toString(),
          data.launchpad_project.price_token,
          data.launchpad_project.listing_id,
          accountId as string,
          selector
        );
      }
    },
    [
      data?.launchpad_project?.project_token,
      data?.launchpad_project?.token_allocation_price,
      1,
    ]
  );

  return (
    <PageContainer pageLoading={isLoading}>
      <BackButton onClick={() => navigate("/")} />
      <Flex gap={5} justifyContent="space-between">
        <Card flex={0.5}>
          <Flex direction="column">
            <Flex alignItems="center">
              <div>
                <Flex alignItems="center" gap={3}>
                  <Image
                    w="50px"
                    h="50px"
                    mb="5px"
                    src={
                      data?.launchpad_project?.project_token_info?.image || ""
                    }
                  />
                  <Text
                    fontWeight="800"
                    fontFamily="Inter"
                    letterSpacing="-0.06em"
                    fontSize="30px"
                    as="h1"
                    color="white"
                  >
                    {finalPrice}{" "}
                    {data?.launchpad_project?.price_token_info?.symbol}
                  </Text>
                </Flex>

                <Text
                  fontWeight="800"
                  fontFamily="Inter"
                  letterSpacing="-0.05em"
                  fontSize="40px"
                  as="h1"
                >
                  {data?.launchpad_project?.project_name}
                </Text>
                <Text
                  fontWeight="500"
                  fontFamily="Inter"
                  letterSpacing="-0.05em"
                  fontSize="20px"
                  as="h1"
                >
                  {data?.launchpad_project?.description_token}
                </Text>
              </div>
            </Flex>
            <Text
              fontWeight="bold"
              letterSpacing="-0.03em"
              fontSize="16px"
              w="500px"
            ></Text>
          </Flex>
        </Card>
        <Card flex={1}>
          <Flex direction="column">
            <Text
              color="white"
              fontWeight="800"
              fontFamily="Inter"
              letterSpacing="-0.05em"
              fontSize="24px"
              mb="-20px"
              as="h1"
            >
              Project
            </Text>
            <Text
              fontWeight="800"
              fontFamily="Inter"
              letterSpacing="-0.05em"
              fontSize="50px"
              as="h1"
            >
              Stats
            </Text>
            <Flex justifyContent="space-between" gap="30px">
              <Flex direction="column">
                <Text letterSpacing="-0,03em" fontWeight="bold" fontSize={24}>
                  <GradientText lineHeight={1}>
                    {Number(
                      data?.launchpad_project
                        ?.total_amount_sale_project_tokens || 0
                    ) *
                      10 ** -(metadataProjectToken?.decimals || 0)}
                    <Text as="strong" fontSize={12}>
                      {data?.launchpad_project?.project_token_info?.symbol}
                    </Text>
                  </GradientText>
                </Text>
                <Text fontSize={16}>Total Raise</Text>
              </Flex>
              <Flex direction="column">
                <Text letterSpacing="-0,03em" fontWeight="bold" fontSize={24}>
                  <GradientText lineHeight={1}>
                    {finalPrice}{" "}
                    {data?.launchpad_project?.price_token_info?.symbol}
                  </GradientText>
                </Text>
                <Text fontSize={16}>Allocation per ticket</Text>
              </Flex>
              <Flex direction="column">
                <Text letterSpacing="-0,03em" fontWeight="bold" fontSize={24}>
                  <GradientText lineHeight={1}>
                    {data?.launchpad_project?.allocations_sold}
                    <Text as="strong" fontSize={12}>
                      Tickets
                    </Text>
                  </GradientText>
                </Text>
                <Text fontSize={16}>Total Allocations Sold</Text>
              </Flex>
            </Flex>
            <Flex flex={1} pt="10px">
              <ProgressBar done={80} />
            </Flex>
          </Flex>
        </Card>
      </Flex>
      <Flex justifyContent="space-between">
        <Flex flex={0.5} p="20px" direction="column">
          <Text
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="40px"
            as="h1"
          >
            Description
          </Text>
          <Text>{data?.launchpad_project?.description_project}</Text>
        </Flex>
        <Flex direction="column" flex={0.9}>
          <Card flex={0.9}>
            <Flex direction="column" flex={1}>
              <GradientText
                fontWeight="800"
                letterSpacing="-0,03em"
                fontSize={24}
              >
                Join Project
              </GradientText>
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="50px"
                marginTop="-20px"
                as="h1"
              >
                {data?.launchpad_project?.project_name}
              </Text>

              <Flex my="30px" gap="5px" direction="column">
                <Text>
                  Balance - {priceTokenBalance || "0"}{" "}
                  {data?.launchpad_project?.price_token_info?.symbol}
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

              <If
                condition={!!accountId}
                fallback={
                  <Flex justifyContent="space-between" w="100%">
                    Connect Wallet
                    <WalletIcon />
                  </Flex>
                }
              >
                <Button
                  onClick={() => onJoinProject(tickets)}
                  justifyContent="space-between"
                  w="100%"
                >
                  Join Project
                  <WalletIcon />
                </Button>
              </If>
            </Flex>
          </Card>
          <If
            condition={new BN(investorAllocation.totalTokensBought).gt(
              new BN(0)
            )}
          >
            <Card mt="15px">
              <Button
                onClick={() => retrieveTokens()}
                justifyContent="space-between"
                w="100%"
              >
                Retrieve Tokens
                <WalletIcon />
              </Button>
            </Card>
          </If>
        </Flex>
      </Flex>
      <Box
        bg={jumpGradient}
        p="30px"
        display="flex"
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
          <If condition={!!data?.launchpad_project?.discord}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(
                  data?.launchpad_project?.discord as string
                )
              }
            >
              <DiscordIcon />
            </Flex>
          </If>
          <If condition={!!data?.launchpad_project?.twitter}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(
                  data?.launchpad_project?.twitter as string
                )
              }
            >
              <TwitterIcon />
            </Flex>
          </If>
          <If condition={!!data?.launchpad_project?.telegram}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(
                  data?.launchpad_project?.telegram as string
                )
              }
            >
              <TelegramIcon />
            </Flex>
          </If>

          <If condition={!!data?.launchpad_project?.website}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(
                  data?.launchpad_project?.website as string
                )
              }
            >
              <WebIcon />
            </Flex>
          </If>
          <If condition={!!data?.launchpad_project?.whitepaper}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(
                  data?.launchpad_project?.whitepaper as string
                )
              }
            >
              <WhitepaperIcon />
            </Flex>
          </If>
        </Flex>
      </Box>
    </PageContainer>
  );
};
