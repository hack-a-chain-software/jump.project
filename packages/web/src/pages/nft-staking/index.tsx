import { Tab } from "@headlessui/react";
import { useNavigate } from "react-router";
import { TopCard, NFTStakingCard, Empty, Button } from "@/components";
import isEmpty from "lodash/isEmpty";
import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import {
  NftStakingProjectsConnectionDocument,
  NftStakingProjectsConnectionQueryVariables,
  StakedEnum,
} from "@near/apollo";
import { useWalletSelector } from "@/context/wallet-selector";
import { twMerge } from "tailwind-merge";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import PageContainer from "@/components/PageContainer";

const PAGINATE_LIMIT = 30;

export const NFTStaking = () => {
  const navigate = useNavigate();

  const [filterStaked, setStaked] = useState<StakedEnum | null>(null);
  const [filterSearch, setSearch] = useState<string | null>(null);
  const { accountId } = useWalletSelector();

  const queryVariables: NftStakingProjectsConnectionQueryVariables =
    useMemo(() => {
      return {
        limit: PAGINATE_LIMIT,
        accountId: accountId ?? "",
        showStaked: filterStaked,
        search: filterSearch,
      };
    }, [filterSearch, filterStaked]);

  const {
    data: nftProjects,
    loading,
    refetch,
  } = useQuery(NftStakingProjectsConnectionDocument, {
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    (async () => {
      await refetch({
        ...queryVariables,
        offset: 0,
      });
    })();
  }, [queryVariables]);

  const stepItems = [
    {
      element: ".projects-list",
      title: "Staking Pools",
      intro: (
        <div>
          <span>
            In this page you can see a list of all the staking pools available
            to stake your NFT assets.
          </span>
        </div>
      ),
    },
    {
      element: ".projects-card",
      title: "Project Pool",
      intro: (
        <div>
          <span>
            The project card displays all the rewards you can get per month if
            you stake in.
          </span>
        </div>
      ),
    },
  ];

  const renderProjectCard = (staking, index) => {
    return (
      <NFTStakingCard
        key={"nft-staking-collection" + index}
        className="hover:opacity-80"
        onClick={() =>
          navigate(`/nft-staking/${window.btoa(staking?.collection_id)}`)
        }
        logo={staking?.collection_image}
        name={staking?.collection_meta?.name}
        rewards={staking?.rewards}
        collection={
          nftProjects?.nft_staking_projects?.data[index].collection_id
        }
      />
    );
  };

  const renderStakingPools = () => {
    return (
      <div className="ProjectList space-y-[24px]">
        {isEmpty(nftProjects) ? (
          !loading ? (
            <Empty text="No collections available" />
          ) : (
            <NFTStakingCard />
          )
        ) : (
          nftProjects?.nft_staking_projects?.data?.map(renderProjectCard)
        )}
      </div>
    );
  };

  const renderStakedPools = () => {
    return (
      <div className="ProjectList space-y-[24px]">
        {isEmpty(nftProjects) ? (
          !loading ? (
            <Empty text="No collections available" />
          ) : (
            <NFTStakingCard />
          )
        ) : (
          nftProjects?.nft_staking_projects?.data?.map(renderProjectCard)
        )}
      </div>
    );
  };

  const renderTab = ({ selected }, title) => {
    const style = selected
      ? "bg-white-500 font-bold"
      : "bg-transparent font-normal hover:bg-[#FFFFFF0D]";
    return (
      <Button
        className={twMerge(
          "font-bold leading-4 text-4 tracking-tight p-2.5 outline-none",
          style
        )}
      >
        {title}
      </Button>
    );
  };

  const renderSearchbar = () => {
    return (
      <div className="relative h-min">
        <input
          type="text"
          placeholder="Search project"
          className="placeholder:text-white-400 w-full lg:w-[354px] text-white bg-white-500 rounded-sm border-0 m-0 leading-[16px] text-3.5 py-3 pl-4 pr-12"
          name="search"
          onInput={(e) => setSearch(e.currentTarget.value)}
          id="search"
        />
        <button
          type={"submit"}
          className="absolute inset-0 left-auto px-4 flex justify-center items-center hover:stroke-white-300"
        >
          <MagnifyingGlassIcon className="fill-white-300 w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <PageContainer>
      <TopCard
        gradientText="NFT Staking"
        bigText="Jump NFT Staking"
        bottomDescription={`
          Welcome to Jump NFT Staking; the portal between NFT technology and decentralized finance on NEAR Protocol!
        `}
        jumpLogo
        stepItems={stepItems}
      />

      <Tab.Group
        onChange={(index) =>
          setStaked(index == 0 ? StakedEnum.No : StakedEnum.Yes)
        }
      >
        <div className="flex flex-wrap justify-between w-full gap-y-4">
          <Tab.List className="flex gap-10 w-full lg:w-auto">
            <Tab as="div" className="outline-none">
              {(props) => renderTab(props, "Staking pools")}
            </Tab>
            <Tab as="div" className="outline-none">
              {(props) => renderTab(props, "My staked pools")}
            </Tab>
          </Tab.List>
          {renderSearchbar()}
        </div>

        <Tab.Panels>
          <Tab.Panel>{renderStakingPools()}</Tab.Panel>
          <Tab.Panel>{renderStakedPools()}</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </PageContainer>
  );
};

export default NFTStaking;
