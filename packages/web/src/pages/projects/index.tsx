import { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash-es";
import {
  useViewInvestor,
  useViewLaunchpadSettings,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import { X_JUMP_TOKEN } from "@/env/contract";
import {
  LaunchpadConenctionQueryVariables,
  StatusEnum,
  useLaunchpadConenctionQuery,
  VisibilityEnum,
} from "@near/apollo";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Button, TopCard, LoadingIndicator } from "@/components";
import { useWalletSelector } from "@/context/wallet-selector";
import { useNearQuery } from "react-near";
import { useTokenMetadata } from "@/hooks/modules/token";
import { MemberArea } from "@/components/modules/launchpad/home-member-area";
import { Steps } from "intro.js-react";
import { ProjectCard } from "@/components";
import { twMerge } from "tailwind-merge";
import { SearchIcon } from "@heroicons/react/outline";

const PAGINATE_LIMIT = 30;

export const Projects = () => {
  const [filterMine, setMine] = useState<boolean | null>(null);
  const [filterStatus, setStatus] = useState<StatusEnum | null>(null);
  const [filterVisibility, setVisibility] = useState<VisibilityEnum | null>(
    null
  );
  const [filterSearch, setSearch] = useState<string | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const navigate = useNavigate();

  const { accountId } = useWalletSelector();

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
    <div className="p-[30px] w-full overflow-hidden pt-[150px] relative">
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

      <div className="flex flex-col lg:flex-row space-x-[24px] mb-[86px]">
        <TopCard
          gradientText=""
          bigText="Boost your Jump Pad experience with xJUMP"
          bottomDescription="Get early access to the best NEAR projects before they hit the market,  and increase your allocation tier by only using xJUMP "
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
      </div>

      <div className="flex items-center mb-[49px]">
        <div className="flex-grow space-x-[52px]">
          <button
            className={twMerge(
              "p-[10px] rounded-[10px] text-white",
              !filterVisibility && !filterMine && "bg-white text-[#431E5A]"
            )}
          >
            <span className="font-[700] text-[16px] tracking-[-0.04em]">
              All sales
            </span>
          </button>

          <button
            className={twMerge(
              "p-[10px] rounded-[10px] text-white",
              filterVisibility && "bg-white text-[#431E5A]"
            )}
          >
            <span className="font-[700] text-[16px] tracking-[-0.04em]">
              Whitelist
            </span>
          </button>

          <button
            className={twMerge(
              "p-[10px] rounded-[10px] text-white",
              filterMine && "bg-white text-[#431E5A]"
            )}
          >
            <span className="font-[700] text-[16px] tracking-[-0.04em]">
              My sales
            </span>
          </button>
        </div>

        <div>
          <div className="relative">
            <input
              placeholder="Search project"
              className="bg-[rgba(255,255,255,0.1)] px-[16px] py-[10px] rounded-[10px] text-[14px] font-[400] leading-[18px] text-white w-[355px] placeholder:text-[rgba(255,255,255,0.5)] placeholder:text-[14px] placeholder:font-[400]"
            />

            <SearchIcon
              className="
                w-[18px] h-[18px] text-white
                pointer-none opacity-[0.5]
                absolute right-[12px] top-[calc(50%-9px)]
              "
            />
          </div>
        </div>
      </div>

      <div
        className="
          grid
          place-items-center
          gap-x-[18px] gap-y-[48px]
          grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3 web:grid-cols-4
        "
      >
        {(launchpadProjects ?? []).map((project, index) => (
          <ProjectCard
            {...(project as any)}
            key={"jumpad-projects-project-" + index}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex items-center justify-center">
          <Button
            className="w-[168px]"
            onClick={() => fetchMoreItems(queryVariables)}
          >
            {loadingItems ? <LoadingIndicator /> : "Load more items"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Projects;
