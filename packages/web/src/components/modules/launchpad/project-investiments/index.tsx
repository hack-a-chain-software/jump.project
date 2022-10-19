import Big from "big.js";
import { useMemo } from "react";
import { launchpadProject } from "@/interfaces";
import { useWalletSelector } from "@/context/wallet-selector";
import isBefore from "date-fns/isBefore";

const CONNECT_WALLET_MESSAGE = "Connect Wallet";

const formatConfig = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
};

export const ProjectInvestments = ({
  investorAllocation,
  investorAllowance,
  vestedAllocations,
  metadataProjectToken,
  launchpadProject: { final_sale_2_timestamp },
}: {
  vestedAllocations: any;
  metadataProjectToken: any;
  investorAllowance: any;
  investorAllocation: any;
  launchpadProject: Partial<launchpadProject>;
}) => {
  const { accountId } = useWalletSelector();

  const decimals = useMemo(() => {
    return new Big(metadataProjectToken?.decimals ?? "0");
  }, [metadataProjectToken]);

  const claimedAmount = useMemo(() => {
    return new Big(investorAllocation.totalTokensBought || "0");
  }, [investorAllocation]);

  const unlockedAmount = useMemo(() => {
    return new Big(vestedAllocations || "0");
  }, [vestedAllocations]);

  const totalAmount = useMemo(() => {
    return (
      claimedAmount
        .add(unlockedAmount || 1)
        .div(decimals || 1)
        .toFixed(2) +
      " " +
      metadataProjectToken?.symbol!
    );
  }, [claimedAmount, unlockedAmount]);

  const allocationsAvailable = useMemo(() => {
    return new Big(investorAllowance ?? "0");
  }, [investorAllowance]);

  const formatNumber = (value, decimals, config: any = formatConfig) => {
    const decimalsBig = new Big(10).pow(Number(decimals) || 1);

    const formattedBig = new Big(value ?? 0).div(decimalsBig).toFixed(2);

    return new Intl.NumberFormat("en-US", config).format(Number(formattedBig));
  };

  const enabledSale = useMemo(() => {
    const now = new Date();

    const endAt = new Date(Number(final_sale_2_timestamp!));

    return isBefore(now, endAt);
  }, [final_sale_2_timestamp]);

  return (
    <div>
      <div className="flex space-x-[67px] mb-[32px]">
        <div>
          <div>
            <span className="text-[14px] font-[600] tracking-[-0.03em]">
              Total token amount
            </span>
          </div>

          <div>
            <span
              children={accountId ? totalAmount : CONNECT_WALLET_MESSAGE}
              className="font-[800] text-[24px] tracking-[-0.03em] text-[#E2E8F0]"
            />
          </div>
        </div>

        <div>
          <div>
            <span className="text-[14px] font-[600] tracking-[-0.03em]">
              Allocation ballance
            </span>
          </div>

          <div>
            <span
              children={
                accountId
                  ? allocationsAvailable.toNumber()
                  : CONNECT_WALLET_MESSAGE
              }
              className="font-[800] text-[24px] tracking-[-0.03em] text-[#E2E8F0]"
            />
          </div>
        </div>

        <div>
          <div>
            <span className="text-[14px] font-[600] tracking-[-0.03em]">
              Allocations bought
            </span>
          </div>

          <div>
            <span
              className="font-[800] text-[24px] tracking-[-0.03em] text-[#E2E8F0]"
              children={
                accountId
                  ? investorAllocation.allocationsBought ?? "0"
                  : CONNECT_WALLET_MESSAGE
              }
            />
          </div>
        </div>
      </div>

      <div className="bg-[rgba(252,252,252,0.2)] rounded-[20px] pl-[25px] pr-[33px] py-[16px] flex space-between items-center">
        <div className="flex flex-1 space-x-[32px]">
          <div>
            <div>
              <span className="font-[600] text-[14px] tracking-[-0.03em]">
                Unlocked amount
              </span>
            </div>

            <div>
              <span
                className="font-[800] text-[24px] tracking-[-0.03em]"
                children={
                  accountId
                    ? formatNumber(unlockedAmount, decimals) +
                      metadataProjectToken?.symbol!
                    : CONNECT_WALLET_MESSAGE
                }
              />
            </div>

            <div>
              <span className="font-[600] text-[14px] tracking-[-0.03em] text-[rgba(255,255,255,0.75)]">
                Available to claim
              </span>
            </div>
          </div>

          <div>
            <div>
              <span className="font-[600] text-[14px] tracking-[-0.03em]">
                Claimed Amount
              </span>
            </div>

            <div>
              <span
                children={
                  accountId
                    ? formatNumber(claimedAmount, decimals) +
                      metadataProjectToken?.symbol!
                    : CONNECT_WALLET_MESSAGE
                }
                className="font-[800] text-[24px] tracking-[-0.03em]"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            className="py-[16px] px-[32px] rounded-[10px] bg-white disabled:opacity-[0.5] disabled:cursor-not-allowed"
            disabled={enabledSale || vestedAllocations === "0" || !accountId}
          >
            <span className="font-[600] text-[14px] tracking-[-0.04em] text-[#431E5A]">
              Withdraw
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInvestments;
