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
import { useMemo } from "react";
import { useTheme } from "@/hooks/theme";
import { NftStakingProjectsConnectionDocument } from "@near/apollo";

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

  const items = useMemo(() => {
    if (loading) {
      return [...Array(5)];
    }

    return data?.nft_staking_projects?.data;
  }, [loading]);

  return (
    <PageContainer>
      <TopCard
        gradientText="NFT"
        bigText="Staking"
        bottomDescription="Stake your NFT assets in order to get rewards from the collection owners and also from JUMP and Partners!"
        py
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
        fallback={!loading && <Empty text="No collections available" />}
        condition={!isEmpty(items)}
      >
        {items && (
          <Stack spacing="32px">
            {items.map((staking, index) => (
              <NFTStakingCard
                key={"nft-staking-collection" + index}
                onClick={() =>
                  navigate(
                    `/nft-staking/${window.btoa(staking?.collection_id)}`
                  )
                }
                _hover={{
                  opacity: useColorModeValue(0.9, 0.7),
                  background: useColorModeValue(
                    jumpGradient,
                    glassyWhiteOpaque
                  ),
                }}
                logo={staking?.collection_meta?.image}
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
