import { Image, Stack, useColorModeValue, Flex, Input } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import {
  If,
  TopCard,
  NFTStakingCard,
  PageContainer,
  Empty,
} from "../../components";
import isEmpty from "lodash/isEmpty";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/hooks/theme";
import { NftStakingProjectsConnectionDocument, StakedEnum } from "@near/apollo";
import { Steps } from "intro.js-react";
import {
  StatusEnum,
  VisibilityEnum,
  NftStakingProjectsConnectionQueryVariables,
} from "@near/apollo";
import { useWalletSelector } from "@/context/wallet-selector";

const PAGINATE_LIMIT = 30;

const collectionImages = [
  "https://paras-cdn.imgix.net/bafybeigc6z74rtwmigcoo5eqcsc4gxwkganqs4uq5nuz4dwlhjhrurofeq?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreie4ohxbaz4ocr6eddrfmfivfb3d67uymefuy4ubuh2qijodtrpgee?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreihbv5liue6o7ag36fcu2xlsxtocaoioigqnj7uuycnw3d2vb6hjme?w=300&auto=format,compress",
  "https://d1fdloi71mui9q.cloudfront.net/7gfrOO2CQ7OSk7s9Bpiv_roo-king.png",
];

export const NFTStaking = () => {
  const navigate = useNavigate();

  const [showSteps, setShowSteps] = useState(false);
  const [filterStaked, setStaked] = useState<StakedEnum | null>(null);
  // const [filterStatus, setStatus] = useState<StatusEnum | null>(null);
  const [filterSearch, setSearch] = useState<string | null>(null);
  // const [filterVisibility, setVisibility] = useState<VisibilityEnum | null>(
  //   null
  // );
  const [loadingItems, setLoadingItems] = useState(false);
  const { accountId } = useWalletSelector();

  const { jumpGradient, glassyWhiteOpaque, blackAndWhite } = useTheme();

  const cardOpacity = useColorModeValue(0.9, 0.7);
  const cardBg = useColorModeValue(jumpGradient, glassyWhiteOpaque);

  const queryVariables: NftStakingProjectsConnectionQueryVariables =
    useMemo(() => {
      return {
        limit: PAGINATE_LIMIT,
        accountId: accountId ?? "",
        showStaked: filterStaked,
        // visibility: filterVisibility,
        // status: filterStatus,
        search: filterSearch,
      };
    }, [/*filterStatus, filterVisibility,*/ filterSearch, filterStaked]);

  const {
    data: nftProjects,
    loading,
    refetch,
  } = useQuery(NftStakingProjectsConnectionDocument, {
    notifyOnNetworkStatusChange: true,
  });

  console.log(nftProjects?.nft_staking_projects.data);

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

  return (
    <PageContainer>
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

      <TopCard
        gradientText="Jump NFT"
        bigText="Staking"
        bottomDescription="Stake your NFT assets in order to get rewards from the collection owners and also from JUMP and Partners!"
        py
        onClick={() => setShowSteps(true)}
        renderAsset={
          <>
            {collectionImages.map((imagesrc, i) => (
              <Image
                ml="-30px"
                src={imagesrc}
                w="70px"
                h="70px"
                borderRadius={35}
                key={i}
              />
            ))}
          </>
        }
      />
      {/* <Flex justifyContent="space-between" flexWrap="wrap" gap={5}>
        <Flex gap="4" flexGrow="1" flexWrap="wrap"> */}
      {/* <Select
            value={filterStatus}
            placeholder="Status"
            onChange={(value: StatusEnum | null) => setStatus(value)}
            items={[
              { label: "Public", value: StatusEnum.Open },
              { label: "Private", value: StatusEnum.Closed },
            ] as const}
          />
          <Select
            placeholder="Visibility"
            value={filterVisibility}
            onChange={(value: VisibilityEnum | null) =>
              setVisibility(value as VisibilityEnum)
            }
            items={[
              { label: "Public", value: VisibilityEnum.Public },
              { label: "Private", value: VisibilityEnum.Private },
            ] as const}

          /> */}
      {/* <Select
          {/* <Select
            value={filterStaked}
            placeholder="Staked"
            onChange={(value: StakedEnum | null) =>
              setStaked(value as StakedEnum)
            }
            items={
              [
                { label: "Yes", value: StakedEnum.Yes },
                { label: "No", value: StakedEnum.No },
              ] as const
            }
          />
        </Flex> */}
      {/* </Flex> */}

      {/* <Flex className="md:max-w-[330px]" w="100%">
          <Input
            borderWidth="2px"
            h="60px"
            maxW="100%"
            w="100%"
            value={filterSearch ?? ""}
            fontSize={16}
            borderRadius={15}
            placeholder="Search by project name"
            _placeholder={{
              color: blackAndWhite,
            }}
            outline="none"
            px="20px"
            onInput={(event) =>
              setSearch((event.target as HTMLInputElement).value)
            }
          />
        </Flex> */}
      {/* </Flex> */}
      <If
        fallback={
          !loading ? (
            <Empty text="No collections available" />
          ) : (
            <NFTStakingCard />
          )
        }
        condition={!isEmpty(nftProjects)}
      >
        {nftProjects && (
          <Stack spacing="32px" className="projects-list">
            {nftProjects?.nft_staking_projects?.data?.map((staking, index) => (
              <NFTStakingCard
                className="projects-card"
                key={"nft-staking-collection" + index}
                onClick={() =>
                  navigate(
                    `/nft-staking/${window.btoa(staking?.collection_id)}`
                  )
                }
                _hover={{
                  opacity: cardOpacity,
                  background: cardBg,
                }}
                logo={staking?.collection_image}
                name={staking?.collection_meta?.name}
                rewards={staking?.rewards}
              />
            ))}
          </Stack>
        )}
      </If>
    </PageContainer>
  );
};

export default NFTStaking;
