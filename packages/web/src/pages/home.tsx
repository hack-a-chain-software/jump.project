import BN from "bn.js";
import isEmpty from "lodash/isEmpty";
import { useState, useEffect, useCallback } from "react";
import { LockIcon, WalletIcon } from "@/assets/svg";
import { addMilliseconds, isBefore } from "date-fns";
import {
  useViewInvestor,
  useViewLaunchpadSettings,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import {
  Box,
  Flex,
  Image,
  Input,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Skeleton,
} from "@chakra-ui/react";
import { X_JUMP_TOKEN } from "@/env/contract";
import { useLaunchpadConenctionQuery } from "@near/apollo";
import { useMemo } from "react";
import { useTheme } from "@/hooks/theme";
import { useNavigate } from "react-router";
import {
  If,
  Button,
  Card,
  Select,
  TopCard,
  LoadingIndicator,
} from "../components";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";
import { BigDecimalFloat, formatNumber } from "@near/ts";
import { useNearQuery } from "react-near";

const PAGINATE_LIMIT = 10;

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Home() {
  const [filterMine, setMine] = useState("");
  const [filterStatus, setStatus] = useState("");
  const [filterVisibility, setVisibility] = useState("");
  const [filterSearch, setSearch] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);

  const navigate = useNavigate();

  const { accountId, selector } = useWalletSelector();

  const { darkPurpleOpaque, glassyWhite, blackAndWhite } = useTheme();

  const tableHover = useColorModeValue(darkPurpleOpaque, glassyWhite);

  const investor = useViewInvestor(accountId!);

  const { data: totalAllowanceData = "0" } =
    useViewTotalEstimatedInvestorAllowance(accountId!);

  const { increaseMembership, decreaseMembership } = useLaunchpadStore();

  const { data: launchpadSettings } = useViewLaunchpadSettings();

  const {
    data: {
      launchpad_projects: { data: launchpadProjects, hasNextPage = false } = {
        data: [],
      },
    } = {},
    fetchMore,
    loading: loadingProjects,
  } = useLaunchpadConenctionQuery({
    variables: {
      limit: PAGINATE_LIMIT,
      accountId: accountId || "",
    },
  });

  const fetchMoreItems = useCallback(async () => {
    setLoadingItems(!loadingItems);

    if (loadingProjects || !hasNextPage) {
      return;
    }

    await fetchMore({
      variables: {
        limit: PAGINATE_LIMIT,
        accountId: accountId || "",
        offset: (launchpadProjects ?? []).length,
      },
    });

    setLoadingItems(!loadingItems);
  }, [
    loadingItems,
    hasNextPage,
    loadingProjects,
    accountId,
    launchpadProjects,
  ]);

  const stakedTokens = useMemo(
    () => new BN(investor.data?.staked_token ?? "0"),
    [investor.data?.staked_token]
  );

  const minimumTokens = useMemo(
    () => launchpadSettings?.tiers_minimum_tokens.map((t) => new BN(t)),
    [launchpadSettings]
  );

  const level = useMemo(() => {
    const metLevels = minimumTokens?.filter((tokenAmount) =>
      tokenAmount.lte(stakedTokens)
    );

    return metLevels?.length ?? 0;
  }, [minimumTokens, stakedTokens]);

  const amountToNextLevel = useMemo(() => {
    return minimumTokens?.[level]
      ? minimumTokens[level]!.sub(stakedTokens)
      : new BN(0);
  }, [minimumTokens, stakedTokens]);

  const upgradeLevel = () => {
    const formattedLevel = level + 1;
    increaseMembership(formattedLevel, accountId!, selector);
  };

  const downgradeLevel = () => {
    const formattedLevel = level - 1;
    decreaseMembership(formattedLevel, accountId!, selector);
    increaseMembership(formattedLevel, accountId!, selector);
  };

  const { data: baseTokenBalance, loading: loadingBaseTokenBalance } =
    useNearQuery<string, { account_id: string }>("ft_balance_of", {
      contract: X_JUMP_TOKEN,
      variables: {
        account_id: accountId!,
      },
      poolInterval: 1000 * 60,
      skip: !accountId,
    });

  const isDisabled = useMemo(() => {
    return new BN(baseTokenBalance ?? "0").lt(amountToNextLevel);
  }, [baseTokenBalance, amountToNextLevel]);

  const isLoaded = useMemo(() => {
    return !!launchpadSettings && !loadingBaseTokenBalance;
  }, [launchpadSettings, loadingBaseTokenBalance, investor.data]);

  const isLocked = useMemo(() => {
    const now = new Date();

    const lastCheck = new Date(Number(investor?.data?.last_check!) / 1000000);

    const endAt = addMilliseconds(
      lastCheck,
      Number(launchpadSettings?.token_lock_period) / 1000000
    );

    return isBefore(now, endAt);
  }, [investor?.data, launchpadSettings]);

  return (
    <Flex
      gap="30px"
      direction="column"
      p="30px"
      w="100%"
      overflow="hidden"
      pt="150px"
    >
      <Flex gap={5} className="flex-col lg:flex-row">
        <TopCard
          gradientText="Launchpad"
          bigText="Stake. Help. Earn."
          bottomDescription="This is the Jump launchad where you can spend the launchpad tickets to invest and support Launchpad Projects"
          jumpLogo
        >
          <Skeleton
            mt="20px"
            width="100%"
            height="42px"
            maxWidth="200px"
            borderRadius="30px"
            endColor="rgba(255,255,255,0.3)"
            isLoaded={!accountId || isLoaded}
          >
            <Box
              bg="white"
              p="10px"
              px="15px"
              maxW="200px"
              alignItems="center"
              justifyContent="center"
              display="flex"
              borderRadius="30px"
              color="black"
              fontWeight="semibold"
            >
              {!accountId
                ? "Connect your wallet"
                : formatNumber(new BN(totalAllowanceData ?? "0"), 0) +
                  " Allocations"}
            </Box>
          </Skeleton>
        </TopCard>

        <Card minWidth="315px" className="lg:flex-grow lg:max-w-[400px]">
          <Flex w="100%" h="100%" flexDirection="column">
            <Text justifyContent="space-between" fontSize={22} fontWeight="900">
              Member Area
            </Text>

            <Stack gap={1}>
              <Skeleton
                mt={5}
                flex={1}
                width="100%"
                borderRadius="18px"
                isLoaded={isLoaded}
                endColor="rgba(255,255,255,0.3)"
              >
                <Flex direction="column" flex={1} mt={5}>
                  <Flex
                    mb="5px"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    flex={1}
                  >
                    {accountId ? (
                      <>
                        <Text fontSize={18} fontWeight="semibold">
                          Level {level}
                        </Text>

                        <Text fontSize={18}>
                          Stake more{" "}
                          {amountToNextLevel
                            .div(new BN("1000000000000000000"))
                            .toString() + " "}
                          to next Level
                        </Text>
                      </>
                    ) : (
                      "Connect Wallet"
                    )}
                  </Flex>
                </Flex>
              </Skeleton>

              <Skeleton
                mt={5}
                flex={1}
                width="100%"
                borderRadius="18px"
                isLoaded={isLoaded}
                endColor="rgba(255,255,255,0.3)"
              >
                <Button
                  w="100%"
                  bg="transparent"
                  border="1px solid white"
                  color="white"
                  onClick={downgradeLevel}
                  justifyContent="space-between"
                  disabled={!level || isLocked || !accountId}
                >
                  Downgrade Level
                  {!!level ? <WalletIcon /> : <LockIcon />}
                </Button>
              </Skeleton>

              <Skeleton
                mt={5}
                flex={1}
                width="100%"
                borderRadius="18px"
                isLoaded={isLoaded}
                endColor="rgba(255,255,255,0.3)"
              >
                <Button
                  onClick={upgradeLevel}
                  disabled={isDisabled || !accountId}
                  w="100%"
                  bg="white"
                  color="black"
                  justifyContent="space-between"
                >
                  Upgrade Level
                  {(launchpadSettings?.tiers_minimum_tokens.length ?? 0) <=
                  level ? (
                    <LockIcon />
                  ) : (
                    <WalletIcon />
                  )}
                </Button>
              </Skeleton>
            </Stack>
          </Flex>
        </Card>
      </Flex>

      <Flex justifyContent="space-between" flexWrap="wrap" gap={5}>
        <Flex gap="4" flexGrow="1" flexWrap="wrap">
          <Select
            value={filterStatus}
            placeholder="Status"
            items={["open", "closed"]}
            onChange={(value: string) => setStatus(value)}
          />
          <Select
            value={filterVisibility}
            placeholder="Visibility"
            items={["private", "closed"]}
            onChange={(value: string) => setVisibility(value)}
          />
          <Select
            value={filterMine}
            placeholder="Mine Only"
            items={["yes", "no"]}
            onChange={(value: string) => setMine(value)}
          />
        </Flex>

        <Flex className="md:max-w-[330px]" w="100%">
          <Input
            borderWidth="2px"
            h="60px"
            maxW="100%"
            w="100%"
            value={filterSearch}
            fontSize={16}
            borderRadius={15}
            placeholder="Search by Pool Name, Token, Address"
            _placeholder={{
              color: blackAndWhite,
            }}
            outline="none"
            px="20px"
            onInput={(event) =>
              setSearch((event.target as HTMLInputElement).value)
            }
          />
        </Flex>
      </Flex>

      <TableContainer px="20px" py="20px" borderWidth="2px" borderRadius={20}>
        <Table size="lg" width="100%" variant="unstyled">
          <Thead>
            <Tr fontSize="18px">
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Price</Th>
              <Th>Access</Th>
              <Th>Max Allocation</Th>
              <Th>Raise Size</Th>
              <Th>Filled</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>

          <Tbody>
            <If
              condition={!isEmpty(launchpadProjects)}
              fallback={
                <Tr>
                  <Td>
                    <Skeleton className="w-[30px] h-[30px] rounded-full" />
                  </Td>
                  <Td>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                  <Td>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                  <Td>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                  <Td>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                  <Td>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                  <Td>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                  <Td>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                </Tr>
              }
            >
              {(launchpadProjects ?? []).map((e, index) => (
                <Tr
                  cursor="pointer"
                  fontSize="18px"
                  borderRadius="20px"
                  onClick={() => {
                    if (!e) {
                      return;
                    }
                    navigate(`/launchpad/${e?.listing_id}`);
                  }}
                  key={`launchpad-project-${e?.listing_id}-${index}`}
                  _hover={{
                    bg: tableHover,
                  }}
                >
                  <Td borderTopLeftRadius="16px" borderBottomLeftRadius="16px">
                    <Image
                      src={e?.project_token_info?.image || ""}
                      className="w-[36px] h-[36px] rounded-full"
                    />
                  </Td>
                  <Td>
                    {/*
                      allocation_price / allocation_size (price token symbol)
                      <Th>Max Allocation</Th> view_investor_allowance
                      <Th>Raise Size</Th> total * price / size in USDT
                      <Th>Filled</Th> sold / total
                      <Th>Status</Th> status mapeado
                  */}
                    {e?.project_token_info?.name}
                  </Td>
                  <Td>
                    {new BigDecimalFloat(
                      new BN(e?.token_allocation_price ?? 0),
                      new BN(e?.price_token_info?.decimals ?? 0).neg()
                    ).formatQuotient(
                      new BigDecimalFloat(
                        new BN(e?.token_allocation_size ?? 0),
                        new BN(e?.project_token_info?.decimals ?? 0).neg()
                      ),
                      new BN(5),
                      {
                        unit: e?.price_token_info?.symbol ?? "",
                        formatOptions: { maximumFractionDigits: 2 },
                      }
                    )}
                  </Td>
                  <Td>{e?.public ? "Public" : "Private"}</Td>
                  <Td>{e?.allocation?.total_quantity ?? 0}</Td>
                  <Td>
                    {new BigDecimalFloat(
                      new BN(e?.token_allocation_price ?? 0).mul(
                        new BN(e?.total_amount_sale_project_tokens ?? 1)
                      ),
                      new BN(e?.project_token_info?.decimals ?? 0)
                        .add(new BN(e?.price_token_info?.decimals ?? 0))
                        .neg()
                    ).formatQuotient(
                      new BigDecimalFloat(
                        new BN(e?.token_allocation_size ?? 0),
                        new BN(e?.project_token_info?.decimals ?? 0).neg()
                      ),
                      new BN(5),
                      {
                        unit: e?.price_token_info?.symbol ?? "",
                        formatOptions: { maximumFractionDigits: 0 },
                      }
                    )}
                  </Td>
                  <Td>
                    {
                      new BigDecimalFloat(
                        new BN(e?.allocations_sold ?? 0).mul(
                          new BN(e?.total_amount_sale_project_tokens ?? 0)
                        ),
                        new BN(e?.project_token_info?.decimals ?? 0)
                          .neg()
                          .add(new BN(2)) // %
                      ).formatQuotient(
                        new BigDecimalFloat(
                          new BN(e?.token_allocation_size ?? 0),
                          new BN(e?.project_token_info?.decimals ?? 0)
                        ),
                        new BN(5),
                        { formatOptions: { maximumFractionDigits: 2 } }
                      ) + "%" // TODO: refactor so unit logic can apply to %?
                    }
                  </Td>
                  <Td
                    borderTopRightRadius="16px"
                    borderBottomRightRadius="16px"
                    className="first-letter:uppercase"
                  >
                    {e?.status}
                  </Td>
                </Tr>
              ))}
            </If>
          </Tbody>
        </Table>
      </TableContainer>

      {hasNextPage && !loadingProjects && (
        <Flex className="flex items-center justify-center">
          <Button className="w-[168px]" onClick={() => fetchMoreItems()}>
            {loadingItems ? <LoadingIndicator /> : "Load more items"}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
