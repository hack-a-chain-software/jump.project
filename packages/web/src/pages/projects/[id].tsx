import { useMemo, useState } from "react";
import { useLaunchPadProjectQuery } from "@near/apollo";
import { useNavigate, useParams } from "react-router";
import { BackButton } from "@/components/shared/back-button";
import { useTheme } from "@/hooks/theme";
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
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import { twMerge } from "tailwind-merge";
import { useTokenBalance, useTokenMetadata } from "@/hooks/modules/token";

/**
 * @description - Launchpad project details page
 * @name Project
 */
export const Project = () => {
  const { id } = useParams();
  const { jumpGradient } = useTheme();
  const { accountId } = useWalletSelector();

  const navigate = useNavigate();

  const navigateToExternalURL = (uri: string) => {
    window.open(uri);
  };

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

  const { data: metadataPriceToken, loading: laodingPriceTokenMetadata } =
    useTokenMetadata(launchpadProject?.price_token!);

  const { data: metadataProjectToken, loading: loadingProjectToken } =
    useTokenMetadata(launchpadProject?.project_token!);

  const { data: vestedAllocations, loading: loadingVestedAllocations } =
    useViewVestedAllocations(accountId!, launchpadProject?.listing_id!);

  const { data: investorAllowance, loading: loadingAllowance } =
    useViewInvestorAllowance(accountId!, launchpadProject?.listing_id!);

  const { data: totalAllowanceData = "0", loading: loadingTotalAllowance } =
    useViewTotalEstimatedInvestorAllowance(accountId!);

  const { data: priceTokenBalance, loading: loadingPriceTokenBalance } =
    useTokenBalance(launchpadProject?.price_token!, accountId!);

  const isLoading = useMemo(
    () =>
      loadingAllocation ||
      loadingAllowance ||
      loadingProjectToken ||
      loadingTotalAllowance ||
      loadingLaunchpadProject ||
      loadingPriceTokenBalance ||
      loadingVestedAllocations ||
      laodingPriceTokenMetadata,
    [
      loadingAllowance,
      loadingAllocation,
      loadingProjectToken,
      loadingTotalAllowance,
      loadingLaunchpadProject,
      loadingPriceTokenBalance,
      loadingVestedAllocations,
      laodingPriceTokenMetadata,
    ]
  );

  const [tab, setTab] = useState("pool");

  return (
    <PageContainer>
      <BackButton onClick={() => navigate("/")} />

      <div className="flex space-x-[24px]">
        <div>
          <ProjectInfo
            isLoading={isLoading}
            launchpadProject={launchpadProject!}
            metadataPriceToken={metadataPriceToken!}
          />

          <div className="bg-[rgba(255,255,255,0.1)] p-[24px] rounded-[20px] col-span-6 relative">
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
                className={twMerge(
                  "py-[10px] px-[24px] rounded-[10px] text-white border border-[rgba(255,255,255,0.1)]",
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
              <ProjectStats
                isLoading={isLoading}
                launchpadProject={launchpadProject!}
                investorAllowance={investorAllowance!}
                investorAllocation={investorAllocation!}
                metadataPriceToken={metadataPriceToken!}
                metadataProjectToken={metadataProjectToken!}
              />
            )}

            {tab === "investiments" && <ProjectInvestments />}
          </div>
        </div>

        <ProjectUserArea
          isLoading={isLoading}
          vestedAllocations={vestedAllocations!}
          launchpadProject={launchpadProject!}
          metadataProjectToken={metadataProjectToken!}
          investorAllocation={investorAllocation!}
        />
      </div>
    </PageContainer>
  );
};

export default Project;