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
    console.log({ aaa: launchpad_project?.price_token });
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
            value: launchpad_project?.total_amount_sale_project_tokens,
          },
          {
            label: "Allocation size",
            value: launchpad_project?.token_allocation_size,
          },
          {
            label: "How many allocations you can still buy",
            value: "100,00",
          },
          {
            label: "How many allocations you already bought",
            value: "100,00",
          },
          {
            label: "Total allocations bought / total allocations",
            value: "100,00",
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
            value: "99%", // TODO
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
      <Flex
        gap={5}
        justifyContent="space-between"
        className="flex-col lg:flex-row"
        overflow="hidden"
      >
        <Flex direction="column" flex={1.4}>
          <Card>
            <Flex direction="column">
              <Flex alignItems="center">
                <div>
                  <Flex alignItems="center" gap={3}>
                    <Image
                      w="50px"
                      h="50px"
                      mb="5px"
                      src={launchpad_project?.project_token_info?.image || ""}
                    />
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
                  </Flex>

                  <Text
                    fontWeight="800"
                    fontFamily="Inter"
                    letterSpacing="-0.05em"
                    fontSize="40px"
                    as="h1"
                  >
                    {launchpad_project?.project_name}
                  </Text>
                  <Text
                    fontWeight="500"
                    fontFamily="Inter"
                    letterSpacing="-0.05em"
                    fontSize="20px"
                    as="h1"
                  >
                    {launchpad_project?.description_token}
                  </Text>
                </div>
              </Flex>
            </Flex>
          </Card>

          <Card mt="15px">
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
          </Card>
        </Flex>

        <Card flex={0.9} w="100%">
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
              {launchpad_project?.project_name}
            </Text>

            <Flex my="30px" gap="5px" direction="column" maxWidth="380px">
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
                maxWidth="380px"
              >
                Join Project
                <WalletIcon />
              </Button>
            </If>
          </Flex>
        </Card>
      </Flex>

      <ProjectStats
        description={launchpad_project?.description_project || ""}
        stats={stats}
      />

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
