import Big from "big.js";
import isEmpty from "lodash/isEmpty";
import { useState, useCallback, useEffect } from "react";
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
  PreviewProjects,
} from "@/components";
import { useWalletSelector } from "@/context/wallet-selector";
import { useNearQuery } from "react-near";
import { useTokenMetadata } from "@/hooks/modules/token";
import { FolderOpenIcon } from "@heroicons/react/solid";
import { Steps } from "intro.js-react";

const PAGINATE_LIMIT = 30;

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Index() {
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

  // const {
  //   data: {
  //     launchpad_projects: { data: launchpadProjects, hasNextPage = false } = {
  //       data: [],
  //     },
  //   } = {},
  //   loading: loadingProjects,
  //   fetchMore,
  //   refetch,
  // } = useLaunchpadConenctionQuery({
  //   variables: {
  //     limit: PAGINATE_LIMIT,
  //     accountId: accountId ?? "",
  //   },
  //   notifyOnNetworkStatusChange: true,
  // });

  // useEffect(() => {
  //   (async () => {
  //     await refetch({
  //       ...queryVariables,
  //       offset: 0,
  //     });
  //   })();
  // }, [queryVariables]);

  // const fetchMoreItems = useCallback(
  //   debounce(async (queryVariables: LaunchpadConenctionQueryVariables) => {
  //     if (loadingProjects || !hasNextPage) {
  //       return;
  //     }

  //     setLoadingItems(true);

  //     await fetchMore({
  //       variables: {
  //         offset: (launchpadProjects ?? []).length,
  //         ...queryVariables,
  //       },
  //     });

  //     setLoadingItems(false);
  //   }, 240),
  //   [loadingItems, hasNextPage, loadingProjects, launchpadProjects]
  // );

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

  const formatBig = (value, decimals) => {
    const decimalsBig = new Big(10).pow(Number(decimals) ?? 0);

    return new Big(value ?? 0).div(decimalsBig);
  };

  return (
    <Flex
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
          gradientText="Launchpad "
          bigText="Welcome to Jump Pad"
          bottomDescription="Jump Pad is a NEAR native token launchpad that empowers crypto currency projects with the ability to distribute tokens and raise capital from the community or private investors for raise liquidity. "
          jumpLogo
          onClick={() => setShowSteps(true)}
        />
      </Flex>

      <div>
        <PreviewProjects title="Sales in progress" status={StatusEnum.Open} />
        <PreviewProjects title="Upcoming sales" status={StatusEnum.Waiting} />
        <PreviewProjects title="Closed sales" status={StatusEnum.Closed} />
      </div>
    </Flex>
  );
}

export default Index;
