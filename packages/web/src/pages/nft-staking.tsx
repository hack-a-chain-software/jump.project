import { Flex, Grid, Image, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import {
  NFTStakingCard,
  PageContainer,
  TopCard,
  ValueBox,
} from "../components";

const collectionImages = [
  "https://paras-cdn.imgix.net/bafybeigc6z74rtwmigcoo5eqcsc4gxwkganqs4uq5nuz4dwlhjhrurofeq?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreie4ohxbaz4ocr6eddrfmfivfb3d67uymefuy4ubuh2qijodtrpgee?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreihbv5liue6o7ag36fcu2xlsxtocaoioigqnj7uuycnw3d2vb6hjme?w=300&auto=format,compress",
  "https://d1fdloi71mui9q.cloudfront.net/7gfrOO2CQ7OSk7s9Bpiv_roo-king.png",
];

export const NFTStaking = () => {
  const navigate = useNavigate();
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
      <Stack>
        <NFTStakingCard
          onClick={() => navigate(`/nft-staking/${1}`)}
          collectionLogo="https://d1fdloi71mui9q.cloudfront.net/7gfrOO2CQ7OSk7s9Bpiv_roo-king.png"
          collectionName="Classy Kangaroos"
          tokens={[
            {
              name: "JUMP",
              ammount: "10",
            },
            {
              name: "ACOVA",
              ammount: "20",
            },
            {
              name: "CGK",
              ammount: "10",
            },
          ]}
        />
      </Stack>
    </PageContainer>
  );
};
