import { Box, Flex, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { JumpBigWhite } from "../../assets/svg";
import { useTheme } from "../../hooks/theme";

type Props = {
  gradientText: string;
  bigText: string;
  bottomDescription: string;
  renderAsset?: JSX.Element;
  jumpLogo?: boolean;
  py?: boolean;
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
  jumpLogo = false,
  py = false,
}: Props) => {
  const { jumpGradient, glassyWhite } = useTheme();
  return (
    <Box borderRadius={25} bg={useColorModeValue(jumpGradient, "transparent")}>
      <Box
        overflow="hidden"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        py={py ? "60px" : undefined}
        color="white"
        px="60px"
        borderRadius="24px"
        bg={glassyWhite}
      >
        <Flex direction="column">
          <Flex alignItems="center" gap={4} direction="row">
            <Flex direction="column">
              <Text
                fontSize={24}
                mb="-15px"
                fontWeight="800"
                letterSpacing="-0.03em"
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
        <Flex position="relative" right="-60px" bottom="-60px">
          {jumpLogo && <JumpBigWhite />}
        </Flex>
      </Box>
    </Box>
  );
};
