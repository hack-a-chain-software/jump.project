import { Box, Flex, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { JumpBigWhite } from "../../assets/svg";
import { useTheme } from "../../hooks/theme";

type Props = {
  gradientText: string;
  bigText: string;
  bottomDescription: string;
  renderAsset?: JSX.Element;
  content?: JSX.Element;
  jumpLogo?: boolean;
  py?: boolean;
  children?: React.ReactNode;
};

export const TopCard = ({
  gradientText,
  bigText,
  bottomDescription,
  renderAsset,
  jumpLogo = false,
  py = false,
  content = <></>,
  children,
}: Props) => {
  const { jumpGradient, glassyWhite } = useTheme();
  return (
    <Box
      flex={1}
      minHeight="260px"
      borderRadius={25}
      bg={useColorModeValue(jumpGradient, "transparent")}
    >
      <Box
        overflow="hidden"
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        pt={py ? "60px" : undefined}
        color="white"
        flex="1"
        px="60px"
        h="100%"
        borderRadius="24px"
        position="relative"
        bg={glassyWhite}
      >
        <Flex direction="column" flexGrow="1" pb={py ? "60px" : undefined}>
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
          {children}
        </Flex>

        {content && (
          <Flex
            flex="1"
            pb={py ? "60px" : undefined}
            className="space-x-[1.25rem]"
          >
            {content}
          </Flex>
        )}

        <Flex position="absolute" right="-60px" bottom="-60px">
          {jumpLogo && <JumpBigWhite />}
        </Flex>
      </Box>
    </Box>
  );
};
