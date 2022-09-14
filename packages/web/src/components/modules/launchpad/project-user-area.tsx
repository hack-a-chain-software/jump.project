import BN from "bn.js";
import { useMemo } from "react";
import { isBefore } from "date-fns";
import { formatNumber } from "@near/ts";
import { WalletIcon } from "@/assets/svg";
import { Flex, Skeleton } from "@chakra-ui/react";
import { Card, GradientText, Button, IconButton } from "@/components";
import { useWalletSelector } from "@/context/wallet-selector";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import {
  launchpadProject,
  investorAllocation,
  tokenMetadata,
} from "@/interfaces";
import { useState } from "react";
import { Steps } from "intro.js-react";

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

  const [showSteps, setShowSteps] = useState(false);

  const stepItems = [
    {
      title: "User Area",
      element: ".project-user-area",
      intro: (
        <div className="flex flex-col space-y-[8px]">
          <span>
            In this session you follow the data of your investment in the
            project, having access to the number of allocations invested, total
            rewards received, how many rewards were collected and how many are
            available for collection.
          </span>
        </div>
      ),
    },
    {
      title: "Retrieve Tokens",
      element: ".project-user-area-retrieve",
      intro: (
        <div className="flex flex-col space-y-[8px]">
          <span>
            The rewards will be available at the end of the sell phase or when
            all allocations are sold.
          </span>

          <span>
            Your rewards will be updated according to the project timeline.
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      {!isLoading && (
        <div className="absolute right-[24px] top-[24px]">
          <IconButton onClick={() => setShowSteps(true)} />
        </div>
      )}

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

      <Flex className="flex-col space-y-[12px] h-5/6 w-full">
        <Flex className="flex-col space-y-[12px] justify-evenly h-5/6 w-full">
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
        </Flex>
        <Skeleton
          isLoaded={!isLoading}
          w="100%"
          borderRadius="15px"
          className="relative project-user-area-retrieve"
        >
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
    </>
  );
}
