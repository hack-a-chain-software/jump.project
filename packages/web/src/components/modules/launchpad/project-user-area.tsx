import Big from "big.js";
import { useMemo, useCallback } from "react";
import { isBefore } from "date-fns";
import { useWalletSelector } from "@/context/wallet-selector";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { launchpadProject, investorAllocation } from "@/interfaces";
import { useState } from "react";
import { Steps } from "intro.js-react";

import { NumberInput } from "@/components";

const CONNECT_WALLET_MESSAGE = "Connect wallet";

export function ProjectUserArea({
  isLoading,
  launchpadProject,
  priceTokenBalance,
  investorAllowance,
}: {
  isLoading: boolean;
  investorAllowance: string;
  priceTokenBalance: string;
  totalAllowanceData: string;
  launchpadProject: launchpadProject;
  investorAllocation: investorAllocation;
}) {
  const { accountId, selector } = useWalletSelector();
  const { buyTickets } = useLaunchpadStore();

  const [tickets, setTickets] = useState(0);

  const allocationsAvailable = useMemo(() => {
    return new Big(investorAllowance ?? "0");
  }, [investorAllowance]);

  const onJoinProject = useCallback(
    (amount: number) => {
      if (
        typeof launchpadProject?.listing_id &&
        launchpadProject?.price_token
      ) {
        buyTickets(
          new Big(amount)
            .mul(new Big(launchpadProject.token_allocation_price || 0))
            .toString(),
          launchpadProject.price_token,
          launchpadProject.listing_id,
          accountId!,
          selector
        );
      }
    },
    [
      1,
      accountId,
      launchpadProject?.project_token,
      launchpadProject?.token_allocation_price,
    ]
  );

  const formatDate = (start_timestamp?: string) => {
    const date = getUTCDate(Number(start_timestamp ?? "0"));
    return format(date, "mm/dd/yyyy");
  };

  const enabledSales = useMemo(() => {
    const now = new Date();
    const startSale = new Date(
      Number(launchpadProject?.open_sale_1_timestamp!)
    );

    return isBefore(startSale, now);
  }, [launchpadProject]);

  const ticketsAmount = useMemo(() => {
    return new Big(launchpadProject?.token_allocation_price! ?? 0).mul(
      new Big(tickets.toString())
    );
  }, [tickets]);

  const hasTicketsAmount = useMemo(() => {
    return new Big(priceTokenBalance ?? "0").gte(ticketsAmount);
  }, [ticketsAmount, priceTokenBalance]);

  const decimals = useMemo(() => {
    if (!launchpadProject?.price_token_info?.decimals) {
      return new Big(1);
    }

    return new Big(10).pow(
      Number(launchpadProject?.price_token_info?.decimals)
    );
  }, [launchpadProject?.price_token_info]);

  const balance = useMemo(() => {
    return new Big(priceTokenBalance ?? 0).div(decimals).toFixed(2);
  }, [priceTokenBalance, decimals]);

  const total = useMemo(() => {
    return ticketsAmount.div(decimals);
  }, [ticketsAmount, decimals]);

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
    <div className="bg-[rgba(255,255,255,0.1)] rounded-[20px] py-[24px] px-[64px] flex-1 flex flex-col items-center h-max mb-[8px]">
      <div className="px-[24px] py-[8px] rounded-[50px] bg-[#559C71] w-max flex space-x-[10px] mb-[40px]">
        <span className="tracking-[-0.04em] font-[500] text-[16px]">
          Open sales ends at:
        </span>

        <span className="font-[800] text-[16px] tracking-[-0.04em]">
          03:05:07:00
        </span>
      </div>

      <div className="bg-[rgba(252,252,252,0.2)] pl-[25px] pr-[19px] py-[18px] rounded-[20px] w-full mb-[8px]">
        <div className="mb-[16px]">
          <span className="font-[600] text-[14px] tracking-[-0.03em]">
            Allocation amount
          </span>
        </div>

        <div className="mb-[23px]">
          <NumberInput
            min={0}
            value={tickets}
            max={allocationsAvailable.toNumber()}
            onChange={(value) => setTickets(value || 0)}
          />
        </div>

        <div>
          <span
            children={`Your allocation balance: 500`}
            className="text-[14px] font-[600] tracking-[-0.03em] text-[rgba(255,255,255,0.75)]"
          />
        </div>
      </div>

      <div className="bg-[rgba(252,252,252,0.2)] pl-[25px] pr-[19px] py-[18px] rounded-[20px] w-full flex justify-between items-center mb-[16px]">
        <div>
          <div className="mb-[8px]">
            <span className="font-[600] text-[14px] tracking-[-0.03em]">
              Price
            </span>
          </div>

          <div className="mb-[8px]">
            <span
              children={0}
              className="font-[800] text-[24px] tracking-[-0.03em] text-[#E2E8F0]"
            />
          </div>

          <div>
            <span
              children={`Your ballance: 500 USDT`}
              className="text-[14px] font-[600] tracking-[-0.03em] text-[rgba(255,255,255,0.75)]"
            />
          </div>
        </div>

        <div>
          <button className="p-[8px] rounded-[10px] bg-white min-w-[58px]">
            <span className="text-[#431E5A] tracking-[-0.04em] font-[600] text-[14px]">
              USDT
            </span>
          </button>
        </div>
      </div>

      <div className="w-full">
        <button className="bg-white rounded-[10px] px-[16px] py-[10px] w-full">
          <span className="font-[600] text-[14px] text-[#431E5A]">
            Join project
          </span>
        </button>
      </div>
    </div>
  );
}
