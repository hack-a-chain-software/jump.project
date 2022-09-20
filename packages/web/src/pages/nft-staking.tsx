import { Image, Stack, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import {
  If,
  TopCard,
  NFTStakingCard,
  PageContainer,
  Empty,
} from "../components";
import isEmpty from "lodash/isEmpty";
import { useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { useTheme } from "@/hooks/theme";
import { NftStakingProjectsConnectionDocument } from "@near/apollo";
import { Steps } from "intro.js-react";

const collectionImages = [
  "https://paras-cdn.imgix.net/bafybeigc6z74rtwmigcoo5eqcsc4gxwkganqs4uq5nuz4dwlhjhrurofeq?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreie4ohxbaz4ocr6eddrfmfivfb3d67uymefuy4ubuh2qijodtrpgee?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreihbv5liue6o7ag36fcu2xlsxtocaoioigqnj7uuycnw3d2vb6hjme?w=300&auto=format,compress",
  "https://d1fdloi71mui9q.cloudfront.net/7gfrOO2CQ7OSk7s9Bpiv_roo-king.png",
];

export const NFTStaking = () => {
  const navigate = useNavigate();

  const { jumpGradient, glassyWhiteOpaque } = useTheme();

  const { data, loading } = useQuery(NftStakingProjectsConnectionDocument);

  const cardOpacity = useColorModeValue(0.9, 0.7);
  const cardBg = useColorModeValue(jumpGradient, glassyWhiteOpaque);

  const items = useMemo(() => {
    return data?.nft_staking_projects?.data;
  }, [loading]);

  console.log(items);

  const [showSteps, setShowSteps] = useState(false);

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

      <If
        fallback={
          !loading ? (
            <Empty text="No collections available" />
          ) : (
            <NFTStakingCard />
          )
        }
        condition={!isEmpty(items)}
      >
        {items && (
          <Stack spacing="32px" className="projects-list">
            {items.map((staking, index) => (
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
