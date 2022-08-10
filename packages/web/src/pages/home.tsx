import BN from "bn.js";
import { LockIcon, WalletIcon } from "@/assets/svg";
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
} from "@chakra-ui/react";
import { useLaunchpadConenctionQuery } from "@near/apollo";
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

  const investor = useViewInvestor(accountId as string);
  const totalAllocations = useViewTotalEstimatedInvestorAllowance(
    accountId as string
  );
  const { increaseMembership, decreaseMembership } = useLaunchpadStore();

  const launchpadSettings = useViewLaunchpadSettings();

  const { refetch, data, loading, error } = useLaunchpadConenctionQuery({
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
    increaseMembership(formattedLevel, accountId as string, selector);
  };

  const downgradeLevel = () => {
    const formattedLevel = level - 1;
    decreaseMembership(formattedLevel, accountId as string, selector);
    increaseMembership(formattedLevel, accountId as string, selector);
  };

  return (
    <Flex gap="30px" direction="column" p="30px" w="100%" pt="150px">
      <Flex gap={5} className="flex-col lg:flex-row">
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
            maxW="200px"
            alignItems="center"
            justifyContent="center"
            display="flex"
            borderRadius="30px"
            mt="20px"
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
        </TopCard>

        <Card minWidth="315px" className="lg:flex-grow lg:max-w-[400px]">
          <Flex w="100%" h="100%" flexDirection="column">
            <Text justifyContent="space-between" fontSize={22} fontWeight="900">
              Member Area
            </Text>
            <Stack gap={1}>
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
                    Stake more {Number(amountToNextLevel) / 1000000000000000000}{" "}
                    to next Level
                  </Text>
                </Flex>
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

      <Flex justifyContent="space-between" flexWrap="wrap" gap={5}>
        <Flex gap="4" flexGrow="1" flexWrap="wrap">
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
