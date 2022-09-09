import BN from "bn.js";
import isEmpty from "lodash/isEmpty";
import { useRef, useState, useCallback, useEffect } from "react";
import { debounce } from "lodash-es";
import {
  useViewInvestor,
  useViewLaunchpadSettings,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import {
  Flex,
  Image,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Skeleton,
} from "@chakra-ui/react";
import { X_JUMP_TOKEN } from "@/env/contract";
import {
  LaunchpadConenctionQueryVariables,
  StatusEnum,
  useLaunchpadConenctionQuery,
  VisibilityEnum,
} from "@near/apollo";
import { useMemo } from "react";
import { useTheme } from "@/hooks/theme";
import { useNavigate } from "react-router";
import {
  Button,
  Select,
  TopCard,
  LoadingIndicator,
  IconButton,
} from "../components";
import { useWalletSelector } from "@/context/wallet-selector";
import { BigDecimalFloat, getUTCDate } from "@near/ts";
import { useNearQuery } from "react-near";
import { useTokenMetadata } from "@/hooks/modules/token";
import { FolderOpenIcon } from "@heroicons/react/solid";
import { MemberArea } from "@/components/modules/launchpad/home-member-area";
import { Steps } from "intro.js-react";

const PAGINATE_LIMIT = 30;

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Home() {
  const [filterMine, setMine] = useState<boolean | null>(null);
  const [filterStatus, setStatus] = useState<StatusEnum | null>(null);
  const [filterVisibility, setVisibility] = useState<VisibilityEnum | null>(
    null
  );
  const [filterSearch, setSearch] = useState<string | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const navigate = useNavigate();

  const { accountId } = useWalletSelector();

  const { darkPurpleOpaque, glassyWhite, blackAndWhite, glassyWhiteOpaque } =
    useTheme();

  const tableHover = useColorModeValue(darkPurpleOpaque, glassyWhite);

  const investor = useViewInvestor(accountId!);

  const { data: totalAllowanceData = "0" } =
    useViewTotalEstimatedInvestorAllowance(accountId!);

  const { data: launchpadSettings, loading: loadingLaunchpadSettings } =
    useViewLaunchpadSettings();

  const { data: baseTokenBalance, loading: loadingBaseTokenBalance } =
    useNearQuery<string, { account_id: string }>("ft_balance_of", {
      contract: X_JUMP_TOKEN,
      variables: {
        account_id: accountId!,
      },
      poolInterval: 1000 * 60,
      skip: !accountId,
    });

  const { data: baseTokenMetadata, loading: loadingProjectToken } =
    useTokenMetadata(X_JUMP_TOKEN);

  const queryVariables: LaunchpadConenctionQueryVariables = useMemo(() => {
    return {
      limit: PAGINATE_LIMIT,
      accountId: accountId ?? "",

      showMineOnly: filterMine,
      visibility: filterVisibility,
      status: filterStatus,
      search: filterSearch,
    };
  }, [accountId, filterStatus, filterMine, filterVisibility, filterSearch]);

  const {
    data: {
      launchpad_projects: { data: launchpadProjects, hasNextPage = false } = {
        data: [],
      },
    } = {},
    loading: loadingProjects,
    fetchMore,
    refetch,
  } = useLaunchpadConenctionQuery({
    variables: {
      limit: PAGINATE_LIMIT,
      accountId: accountId ?? "",
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    (async () => {
      await refetch({
        ...queryVariables,
        offset: 0,
      });
    })();
  }, [queryVariables]);

  const fetchMoreItems = useCallback(
    debounce(async (queryVariables: LaunchpadConenctionQueryVariables) => {
      if (loadingProjects || !hasNextPage) {
        return;
      }

      setLoadingItems(true);

      await fetchMore({
        variables: {
          offset: (launchpadProjects ?? []).length,
          ...queryVariables,
        },
      });

      setLoadingItems(false);
    }, 240),
    [loadingItems, hasNextPage, loadingProjects, launchpadProjects]
  );

  const isLoaded = useMemo(() => {
    return (
      !loadingLaunchpadSettings &&
      !loadingBaseTokenBalance &&
      !loadingProjectToken
    );
  }, [launchpadSettings, loadingBaseTokenBalance, loadingProjectToken]);

  const [showSteps, setShowSteps] = useState(false);

  const stepItems = [
    {
      element: ".launchpad",
      title: "Launchpad",
      intro: (
        <div>
          <span>
            Jump launchpad is a page where you can stake your xJump, receive
            allocations and invest in crypto projects.
          </span>
        </div>
      ),
    },
    {
      title: "Member Area",
      element: ".member-area",
      intro: (
        <div className="flex flex-col">
          <span className="mb-2">This is member area.</span>

          <span>
            In this section you can stake your xJump tokens, watch your level,
            check the amount of staked tokens and the total of your allocations.
          </span>
        </div>
      ),
    },
    {
      title: "Projects",
      element: ".table-projects",
      intro: (
        <div className="flex flex-col">
          <span>
            Here are all the projects that have vesting programs that you can
            invest with your allocations
          </span>
        </div>
      ),
    },
  ];

  return (
    <Flex
      gap="30px"
      direction="column"
      p="30px"
      w="100%"
      overflow="hidden"
      pt="150px"
      className="relative"
    >
      <Steps
        enabled={showSteps}
        steps={stepItems}
        initialStep={0}
        onExit={() => setShowSteps(false)}
        options={{
          showProgress: false,
          showBullets: false,
          scrollToElement: false,
        }}
      />

      <Flex gap={5} className="flex-col lg:flex-row">
        <TopCard
          gradientText="Jump Pad"
          bigText="Stake. Help. Earn."
          bottomDescription="This is the Jump launchad where you can spend the launchpad tickets to invest and support Launchpad Projects"
          jumpLogo
          onClick={() => setShowSteps(true)}
        />

        <MemberArea
          isLoaded={isLoaded}
          investor={investor?.data!}
          totalAllowance={totalAllowanceData}
          launchpadSettings={launchpadSettings!}
          baseToken={{
            balance: baseTokenBalance!,
            metadata: baseTokenMetadata!,
          }}
        />
      </Flex>

      <Flex justifyContent="space-between" flexWrap="wrap" gap={5}>
        <Flex gap="4" flexGrow="1" flexWrap="wrap">
          <Select
            value={filterStatus}
            placeholder="Status"
            onChange={(value: StatusEnum | null) => setStatus(value)}
            items={
              [
                { label: "Open", value: StatusEnum.Open },
                { label: "Closed", value: StatusEnum.Closed },
              ] as const
            }
          />
          <Select
            placeholder="Visibility"
            value={filterVisibility}
            onChange={(value: VisibilityEnum | null) =>
              setVisibility(value as VisibilityEnum)
            }
            items={
              [
                { label: "Public", value: VisibilityEnum.Public },
                { label: "Private", value: VisibilityEnum.Private },
              ] as const
            }
          />
          <Select
            value={filterMine}
            placeholder="Mine Only"
            onChange={(value: boolean | null) => setMine(value)}
            items={
              [
                { label: "Yes", value: true },
                { label: "No", value: false },
              ] as const
            }
          />
        </Flex>

        <Flex className="md:max-w-[330px]" w="100%">
          <Input
            borderWidth="2px"
            h="60px"
            maxW="100%"
            w="100%"
            value={filterSearch ?? ""}
            fontSize={16}
            borderRadius={15}
            placeholder="Search by project name"
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

      <TableContainer
        px="20px"
        py="20px"
        borderWidth="2px"
        borderRadius={20}
        className="table-projects"
      >
        <Table size="lg" width="100%" variant="unstyled">
          <Thead>
            <Tr fontSize="18px">
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Price</Th>
              <Th>Access</Th>
              <Th>Raise Size</Th>
              <Th>Filled</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>

          <Tbody>
            {isEmpty(launchpadProjects) && !loadingProjects && (
              <Tr>
                <Td colSpan={8} className="flex items-center">
                  <FolderOpenIcon className="h-[28px] text-white mr-[4px]" />

                  <span>No items available</span>
                </Td>
              </Tr>
            )}

            {loadingProjects && !loadingItems && (
              <Tr>
                <Td>
                  <Skeleton className="w-[30px] h-[30px] rounded-full" />
                </Td>
                {[...Array(7)].map((_, i) => (
                  <Td key={`launchpad-skeleton-${i}`}>
                    <Skeleton className="w-full h-[22.5px] rounded-full" />
                  </Td>
                ))}
              </Tr>
            )}

            {(loadingItems ||
              (!isEmpty(launchpadProjects) && !loadingProjects)) &&
              (launchpadProjects ?? []).map((e, index) => (
                <Tr
                  cursor="pointer"
                  fontSize="18px"
                  borderRadius="20px"
                  onClick={() => {
                    if (e) {
                      navigate(`/launchpad/${e?.listing_id}`);
                    }
                  }}
                  key={`launchpad-project-${e?.listing_id}-${index}`}
                  _hover={{
                    bg: tableHover,
                  }}
                >
                  <Td borderTopLeftRadius="16px" borderBottomLeftRadius="16px">
                    <Image
                      borderRadius={99}
                      border="solid 3px"
                      borderColor={glassyWhiteOpaque}
                      src={e?.project_token_info?.image || ""}
                      className="w-[36px] h-[36px] rounded-full"
                    />
                  </Td>
                  <Td>{e?.project_name}</Td>
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
          </Tbody>
        </Table>
      </TableContainer>

      {hasNextPage && (
        <Flex className="flex items-center justify-center">
          <Button
            className="w-[168px]"
            onClick={() => fetchMoreItems(queryVariables)}
          >
            {loadingItems ? <LoadingIndicator /> : "Load more items"}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
