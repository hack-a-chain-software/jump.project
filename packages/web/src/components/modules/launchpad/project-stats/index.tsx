import Big from "big.js";
import { useMemo } from "react";
import { format } from "date-fns";
import { getUTCDate } from "@near/ts";
import { useWalletSelector } from "@/context/wallet-selector";
import {
  launchpadProject,
  investorAllocation,
  tokenMetadata,
} from "@/interfaces";

import { Steps } from "./steps";

const CONNECT_WALLET_MESSAGE = "Connect wallet";

export function ProjectStats({
  isLoading,
  launchpadProject,
  investorAllowance,
  investorAllocation,
  metadataPriceToken,
  metadataProjectToken,
}: {
  isLoading: boolean;
  investorAllowance: string;
  metadataPriceToken: tokenMetadata;
  launchpadProject: launchpadProject;
  metadataProjectToken: tokenMetadata;
  investorAllocation: investorAllocation;
}) {
  const { accountId } = useWalletSelector();

  const {
    allocations_sold,
    project_token_info,
    token_allocation_size,
    token_allocation_price,
    open_sale_1_timestamp,
    open_sale_2_timestamp,
    final_sale_2_timestamp,
    fraction_cliff_release,
    liquidity_pool_timestamp,
    fraction_instant_release,
    total_amount_sale_project_tokens = 1,
  } = useMemo(() => {
    return launchpadProject || {};
  }, [launchpadProject]);

  const formatDate = (start_timestamp?: string) => {
    const date = getUTCDate(Number(start_timestamp ?? "0"));
    return format(date, "mm/dd/yyyy");
  };

  const formatNumber = (value, decimals) => {
    const decimalsBig = new Big(10).pow(decimals ?? 1);

    const formattedBig = new Big(value ?? 0).div(decimalsBig).toFixed(2);

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(formattedBig));
  };

  const totalAmount = useMemo(() => {
    return new Big(total_amount_sale_project_tokens ?? 0);
  }, [total_amount_sale_project_tokens]);

  const totalRaise = useMemo(() => {
    const {
      total_amount_sale_project_tokens = 0,
      token_allocation_price = 0,
      token_allocation_size = 1,
    } = launchpadProject || {};

    const totalAmount = new Big(total_amount_sale_project_tokens ?? 0);
    const allocationPrice = new Big(token_allocation_price ?? 0);
    const allocationSize = new Big(token_allocation_size ?? 0);

    return totalAmount.mul(allocationPrice).div(allocationSize);
  }, [launchpadProject]);

  const allocationsSold = useMemo(() => {
    return new Big(allocations_sold ?? 0);
  }, [allocations_sold]);

  const progress = useMemo(() => {
    const decimals = new Big(10).pow(Number(project_token_info?.decimals) || 0);

    return allocationsSold.div(totalAmount).div(decimals).toString();
  }, [allocations_sold, total_amount_sale_project_tokens, project_token_info]);

  const steps = useMemo(() => {
    return [
      <div className="bg-[rgba(252,252,252,0.2)] rounded-[20px] py-[36px] px-[23px] w-full ml-[36px]">
        <div>
          <span className="text-[12px] font-[700] tracking-[-0.04em] text-white">
            Total raised amount
          </span>
        </div>

        <div className="mb-[27px]">
          <span
            className="text-[24px] font-[700] tracking-[-0.04em]"
            children={`$ ${formatNumber(
              totalRaise,
              metadataPriceToken?.decimals
            )} ${metadataPriceToken?.symbol}`}
          />
        </div>

        <div>
          <div className="mb-[16px]">
            <span className="text-[14px] font-[700] tracking-[-0.04em] text-white">
              Total allocations bought
            </span>
          </div>

          <div
            className="
              flex-grow
              rounded-[40px]
              bg-white/[.38]
            "
          >
            <div
              style={{
                width: progress + "%",
              }}
              className="
                h-[10px]
                rounded-[40px]
                bg-[linear-gradient(90deg,_#AE00FF_0%,_#FF1100_100%)]
              "
            />
          </div>

          <div className="mt-[8px] text-end">
            <span
              children={progress + "%"}
              className="text-white font-[700] text-[12px] tracking-[-0.04em]"
            />
          </div>
        </div>
      </div>,
      <div className="flex flex-col ml-[36px] w-full">
        <div className="mb-[32px]">
          <span className="font-[800] text-[16px] tracking-[-0.04em]">
            Status
          </span>
        </div>

        <div className="bg-[rgba(252,252,252,0.2)] rounded-[20px] py-[16px] px-[22px] w-full">
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Start sale date
              </span>
            </div>

            <div>
              <span
                children={formatDate(open_sale_1_timestamp || "")}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Start open sales
              </span>
            </div>

            <div>
              <span
                children={formatDate(open_sale_2_timestamp || "")}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                End sale date
              </span>
            </div>

            <div>
              <span
                children={formatDate(final_sale_2_timestamp || "")}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                DEX Launch date
              </span>
            </div>

            <div>
              <span
                children={formatDate(liquidity_pool_timestamp || "")}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
        </div>
      </div>,
      <div className="flex flex-col ml-[36px] w-full">
        <div className="mb-[32px]">
          <span className="font-[800] text-[16px] tracking-[-0.04em]">
            Allocations
          </span>
        </div>

        <div className="bg-[rgba(252,252,252,0.2)] rounded-[20px] py-[16px] px-[22px] w-full">
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Total allocations bought
              </span>
            </div>

            <div>
              <span
                children={allocations_sold || 0}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Total allocations available
              </span>
            </div>

            <div>
              <span
                children={formatNumber(
                  total_amount_sale_project_tokens,
                  metadataProjectToken?.decimals
                )}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Allocation size
              </span>
            </div>

            <div>
              <span
                children={formatNumber(
                  token_allocation_size,
                  metadataProjectToken?.decimals
                )}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
        </div>
      </div>,
      <div className="flex flex-col ml-[36px] w-full">
        <div className="mb-[32px]">
          <span className="font-[800] text-[16px] tracking-[-0.04em]">
            Token
          </span>
        </div>

        <div className="bg-[rgba(252,252,252,0.2)] rounded-[20px] py-[16px] px-[22px] w-full">
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Token price
              </span>
            </div>

            <div>
              <span
                children={`${formatNumber(
                  token_allocation_price,
                  metadataPriceToken?.decimals
                )} ${metadataPriceToken?.symbol}`}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Total raised (price token)
              </span>
            </div>

            <div>
              <span
                children={formatNumber(
                  totalRaise,
                  metadataPriceToken?.decimals
                )}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Project tokens for sale
              </span>
            </div>

            <div>
              <span
                children={formatNumber(
                  launchpadProject?.total_amount_sale_project_tokens,
                  metadataProjectToken?.decimals
                )}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
        </div>
      </div>,
      <div className="flex flex-col ml-[36px] w-full">
        <div className="mb-[32px]">
          <span className="font-[800] text-[16px] tracking-[-0.04em]">
            Vesting
          </span>
        </div>

        <div className="bg-[rgba(252,252,252,0.2)] rounded-[20px] py-[16px] px-[22px] w-full">
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Vesting initial release
              </span>
            </div>

            <div>
              <span
                children={fraction_instant_release + "%"}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>

          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Vesting cliff release
              </span>
            </div>

            <div>
              <span
                children={fraction_cliff_release + "%"}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Vesting final release
              </span>
            </div>

            <div>
              <span
                children={
                  100 -
                  Number?.parseInt(
                    launchpadProject?.fraction_instant_release || "0"
                  ) -
                  Number?.parseInt(
                    launchpadProject?.fraction_cliff_release || "0"
                  ) +
                  "%"
                }
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Vesting cliff launchpad project date
              </span>
            </div>

            <div>
              <span
                children={formatDate(launchpadProject?.cliff_timestamp ?? "")}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
          <div className="mb-[8px]">
            <div>
              <span className="text-[14px] font-[600] tracking-[-0.04em]">
                Vesting cliff end date
              </span>
            </div>

            <div>
              <span
                children={formatDate(
                  launchpadProject?.end_cliff_timestamp ?? ""
                )}
                className="text-[16px] font-[800] tracking-[-0.04em]"
              />
            </div>
          </div>
        </div>
      </div>,
      "",
    ];
  }, [launchpadProject, metadataPriceToken, metadataProjectToken]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div>
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li
            key={"project-step-item-" + stepIdx}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pb-10" : "",
              "relative"
            )}
          >
            {stepIdx !== steps.length - 1 ? (
              <div className="absolute top-[0] left-[5px] -ml-px mt-0 h-full w-[2px] bg-[rgba(252,252,252,0.2)]" />
            ) : null}

            <div className="group relative flex items-start">
              <div className="flex items-start">
                <div className="relative z-10 flex h-[10px] w-[10px] items-center justify-center rounded-full border-2 border-gray-300 bg-white" />
              </div>

              {step}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
