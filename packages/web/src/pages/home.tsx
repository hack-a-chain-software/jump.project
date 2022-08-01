import BN from "bn.js";
import { LockIcon, WalletIcon } from "@/assets/svg";
import { useNearContractsAndWallet } from "@/context/near";
import {
  useViewInvestor,
  useViewLaunchpadSettings,
  useViewTotalEstimatedInvestorAllowance,
  useXTokenBalance,
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
  useDisclosure,
} from "@chakra-ui/react";
import { useLaunchpadConenctionQuery } from "@near/apollo";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button, Card, ProgressBar, Select, TopCard } from "../components";
import { useLaunchpadStore } from "@/stores/launchpad-store";

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Home() {
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const { wallet, isFullyConnected } = useNearContractsAndWallet();

  const investor = useViewInvestor(wallet?.getAccountId());
  const totalAllocations = useViewTotalEstimatedInvestorAllowance(
    wallet?.getAccountId()
  );
  const { increaseMembership, init, decreaseMembership } = useLaunchpadStore();

  const { data: balance = 0 } = useXTokenBalance(wallet?.getAccountId());
  const launchpadSettings = useViewLaunchpadSettings();

  useEffect(() => {
    if (wallet && isFullyConnected) {
      init(wallet);
    }
  }, [wallet, isFullyConnected]);

  const { refetch, data, loading, error } = useLaunchpadConenctionQuery({
    variables: {
      limit: 10,
    },
  });
  console.log("🚀 ~ file: home.tsx ~ line 73 ~ Home ~ data", investor);

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
    increaseMembership(formattedLevel);
  };
  const downgradeLevel = () => {
    const formattedLevel = level - 1;
    decreaseMembership(formattedLevel);
    increaseMembership(formattedLevel);
  };
  // const progress = useMemo(
  //   () =>
  //     new BN(investor.data?.staked_token || 0)
  //       .div(new BN(amountToNextLevel || 0))
  //       .toNumber(),
  //   [investor.data?.staked_token, amountToNextLevel]
  // );

  console.log(
    new BN(investor.data?.staked_token || 0).div(new BN(1000)).toString()
  );

  // console.log(
  //   new BN(investor.data?.staked_token || 0)
  //     .div(new BN(amountToNextLevel))
  //     .toNumber()
  // );

  return (
    <Flex gap="30px" direction="column" p="30px" w="100%" pt="150px">
      <Flex gap={5}>
        <TopCard
          gradientText="Launchpad"
          bigText="Stake. Help. Earn."
          bottomDescription="This is the Jump launchad where you can spend the launchpad tickets to invest and support Launchpad Projects"
          jumpLogo
        >
          <Box
            bg="white"
            p="10px"
            px="15px"
            minW="170px"
            maxW="200px"
            alignItems="center"
            justifyContent="center"
            display="flex"
            borderRadius="30px"
            mt="20px"
            color="black"
            fontWeight="semibold"
          >
            {!wallet
              ? "Connect your wallet"
              : investor.data
              ? `${
                  launchpadSettings.data?.tiers_entitled_allocations[
                    !level ? 0 : level - 1
                  ] || 0
                } Tickets Available`
              : `${totalAllocations.data || 0} Tickets Available`}
          </Box>
        </TopCard>
        <Card flex={1}>
          <Flex w="100%" h="100%" flexDirection="column">
            <Text justifyContent="space-between" fontSize={22} fontWeight="900">
              Member Area
            </Text>
            <Stack gap={1}>
              <Flex direction="column" flex={1} mt={5}>
                <Flex mb="-10px" justifyContent="space-between" flex={1}>
                  <Text fontSize={18} fontWeight="semibold">
                    Level {level}
                  </Text>
                  <Text>Stake more {amountToNextLevel} to next Level</Text>
                </Flex>
                <ProgressBar done={100} />
              </Flex>
              <Button
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
              <Button
                onClick={upgradeLevel}
                disabled={
                  (launchpadSettings.data?.tiers_minimum_tokens.length || 0) <=
                  level
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
            </Stack>
          </Flex>
        </Card>
      </Flex>

      <Flex justifyContent="space-between">
        <Flex gap="4">
          <Select placeholder="Status">
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </Select>
          <Select placeholder="Visibility">
            <option value="PRIVATE">Private</option>
            <option value="CLOSED">Closed</option>
          </Select>
          <Select placeholder="Mine Only">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Flex>
        <Flex maxW="330px" w="100%">
          <Input
            borderWidth="2px"
            h="60px"
            maxW="330px"
            w="100%"
            borderRadius={15}
            placeholder="Search by Pool Name, Token, Address"
            _placeholder={{
              color: useColorModeValue("black", "white"),
            }}
            outline="none"
            px="20px"
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
            {data?.launchpad_projects.data?.map((e) => (
              <Tr
                cursor="pointer"
                onClick={() => navigate(`/launchpad/${e?.listing_id}`)}
                key={e?.listing_id}
              >
                <Td>
                  <Image
                    borderRadius={100}
                    w={30}
                    h={30}
                    src={e?.project_token_info?.image || ""}
                  />
                </Td>
                <Td>{e?.project_token_info?.name}</Td>
                <Td>{e?.fee_price_tokens}</Td>
                <Td>{e?.liquidity_pool_price_tokens}</Td>
                <Td>{e?.liquidity_pool_price_tokens}</Td>
                <Td>{e?.liquidity_pool_price_tokens}</Td>
                <Td>{e?.liquidity_pool_price_tokens}</Td>
                <Td>{e?.liquidity_pool_price_tokens}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}
