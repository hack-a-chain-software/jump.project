import Big from "big.js";
import { StakingToken } from "@near/ts";
import Skeleton from "react-loading-skeleton";
import { HTMLAttributes } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";

type NFTStakingCardProps = HTMLAttributes<HTMLButtonElement> & {
  name?: string;
  logo?: string;
  link?: string;
  rewards?: StakingToken[];
};

export function NFTStakingCard(props: NFTStakingCardProps) {
  const formattedBalance = (balance, decimals) => {
    const decimalsBig = new Big(10).pow(decimals ?? 0);
    const balanceBig = new Big(balance ?? 0);

    return balanceBig.div(decimalsBig).toFixed(2);
  };

  const renderRewards = ({ name, icon, decimals, perMonth }, index) => {
    return (
      <div
        key={index}
        className="rounded-lg bg-white-600 p-4 min-w-[192px] space-y-3"
      >
        <div className="flex gap-2 items-center justify-start">
          <img src={icon} alt={name} className="rounded-full w-6 h-6" />
          <h3 className="font-extrabold text-5 leading-5">
            {formattedBalance(perMonth, decimals)}
          </h3>
        </div>
        <p className="text-3.5 leading-3.5 tracking-tight text-left">
          <strong className="uppercase">{name}</strong> per month
        </p>
      </div>
    );
  };

  return (
    <button
      onClick={props.onClick}
      type="button"
      className={twMerge(
        "relative bg-white-600 cursor-default rounded-lg flex px-8 pt-9 pb-8 w-full gap-10",
        props.onClick ? "cursor-pointer hover:bg-white-550" : ""
      )}
    >
      {props.logo ? (
        <img
          src={props.logo}
          alt={props.name}
          className="h-[135px] w-[135px] rounded-full"
        />
      ) : (
        <Skeleton circle height="135px" width="135px" />
      )}
      <div className="space-y-8">
        <h2 className="font-extrabold text-6 leading-6 text-left tracking-tighter flex items-center">
          {props.name || <Skeleton width="230px" />}
          {props.link && (
            <a
              href={props.link}
              className="rounded-sm border-white-500 border-[1px] flex items-center font-normal gap-x-2 text-3.5 tracking leading-3.5 ml-6 mt-[-4px] py-2 px-4 hover:border-transparent hover:font-semibold hover:bg-white-300 hover:text-purple"
            >
              Website <ArrowTopRightOnSquareIcon className="h-3" />
            </a>
          )}
        </h2>
        <div className="flex gap-8">
          {props.rewards?.map(renderRewards) ||
            [0, 1, 2].map((i) => (
              <Skeleton key={i} width="192px" height="82px" />
            ))}
        </div>
      </div>
    </button>
  );
}
