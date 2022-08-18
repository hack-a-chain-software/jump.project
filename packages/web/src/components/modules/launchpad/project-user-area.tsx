import BN from "bn.js";
import { useMemo } from "react";
import { isBefore } from "date-fns";
import { WalletIcon } from "@/assets/svg";
import { Flex, Skeleton } from "@chakra-ui/react";
import { Card, GradientText, Button } from "@/components";
import { useWalletSelector } from "@/context/wallet-selector";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { launchpadProject, investorAllocation } from "@/interfaces";

export function ProjectUserArea({
  isLoading,
  launchpadProject,
  vestedAllocations,
  investorAllocation,
}: {
  isLoading: boolean;
  vestedAllocations: string;
  launchpadProject: launchpadProject;
  investorAllocation: investorAllocation;
}) {
  const { accountId, selector } = useWalletSelector();

  const { withdrawAllocations } = useLaunchpadStore();

  const enabledSale = useMemo(() => {
    const now = new Date();

    const endAt = new Date(Number(launchpadProject?.final_sale_2_timestamp!));

    return isBefore(now, endAt);
  }, [launchpadProject]);

  const retrieveTokens = () => {
    if (typeof launchpadProject?.listing_id && launchpadProject?.price_token) {
      withdrawAllocations(
        launchpadProject.listing_id,
        launchpadProject.price_token,
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

        <div className="flex">
          <div>
            <span>Allocations:</span>
          </div>

          <div>
            <span>{investorAllocation.allocationsBought}</span>
          </div>
        </div>

        <div className="flex">
          <div>
            <span>Total amount:</span>
          </div>

          <div>
            <span>
              {new BN(vestedAllocations!)
                .add(new BN(investorAllocation.totalTokensBought!))
                .toString()}
            </span>
          </div>
        </div>

        <div className="flex">
          <div>
            <span>Unlocked amount:</span>
          </div>

          <div>
            <span>{vestedAllocations}</span>
          </div>
        </div>

        <div className="flex">
          <div>
            <span>Claimed amount:</span>
          </div>

          <div>
            <span>{investorAllocation.totalTokensBought}</span>
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
