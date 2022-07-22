import { Image, Stack, Flex, Spinner, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { If, TopCard, NFTStakingCard, PageContainer } from "../components";

import isEmpty from "lodash/isEmpty";

import { useQuery } from "@apollo/client";
import { NftStakingProjectsConnectionDocument } from "@near/apollo";

import { motion } from "framer-motion";

const rewards = ["JUMP", "ACOVA", "CGK"];

const collectionImages = [
  "https://paras-cdn.imgix.net/bafybeigc6z74rtwmigcoo5eqcsc4gxwkganqs4uq5nuz4dwlhjhrurofeq?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreie4ohxbaz4ocr6eddrfmfivfb3d67uymefuy4ubuh2qijodtrpgee?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreihbv5liue6o7ag36fcu2xlsxtocaoioigqnj7uuycnw3d2vb6hjme?w=300&auto=format,compress",
  "https://d1fdloi71mui9q.cloudfront.net/7gfrOO2CQ7OSk7s9Bpiv_roo-king.png",
];

export const NFTStaking = () => {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(
    NftStakingProjectsConnectionDocument
  );

  const items = data?.nft_staking_projects?.data;

  console.log(items, loading, error);

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

      <If condition={loading}>
        <Flex height="370px" alignItems="center" justifyContent="center">
          <Spinner size="xl" />
        </Flex>
      </If>

      <If condition={!loading && !isEmpty(items)}>
        {items &&
          items.map(
            (
              { collection_meta, collection_treasury, collection_id },
              index
            ) => (
              <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
              >
                <Stack key={"nft-staking-collection" + index}>
                  <NFTStakingCard
                    onClick={() =>
                      navigate(`/nft-staking/${btoa(collection_id)}`)
                    }
                    collectionLogo={collection_meta.image}
                    collectionName={collection_meta.name}
                    tokens={collection_treasury.map((item, index) => ({
                      name: rewards[index],
                      ammount: item,
                    }))}
                  />
                </Stack>
              </motion.div>
            )
          )}
      </If>

      <If condition={!loading && isEmpty(items)}>
        <Flex width="100%" justifyContent="center">
          <Text
            color="#EB5757"
            fontSize="20px"
            fontWeight="400"
            lineHeight="24px"
            marginLeft="16px"
          >
            Opps! No collectiona available
          </Text>
        </Flex>
      </If>
    </PageContainer>
  );
};
