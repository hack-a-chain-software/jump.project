import * as R from "ramda";
import { format } from "date-fns";
import { Button } from "@/components";
import { BuyFastPass } from "@/modals";
import { VestingCardProps } from "@/components/VestingCard/VestingCard.container";
import Badge from "@/components/Badge";
import { LoadingCircleIcon } from "@/assets/svg/loading-circle";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import GradientBorder from "@/components/GradientBorder";
import { WalletSelector } from "@near-wallet-selector/core";
import Big from "big.js";

type VestingCardComponentProps = {
  containerProps: VestingCardProps;
  accountId: string | null;
  createdAt: Date;
  endAt: Date;
  progress: number;
  selector: WalletSelector;
  withdraw: (
    vesting_ids: string[],
    accountId: string,
    selector: WalletSelector
  ) => Promise<void>;
  showFastPass: boolean;
  setShowFastPass: (showFastPassModal: boolean) => void;
  baseTokenBalance?: string;
  totalAmount: string; // Big
  availableToClaim: string; // Big
  withdrawnAmount: string; // Big
  fastPassPrice: string; // Big
  earnPerDay: string; // Big
};

function VestingCardComponent(props: VestingCardComponentProps) {
  const {
    containerProps,
    accountId,
    createdAt,
    endAt,
    progress,
    selector,
    withdraw,
    showFastPass,
    setShowFastPass,
    baseTokenBalance,
    totalAmount,
    availableToClaim,
    withdrawnAmount,
    fastPassPrice,
    earnPerDay,
  } = props;

  function renderBadge() {
    const { fast_pass: fastPass } = containerProps;

    return (
      <div className="flex gap-2 flex-wrap">
        {progress < 100 ? (
          <Badge className="relative inset-0 text-[#21002F] font-medium tracking-normal">
            Vesting Period
          </Badge>
        ) : (
          <></>
        )}
        {progress >= 100 ? (
          new Big(withdrawnAmount).lt(totalAmount) ? (
            <Badge className="relative inset-0 bg-[#3FB460] text-white font-medium tracking-normal">
              Finished
            </Badge>
          ) : (
            <Badge className="relative inset-0 bg-purple-100 text-white font-medium tracking-normal">
              Withdraw
            </Badge>
          )
        ) : (
          <></>
        )}
        {fastPass && progress < 100 ? (
          <Badge className="relative inset-0 bg-gradient-to-r from-[#AE00FF] to-[#FF1100] text-white font-medium tracking-normal">
            Fast Pass
          </Badge>
        ) : (
          <></>
        )}
      </div>
    );
  }

  function renderAmountStatus() {
    return (
      <div className="rounded-lg w-full bg-white-500 flex flex-col gap-4 px-4 pt-5 pb-6 shadow-[0_0_14px_0_rgba(159,159,159,.2)]">
        <h2 className="text-white-200 text-6 font-extrabold tracking-tight leading-5">
          {totalAmount} JUMP
        </h2>
        <p className="text-4 font-semibold tracking-tight">
          {progress >= 100 ? "Locked" : "Unlocked"} Amount
        </p>
      </div>
    );
  }

  function renderVestingPeriod() {
    return (
      <div className="flex flex-col gap-2" title={`${progress}%`}>
        <div className="flex justify-start items-center gap-3">
          <p className="text-3.5 font-semibold tracking-tight leading-6">
            Vesting Period
          </p>
          {progress < 100 ? (
            <LoadingCircleIcon className="animate-spin" />
          ) : (
            <CheckCircleIcon className="h-6 fill-[#3FB460]" />
          )}
        </div>
        <div className="h-[3px] bg-white-500 w-full rounded-full">
          <hr
            style={{ width: `${progress}%` }}
            className="border-none h-full rounded-full bg-gradient-to-r from-[#AE00FF] to-[#FF1100]"
          />
        </div>
      </div>
    );
  }

  function renderDetailLine(name, value) {
    return (
      <div className="flex justify-between text-3.5 font-medium tracking-tight leading-3.5">
        <p>{name}</p>
        <strong>{value}</strong>
      </div>
    );
  }

  function renderDetails() {
    return (
      <>
        {renderDetailLine("Starts", format(createdAt, "d/M/Y"))}
        {renderDetailLine("Ends", format(endAt, "d/M/Y"))}
        {renderDetailLine(
          "Earn per day",
          `${earnPerDay} ${containerProps.token?.symbol}/day`
        )}
        {new Big(availableToClaim).eq(0) || progress >= 100 ? (
          <></>
        ) : (
          renderDetailLine(
            "Total Unlocked",
            `${availableToClaim} ${containerProps.token?.symbol}`
          )
        )}
        {new Big(withdrawnAmount).eq(0) ? (
          <></>
        ) : (
          renderDetailLine(
            "Total Withdraw",
            `${withdrawnAmount} ${containerProps.token?.symbol}`
          )
        )}
        {new Big(availableToClaim).eq(0) || progress < 100 ? (
          <></>
        ) : (
          renderDetailLine(
            "Available to claim",
            `${availableToClaim} ${containerProps.token?.symbol}`
          )
        )}
      </>
    );
  }

  function renderButtons() {
    const { fast_pass: fastPass, id: vesting } = containerProps;

    return (
      <div className="flex flex-col gap-2">
        <Button
          className="px-3 text-3.5"
          full
          disabled={!vesting || !accountId}
          onClick={() =>
            vesting && accountId && withdraw([vesting], accountId, selector)
          }
        >
          {progress >= 100 && new Big(availableToClaim).eq(0)
            ? "Withdraw"
            : new Big(availableToClaim).eq(0)
            ? `Withdraw ${availableToClaim} ${containerProps.token?.symbol} unlocked`
            : "Withdraw unlocked"}
        </Button>
        <div className={`rounded-sm ${fastPass ? "bg-white" : ""}`}>
          <Button
            disabled={
              !fastPass || new Big(baseTokenBalance || "0").lt(fastPassPrice)
            }
            title={
              !fastPass || new Big(baseTokenBalance || "0").lt(fastPassPrice)
                ? `Fass Pass costs ${new Big(fastPassPrice).toFixed(3)}.`
                : undefined
            }
            full
            onClick={() => setShowFastPass(true)}
            className="text-3.5 bg-gradient-to-r from-[#AE00FF] to-[#FF1100] hover:opacity-70 disabled:mix-blend-hard-light"
          >
            Fast Pass NFT{fastPass ? " minted" : ""}
          </Button>
        </div>
      </div>
    );
  }

  function renderGradientBorder() {
    const { fast_pass: fastPass } = containerProps;

    if (fastPass)
      return (
        <GradientBorder colors={["#AE00FF", "#FF1100"]} direction="to-right" />
      );
    return <></>;
  }

  return (
    <div
      {...(R.omit(
        [
          "id",
          "beneficiary",
          "locked_value",
          "start_timestamp",
          "vesting_duration",
          "fast_pass",
          "withdrawn_tokens",
          "available_to_withdraw",
          "token",
          "contractData",
        ],
        props.containerProps
      ) as Record<string, string>)}
      className={`gap-11 relative rounded-lg bg-white-600 border-jump2 w-[315px] p-6 pt-4 flex flex-col justify-between ${containerProps.className}`}
    >
      {renderGradientBorder()}
      <div className="w-full flex flex-col gap-4">
        {renderBadge()}
        {renderAmountStatus()}
        {renderVestingPeriod()}
        {renderDetails()}
      </div>
      {renderButtons()}

      <BuyFastPass
        onClose={() => setShowFastPass(false)}
        isOpen={showFastPass}
        token={containerProps.token}
        vestingId={containerProps.id || ""}
        passCost={containerProps.contractData.fast_pass_cost}
        totalAmount={containerProps.locked_value}
        acceleration={Number(
          containerProps.contractData?.fast_pass_acceleration
        )}
      />
    </div>
  );
}

export default VestingCardComponent;
