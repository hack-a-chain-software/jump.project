import BN from "bn.js";
import { useMemo } from "react";
import { isBefore } from "date-fns";
import { formatNumber } from "@near/ts";
import { WalletIcon } from "@/assets/svg";
import { Flex, Skeleton } from "@chakra-ui/react";
import { Card, GradientText, Button } from "@/components";
import { useWalletSelector } from "@/context/wallet-selector";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import {
  launchpadProject,
  investorAllocation,
  tokenMetadata,
} from "@/interfaces";

const CONNECT_WALLET_MESSAGE = "Connect wallet";

export function ProjectUserArea({
  isLoading,
  launchpadProject,
  vestedAllocations,
  investorAllocation,
  metadataProjectToken,
}: {
  isLoading: boolean;
  vestedAllocations: string;
  launchpadProject: launchpadProject;
  metadataProjectToken: tokenMetadata;
  investorAllocation: investorAllocation;
}) {
  const { accountId, selector } = useWalletSelector();

  const { withdrawAllocations } = useLaunchpadStore();

  const enabledSale = useMemo(() => {
    const now = new Date();

    const endAt = new Date(Number(launchpadProject?.final_sale_2_timestamp!));

    return isBefore(now, endAt);
  }, [launchpadProject]);

  const decimals = useMemo(() => {
    return new BN(metadataProjectToken?.decimals ?? "0");
  }, [metadataProjectToken]);

  const claimedAmount = useMemo(() => {
    return new BN(investorAllocation.totalTokensBought!);
  }, [investorAllocation]);

  const unlockedAmount = useMemo(() => {
    return new BN(vestedAllocations);
  }, [vestedAllocations]);

  const totalAmount = useMemo(() => {
    return formatNumber(
      claimedAmount.add(unlockedAmount),
      decimals,
      metadataProjectToken?.symbol!
    );
  }, [claimedAmount, unlockedAmount]);

  const retrieveTokens = () => {
    if (typeof launchpadProject?.listing_id && launchpadProject?.price_token) {
      withdrawAllocations(
        launchpadProject.listing_id,
        launchpadProject.project_token,
        accountId!,
        selector
      );
    }
  };

  return (
    <Card className="col-span-12 lg:col-span-6 xl:col-span-3">
      <Flex className="flex-col space-y-[12px] h-full w-full">
        <GradientText fontWeight="800" letterSpacing="-0,03em" fontSize={24}>
          User Area
        </GradientText>

        <div className="flex-col space-y-[4px]">
          <Skeleton
            isLoaded={!isLoading}
            className="flex space-x-[4px] rounded-[16px]"
          >
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Allocations:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {accountId
                  ? investorAllocation.allocationsBought ?? "0"
                  : CONNECT_WALLET_MESSAGE}
              </span>
            </div>
          </Skeleton>

          <Skeleton
            isLoaded={!isLoading}
            className="flex space-x-[4px] rounded-[16px]"
          >
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Total amount:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {accountId ? totalAmount : CONNECT_WALLET_MESSAGE}
              </span>
            </div>
          </Skeleton>

          <Skeleton
            isLoaded={!isLoading}
            className="flex space-x-[4px] rounded-[16px]"
          >
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Unlocked amount:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {accountId
                  ? formatNumber(
                      unlockedAmount,
                      decimals,
                      metadataProjectToken?.symbol!
                    )
                  : CONNECT_WALLET_MESSAGE}
              </span>
            </div>
          </Skeleton>

          <Skeleton
            isLoaded={!isLoading}
            className="flex space-x-[4px] rounded-[16px]"
          >
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Claimed amount:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {accountId
                  ? formatNumber(
                      claimedAmount,
                      decimals,
                      metadataProjectToken?.symbol!
                    )
                  : CONNECT_WALLET_MESSAGE}
              </span>
            </div>
          </Skeleton>
        </div>

        <Skeleton isLoaded={!isLoading} w="100%" borderRadius="15px">
          <Button
            disabled={enabledSale || vestedAllocations === "0" || !accountId}
            onClick={() => retrieveTokens()}
            justifyContent="space-between"
            w="100%"
          >
            Retrieve Tokens
            <WalletIcon />
          </Button>
        </Skeleton>
      </Flex>
    </Card>
  );
}
