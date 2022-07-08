import { Box, Flex, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";

type Props = {
  gradientText: string;
  bigText: string;
  bottomDescription: string;
  renderAsset?: JSX.Element;
};

const collectionsImages = [
  "https://paras-cdn.imgix.net/bafkreie4ohxbaz4ocr6eddrfmfivfb3d67uymefuy4ubuh2qijodtrpgee?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafybeigc6z74rtwmigcoo5eqcsc4gxwkganqs4uq5nuz4dwlhjhrurofeq?w=300&auto=format,compress",
  "https://paras-cdn.imgix.net/bafkreihbv5liue6o7ag36fcu2xlsxtocaoioigqnj7uuycnw3d2vb6hjme?w=300&auto=format,compress",
  "https://d1fdloi71mui9q.cloudfront.net/7gfrOO2CQ7OSk7s9Bpiv_roo-king.png",
];

export const TopCard = ({
  gradientText,
  bigText,
  bottomDescription,
  renderAsset,
}: Props) => {
  const { gradientBoxTopCard, jumpGradient } = useTheme();
  return (
    <Box p="3px" background={jumpGradient} borderRadius="26px">
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        p="60px"
        borderRadius="24px"
        bg={gradientBoxTopCard}
      >
        <Flex direction="column">
          <Flex alignItems="center" gap={4} direction="row">
            <Flex direction="column">
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="28px"
                mb="-20px"
                as="h1"
              >
                {gradientText}
              </Text>
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="50px"
                as="h1"
              >
                {bigText}
              </Text>
            </Flex>

            {renderAsset && (
              <Flex ml="30px" direction="row">
                {renderAsset}
              </Flex>
            )}
          </Flex>
          <Text
            fontWeight="bold"
            letterSpacing="-0.03em"
            fontSize="16px"
            w="500px"
          >
            {bottomDescription}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};
