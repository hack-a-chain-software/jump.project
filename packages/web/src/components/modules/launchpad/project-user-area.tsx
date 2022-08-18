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

export function ProjectUserArea({
  isLoading,
  launchpadProject,
  vestedAllocations,
  investorAllocation,
  metadataPriceToken,
  metadataProjectToken,
}: {
  isLoading: boolean;
  vestedAllocations: string;
  metadataPriceToken: tokenMetadata;
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

  const priceTokenDecimals = useMemo(() => {
    return new BN(metadataPriceToken?.decimals ?? "0");
  }, [metadataPriceToken]);

  const totalVested = useMemo(() => {
    return new BN(launchpadProject?.token_allocation_price!).mul(
      new BN(investorAllocation.allocationsBought ?? "0")
    );
  }, [metadataPriceToken]);

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

        <div className="flex-col">
          <div>
            <span className="text-[18px] font-[800] tracking-[-0.05em]">
              Vested
            </span>
          </div>

          <div className="flex space-x-[4px]">
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Allocations:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {investorAllocation.allocationsBought}
              </span>
            </div>
          </div>

          <div className="flex space-x-[4px]">
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Total amount:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {formatNumber(
                  totalVested,
                  priceTokenDecimals,
                  metadataPriceToken?.symbol!
                )}
              </span>
            </div>
          </div>

          <div className="mt-[12px]">
            <span className="text-[18px] font-[800] tracking-[-0.05em]">
              Rewards
            </span>
          </div>

          <div className="flex space-x-[4px]">
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Total amount:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {totalAmount}
              </span>
            </div>
          </div>

          <div className="flex space-x-[4px]">
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Unlocked amount:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {formatNumber(
                  unlockedAmount,
                  decimals,
                  metadataProjectToken?.symbol!
                )}
              </span>
            </div>
          </div>

          <div className="flex space-x-[4px]">
            <div>
              <span className="text-[18px] font-[600] tracking-[-0.05em]">
                Claimed amount:
              </span>
            </div>

            <div>
              <span className="text-[18px] font-[500] tracking-[-0.05em]">
                {formatNumber(
                  claimedAmount,
                  decimals,
                  metadataProjectToken?.symbol!
                )}
              </span>
            </div>
          </div>
        </div>

        <Skeleton isLoaded={!isLoading} w="100%" borderRadius="15px">
          <Button
            disabled={
              enabledSale || investorAllocation.allocationsBought === "0"
            }
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
