import BN from "bn.js";
import { useState } from "react";
import { LockIcon, WalletIcon } from "@/assets/svg";
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
import { LaunchpadListing, useLaunchpadConenctionQuery } from "@near/apollo";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Button, Card, Select, TopCard } from "../components";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Home() {
  const navigate = useNavigate();
  const { accountId, selector } = useWalletSelector();

  const investor = useViewInvestor(accountId!);
  const totalAllocations = useViewTotalEstimatedInvestorAllowance(
    accountId as string
  );
  const { increaseMembership, decreaseMembership } = useLaunchpadStore();

  const launchpadSettings = useViewLaunchpadSettings();

  const { data: { launchpad_projects } = {} } = useLaunchpadConenctionQuery({
    variables: {
      limit: 10,
    },
  });

  const level = useMemo(() => {
    const find = (launchpadSettings.data?.tiers_minimum_tokens || [])
      .map((minTokens, i) => ({
        minTokens,
        level: i++,
      }))
      .filter((e) => {
        return new BN(e.minTokens).lte(
          new BN(investor.data?.staked_token || "0")
        );
      }) as any;

    return find.length || 0;
  }, [
    launchpadSettings.data?.tiers_minimum_tokens,
    investor.data?.staked_token,
  ]);

  const amountToNextLevel = useMemo(() => {
    if (launchpadSettings?.data?.tiers_minimum_tokens[level]) {
      return new BN(launchpadSettings?.data?.tiers_minimum_tokens[level])
        .sub(new BN(investor?.data?.staked_token || "0"))
        .toString();
    }
    return "0";
  }, [
    launchpadSettings.data?.tiers_minimum_tokens,
    investor.data?.staked_token,
  ]);

  const upgradeLevel = () => {
    const formattedLevel = level + 1;
    increaseMembership(formattedLevel, accountId!, selector);
  };

  const downgradeLevel = () => {
    const formattedLevel = level - 1;
    decreaseMembership(formattedLevel, accountId!, selector);
    increaseMembership(formattedLevel, accountId!, selector);
  };

  const isLoaded = useMemo(() => {
    return !!launchpadSettings.data;
  }, [launchpadSettings.data, investor.data]);

  const [filterMine, setMine] = useState("");
  const [filterStatus, setStatus] = useState("");
  const [filterVisibility, setVisibility] = useState("");
  const [filterSearch, setSearch] = useState("");

  // TODO: fazer isso no nível de graphql
  type ListingStatus =
    | "unfunded"
    | "funded"
    | "sale_finalized"
    | "pool_created"
    | "pool_project_token_sent"
    | "pool_price_token_sent"
    | "liquidity_pool_finalized"
    | "cancelled";
  type ProjectStatus = "open" | "closed";
  // TODO: validar isso pelo amor de deus
  const projectStatusMap: Record<ListingStatus, ProjectStatus> = {
    unfunded: "open",
    funded: "open",
    sale_finalized: "open",
    pool_created: "open",
    pool_project_token_sent: "open",
    pool_price_token_sent: "open",
    liquidity_pool_finalized: "closed",
    cancelled: "closed",
  };

  type Filter = {
    filter: string;
    test: (project: LaunchpadListing, filter: string) => boolean;
  };

  const items = useMemo(() => {
    if (!launchpad_projects) {
      return [...Array(2)];
    }

    const filter: Filter[] = [
      {
        filter: filterStatus,
        test: (project, filter) =>
          filter === projectStatusMap[project.status as ProjectStatus],
      },
      {
        filter: filterSearch,
        test: (project, filter) =>
          [
            project.project_token, // Address
            project.project_token_info?.name,
            project.project_name,
          ].some((field) => field?.includes(filter)),
      },
      // {
      //   filter: filterVisibility,
      //   field: ''
      // },
      // {
      //   filter: filterMine,
      //   field: ''
      // }
    ];

    return launchpad_projects?.data?.filter((project) =>
      filter.every(
        ({ filter, test }) => !filter || (project && test(project, filter))
      )
    );
  }, [
    filterMine,
    filterStatus,
    filterSearch,
    filterVisibility,
    launchpad_projects,
  ]);

  return (
    <Flex gap="30px" direction="column" p="30px" w="100%" pt="150px">
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
            isLoaded={!accountId || !!(investor.data && launchpadSettings.data)}
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
                : investor.data
                ? `${
                    launchpadSettings.data?.tiers_entitled_allocations[
                      !level ? 0 : level - 1
                    ] || 0
                  } Tickets Available`
                : `${totalAllocations.data || 0} Tickets Available`}
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
                    <Text fontSize={18} fontWeight="semibold">
                      Level {level}
                    </Text>
                    <Text>
                      Stake more{" "}
                      {Number(amountToNextLevel) / 1000000000000000000} to next
                      Level
                    </Text>
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
                  disabled={!level}
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
                  w="100%"
                  onClick={upgradeLevel}
                  disabled={
                    (launchpadSettings.data?.tiers_minimum_tokens.length ||
                      0) <= level
                  }
                  bg="white"
                  color="black"
                  justifyContent="space-between"
                >
                  Upgrade Level
                  {(launchpadSettings.data?.tiers_minimum_tokens.length || 0) <=
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
            placeholder="Status"
            onChange={(event) => setStatus(event?.target?.value)}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Select>
          <Select
            placeholder="Visibility"
            onChange={(event) => setVisibility(event?.target?.value)}
          >
            <option value="private">Private</option>
            <option value="closed">Closed</option>
          </Select>
          <Select
            placeholder="Mine Only"
            onChange={(event) => setMine(event?.target?.value)}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Flex>

        <Flex className="md:max-w-[330px]" w="100%">
          <Input
            borderWidth="2px"
            h="60px"
            maxW="100%"
            w="100%"
            borderRadius={15}
            placeholder="Search by Pool Name, Token, Address"
            _placeholder={{
              color: useColorModeValue("black", "white"),
            }}
            outline="none"
            px="20px"
            onInput={(event) => setSearch(event?.target?.value)}
          />
        </Flex>
      </Flex>

      <TableContainer borderWidth="2px" px="20px" py="20px" borderRadius={20}>
        <Table size="lg" variant="unstyled">
          <Thead>
            <Tr>
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
            {items?.map((e) => (
              <Tr
                cursor="pointer"
                borderRadius="20px"
                onClick={() => {
                  if (!e) {
                    return;
                  }

                  navigate(`/launchpad/${e?.listing_id}`);
                }}
                key={e?.listing_id}
                className="hover:bg-[rgba(255,255,255,0.5)]"
              >
                <Td borderTopLeftRadius="16px" borderBottomLeftRadius="16px">
                  <Skeleton
                    className="w-[30px] h-[30px] rounded-full"
                    isLoaded={!!e?.project_token_info?.image}
                  >
                    <Image
                      src={e?.project_token_info?.image || ""}
                      className="w-[30px] h-[30px] rounded-full"
                    />
                  </Skeleton>
                </Td>
                <Td>
                  <Skeleton
                    className="w-full h-[22.5px] rounded-full"
                    isLoaded={!!e?.project_token_info?.name}
                  >
                    {e?.project_token_info?.name}
                  </Skeleton>
                </Td>
                <Td>
                  <Skeleton
                    className="w-full h-[22.5px] rounded-full"
                    isLoaded={!!e?.fee_price_tokens}
                  >
                    {e?.fee_price_tokens}
                  </Skeleton>
                </Td>
                <Td>
                  <Skeleton
                    className="w-full h-[22.5px] rounded-full"
                    isLoaded={!!e?.liquidity_pool_price_tokens}
                  >
                    {e?.liquidity_pool_price_tokens}
                  </Skeleton>
                </Td>
                <Td>
                  <Skeleton
                    className="w-full h-[22.5px] rounded-full"
                    isLoaded={!!e?.liquidity_pool_price_tokens}
                  >
                    {e?.liquidity_pool_price_tokens}
                  </Skeleton>
                </Td>
                <Td>
                  <Skeleton
                    className="w-full h-[22.5px] rounded-full"
                    isLoaded={!!e?.liquidity_pool_price_tokens}
                  >
                    {e?.liquidity_pool_price_tokens}
                  </Skeleton>
                </Td>
                <Td>
                  <Skeleton
                    className="w-full h-[22.5px] rounded-full"
                    isLoaded={!!e?.liquidity_pool_price_tokens}
                  >
                    {e?.liquidity_pool_price_tokens}
                  </Skeleton>
                </Td>
                <Td
                  borderTopRightRadius="16px"
                  borderBottomRightRadius="16px"
                  className="first-letter:uppercase"
                >
                  <Skeleton
                    className="w-full h-[22.5px] rounded-full"
                    isLoaded={!!e?.status}
                  >
                    {e?.status}
                  </Skeleton>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}
