import { useState, useCallback, useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { debounce } from "lodash-es";
import {
  useViewInvestor,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import { X_JUMP_TOKEN } from "@/env/contract";
import {
  LaunchpadConenctionQueryVariables,
  useLaunchpadConenctionQuery,
  VisibilityEnum,
} from "@near/apollo";
import { useMemo } from "react";
import { Button, TopCard, LoadingIndicator, BackButton } from "@/components";
import { useWalletSelector } from "@/context/wallet-selector";
import { useNearQuery } from "react-near";
import { MemberArea } from "@/components/modules/launchpad/home-member-area";
import { ProjectCard } from "@/components";
import { twMerge } from "tailwind-merge";
import { FolderOpenIcon, SearchIcon } from "@heroicons/react/outline";
import { viewFunction } from "@/tools";
import { useNavigate } from "react-router";

const PAGINATE_LIMIT = 30;

export const Projects = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState({});
  const [filterSearch, setSearch] = useState<string | null>(null);
  const [launchpadSettings, setlaunchpad] = useState<any>();
  const [baseTokenMetadata, setBaseTokenMetadata] = useState<any>();

  const [loadingItems, setLoadingItems] = useState(false);

  const { accountId, selector } = useWalletSelector();

  const investor = useViewInvestor(accountId!);

  const { data: totalAllowanceData = "0" } =
    useViewTotalEstimatedInvestorAllowance(accountId!);

  useEffect(() => {
    (async () => {
      const settings = await viewFunction(
        selector,
        import.meta.env.VITE_JUMP_LAUNCHPAD_CONTRACT,
        "view_contract_settings"
      );

      const metadata = await viewFunction(
        selector,
        X_JUMP_TOKEN,
        "ft_metadata"
      );

      setlaunchpad(settings);
      setBaseTokenMetadata(metadata);
    })();
  }, []);

  const { data: baseTokenBalance } = useNearQuery<
    string,
    { account_id: string }
  >("ft_balance_of", {
    contract: X_JUMP_TOKEN,
    variables: {
      account_id: accountId!,
    },
    skip: !accountId,
  });

  const queryVariables: LaunchpadConenctionQueryVariables = useMemo(() => {
    return {
      limit: PAGINATE_LIMIT,
      accountId: accountId ?? "",
      search: filterSearch,
      ...filter,
    };
  }, [accountId, filterSearch, filter]);

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

  const refetchItems = (
    variables: Partial<LaunchpadConenctionQueryVariables> = {},
    search?: string
  ) => {
    setFilter(variables);
    setSearch(search || null);

    refetch({
      search,
      offset: 0,
      visibility: null,
      showMineOnly: false,
      ...variables,
    });
  };

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

  const stepItems = [
    {
      element: ".top-card",
      title: "Launchpad Projects",
      intro: (
        <div>
          <span>
            Here is the Project PageJump launchpad Projects is a page where you
            can stake your xJump, watch your current tier and search Vesting
            Projects
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
      element: ".projects",
      intro: (
        <div className="flex flex-col">
          <span>
            All Investment projects are listed here, you can filter to show only
            your projects or provate sale projects.
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-[30px] w-full overflow-hidden pt-[150px] relative">
      <BackButton text="Jump Pad" onClick={() => navigate("/")} />

      <div className="flex flex-col space-y-[24px] xl:space-y-[0px] xl:flex-row xl:space-x-[24px] mb-[86px] mt-[30px]">
        <TopCard
          gradientText=""
          maxW="max-w-[548px] xl:max-w-[none]"
          bigText="Boost your Jump Pad experience with xJUMP"
          bottomDescription="Get early access to the best NEAR projects before they hit the market,  and increase your allocation tier by using xJUMP "
          jumpLogo
          stepItems={stepItems}
        />

        <MemberArea
          isLoaded={true}
          investor={investor?.data!}
          totalAllowance={totalAllowanceData}
          launchpadSettings={launchpadSettings!}
          baseToken={{
            balance: baseTokenBalance!,
            metadata: baseTokenMetadata!,
          }}
        />
      </div>

      <div className="projects relative">
        <div className="flex items-center mb-[49px]">
          <div className="flex-grow space-x-[52px]">
            <button
              onClick={() => refetchItems({})}
              className={twMerge(
                "p-[10px] rounded-[10px] text-white",
                isEmpty(filter) && "bg-white text-[#431E5A]"
              )}
            >
              <span className="font-[700] text-[16px] tracking-[-0.04em]">
                All sales
              </span>
            </button>

            <button
              onClick={() =>
                refetchItems({ visibility: VisibilityEnum.Private })
              }
              className={twMerge(
                "p-[10px] rounded-[10px] text-white",
                Object.keys(filter).includes("visibility") &&
                  "bg-white text-[#431E5A]"
              )}
            >
              <span className="font-[700] text-[16px] tracking-[-0.04em]">
                Private sales
              </span>
            </button>

            <button
              className={twMerge(
                "p-[10px] rounded-[10px] text-white",
                Object.keys(filter).includes("showMineOnly") &&
                  "bg-white text-[#431E5A]"
              )}
              onClick={() => refetchItems({ showMineOnly: true })}
            >
              <span className="font-[700] text-[16px] tracking-[-0.04em]">
                My sales
              </span>
            </button>
          </div>

          <div>
            <div className="relative hidden log:block">
              <input
                placeholder="Search project"
                className="bg-[rgba(255,255,255,0.1)] px-[16px] py-[10px] rounded-[10px] text-[14px] font-[400] leading-[18px] text-white w-[355px] placeholder:text-[rgba(255,255,255,0.5)] placeholder:text-[14px] placeholder:font-[400]"
                onInput={(event) =>
                  refetchItems(
                    { ...filter },
                    (event.target as HTMLInputElement).value
                  )
                }
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
            place-items-start
            gap-x-[18px] gap-y-[48px]
            grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3 web:grid-cols-4
          "
        >
          {!loadingProjects &&
            (launchpadProjects ?? []).map((project, index) => (
              <ProjectCard
                {...(project as any)}
                key={"jumpad-projects-project-" + index}
              />
            ))}
        </div>

        {!loadingProjects && isEmpty(launchpadProjects) && (
          <div className="flex items-center">
            <FolderOpenIcon className="h-[28px] text-white mr-[4px]" />
            No items here
          </div>
        )}

        {loadingProjects && !loadingItems && (
          <div className="flex items-center justify-center mt-[48px]">
            <div className="animate-spin h-[32px] w-[32px] border border-l-white rounded-full" />
          </div>
        )}

        {hasNextPage && (
          <div className="flex items-center justify-center mt-[48px]">
            <Button
              className="w-[168px]"
              onClick={() => fetchMoreItems(queryVariables)}
            >
              {loadingItems ? <LoadingIndicator /> : "Load more items"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
