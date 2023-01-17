import { StakingToken } from "@near/ts";
import Skeleton from "react-loading-skeleton";
import { HTMLAttributes } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";
import Reward from "@/components/Reward";
import Image from "@/components/Image";
import { useCollectionStakedNfts } from "@/hooks/modules/launchpad";
import { useState, useEffect } from "react";
import { useWalletSelector } from "@/context/wallet-selector";
import { viewMethod } from "@/helper/near";

type NFTStakingCardProps = HTMLAttributes<HTMLButtonElement> & {
  name?: string | undefined;
  logo?: string | undefined;
  link?: string | undefined;
  rewards?: StakingToken[];
  logoless?: boolean;
  wallet?: string;
  collection?: string | undefined;
};

export function NFTStakingCard(props: NFTStakingCardProps) {
  const { accountId, selector } = useWalletSelector();
  const [nftQuantity, setNftQuantity] = useState<any>(1);
  console.log("Collection ID", props.collection);
  useEffect(() => {
    if (!props.collection) return;
    viewMethod(
      import.meta.env.VITE_NFT_STAKING_CONTRACT,
      "view_total_staked_amount_for_collection",
      {
        collection: {
          type: "NFTContract",
          account_id: props.collection,
        },
      }
    ).then((res) => {
      if (res == 0) setNftQuantity(1);
      else setNftQuantity(res);
    });
  }, [props.collection]);

  /*  useEffect(() => {
    (async () => {
      if (props.collection) {
        const quantity = await useCollectionStakedNfts(
          selector,
          props.collection!
        );

        setNftQuantity(quantity);
      }
    })();
  }, []); */

  const renderLink = () => {
    if (props.link)
      return (
        <a
          href={props.link}
          className="rounded-sm border-white-500 border-[1px] flex items-center font-normal gap-x-2 text-3.5 tracking leading-3.5 ml-6 mt-[-4px] py-2 px-4 hover:border-transparent hover:font-semibold hover:bg-white-300 hover:text-purple"
        >
          Website <ArrowTopRightOnSquareIcon className="h-3" />
        </a>
      );
  };

  const renderLogo = () => {
    if (props.logo)
      return (
        <Image
          src={props.logo}
          alt={props.name}
          className="h-[135px] w-[135px] rounded-full"
        />
      );
    else if (!props.logoless)
      return <Skeleton circle height="135px" width="135px" />;
  };

  const renderTitle = () => {
    if (props.logoless)
      return (
        <h3 className="text-left font-extrabold text-4 tracking-tight leading-4">
          {props.name}
        </h3>
      );
    else if (props.name)
      return (
        <h2 className="font-extrabold text-6 leading-6 text-left tracking-tighter flex items-center">
          {props.name}
          {renderLink()}
        </h2>
      );
    else
      return (
        <h2 className="text-6">
          <Skeleton width="230px" />
        </h2>
      );
  };

  const renderRewards = ({ name, icon, decimals, perMonth }, index) => {
    return (
      <Reward
        key={index}
        name={name}
        icon={icon}
        balance={perMonth}
        decimals={decimals}
        stakedQuantity={nftQuantity}
        badge={props.wallet}
        hideText={props.logoless}
      />
    );
  };

  return (
    <button
      onClick={props.onClick}
      type="button"
      className={twMerge(
        "relative bg-white-600 cursor-default rounded-lg flex w-full gap-10",
        props.onClick ? "cursor-pointer hover:bg-white-550" : "",
        props.logoless ? "px-6 pt-6 pb-8" : "px-8 pt-9 pb-8"
      )}
      tabIndex={props.onClick ? 0 : -1}
    >
      {renderLogo()}

      <div
        className={`${
          props.logoless ? "gap-y-7" : "gap-y-8"
        } flex flex-col items-start`}
      >
        {renderTitle()}
        <div className="flex gap-9">
          {props.rewards?.map(renderRewards) ||
            [0, 1, 2].map((i) => (
              <Skeleton key={i} width="192px" height="82px" />
            ))}
        </div>
      </div>
    </button>
  );
}
