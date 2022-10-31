import { useMemo, useState, useEffect } from "react";
import { useLaunchPadProjectQuery } from "@near/apollo";
import { useNavigate, useParams } from "react-router";
import { BackButton } from "@/components/shared/back-button";
import { useWalletSelector } from "@/context/wallet-selector";
import {
  ProjectInfo,
  ProjectStats,
  PageContainer,
  ProjectInvestments,
  ProjectUserArea,
} from "@/components";
import {
  useViewVestedAllocations,
  useViewInvestorAllowance,
  useViewInvestorAllocation,
} from "@/hooks/modules/launchpad";
import { twMerge } from "tailwind-merge";
import { useTokenBalance } from "@/hooks/modules/token";

export const Project = () => {
  const { id } = useParams();
  const { accountId } = useWalletSelector();

  const navigate = useNavigate();

  const {
    data: { launchpad_project: launchpadProject } = {},
    loading: loadingLaunchpadProject,
  } = useLaunchPadProjectQuery({
    variables: {
      accountId: accountId ?? "",
      projectId: id ?? "",
    },
    skip: !id,
  });

  const { data: investorAllocation, loading: loadingAllocation } =
    useViewInvestorAllocation(accountId!, id!);

  const { data: vestedAllocations, loading: loadingVestedAllocations } =
    useViewVestedAllocations(accountId!, launchpadProject?.listing_id!);

  const { data: investorAllowance, loading: loadingAllowance } =
    useViewInvestorAllowance(accountId!, launchpadProject?.listing_id!);

  const { data: priceTokenBalance, loading: loadingPriceTokenBalance } =
    useTokenBalance(launchpadProject?.price_token!, accountId!);

  const isLoading = useMemo(
    () =>
      loadingAllocation ||
      loadingAllowance ||
      loadingLaunchpadProject ||
      loadingPriceTokenBalance ||
      loadingVestedAllocations,
    [
      loadingAllowance,
      loadingAllocation,
      loadingLaunchpadProject,
      loadingPriceTokenBalance,
      loadingVestedAllocations,
    ]
  );

  const [tab, setTab] = useState("pool");

  const stepItems = [
    {
      element: ".project-info",
      title: "Jump Pad Project",
      intro: (
        <div>
          <span>
            Here is the Project Page, this is the page where you can view all
            the information of a Vesting Project.
          </span>
        </div>
      ),
    },
    {
      title: "Project Details and Investments",
      element: ".details",
      intro: (
        <div className="flex flex-col">
          <span>
            In the Pool Details/My Investments section you will find the most
            diverse technical information about the Vesting Project and
            everything about the Vesting Project.
          </span>
        </div>
      ),
    },
    {
      title: "Investment Session",
      element: ".investment",
      intro: (
        <div className="flex flex-col">
          <span>
            It is in this section that you will find all the information to
            enter the Vesting Project.
          </span>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <BackButton text="All Projects" onClick={() => navigate("/projects")} />

      {isLoading && (
        <div className="flex items-center justify-center pt-[72px]">
          <div className="animate-spin h-[32px] w-[32px] border border-l-white rounded-full" />
        </div>
      )}
      {!isLoading && (
        <div
          className="
            flex justify-center flex-col 
            space-y-[24px]
            xl:space-y-[0xp] xl:space-x-[24px] xl:flex-row
          "
        >
          <div className="xl:max-w-[748px] w-full">
            <ProjectInfo {...(launchpadProject as any)} stepItems={stepItems} />

            <div className="bg-[rgba(255,255,255,0.1)] p-[24px] rounded-[20px] w-full relative details">
              <div className="flex-grow space-x-[24px] mb-[67px]">
                <button
                  onClick={() => setTab("pool")}
                  className={twMerge(
                    "py-[10px] px-[24px] rounded-[10px] text-white border border-[rgba(255,255,255,0.1)]",
                    tab === "pool" && "bg-white text-[#431E5A] border-white"
                  )}
                >
                  <span className="font-[700] text-[16px] tracking-[-0.04em]">
                    Pool details
                  </span>
                </button>

                <button
                  onClick={() => setTab("investiments")}
                  disabled={!accountId}
                  className={twMerge(
                    "py-[10px] px-[24px] rounded-[10px] text-white border border-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-[0.5]",
                    tab === "investiments" &&
                      "bg-white text-[#431E5A] border-white"
                  )}
                >
                  <span className="font-[700] text-[16px] tracking-[-0.04em]">
                    My investments
                  </span>
                </button>
              </div>

              {tab === "pool" && (
                <ProjectStats {...(launchpadProject as any)} />
              )}

              {tab === "investiments" && (
                <ProjectInvestments
                  launchpadProject={launchpadProject!}
                  investorAllowance={investorAllowance!}
                  investorAllocation={investorAllocation!}
                  vestedAllocations={vestedAllocations!}
                />
              )}
            </div>
          </div>

          <ProjectUserArea
            priceTokenBalance={priceTokenBalance!}
            launchpadProject={launchpadProject!}
            investorAllowance={investorAllowance!}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default Project;
