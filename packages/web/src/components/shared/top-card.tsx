import { Box, Flex, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { JumpBigWhite } from "../../assets/svg";
import { useTheme } from "../../hooks/theme";
import { IconButton } from "@/components";

type Props = {
  gradientText: string;
  bigText: string;
  bottomDescription: string;
  renderAsset?: JSX.Element;
  content?: JSX.Element;
  jumpLogo?: boolean;
  py?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
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
  onClick = () => {},
}: Props) => {
  const { jumpGradient, glassyWhite } = useTheme();
  return (
    <Box
      flex={1}
      minHeight="260px"
      borderRadius={25}
      bg={useColorModeValue(jumpGradient, "transparent")}
      className="launchpad"
    >
      <Box
        overflow="hidden"
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        color="white"
        flex="1"
        p="25px 24px"
        // h="100%"
        borderRadius="24px"
        position="relative"
        bg={glassyWhite}
        gap={5}
      >
        <div className="absolute right-[12px] top-[12px]">
          <IconButton onClick={onClick} />
        </div>

        <Flex direction="column" zIndex="2" position="relative" flexGrow="1">
          <Flex alignItems="center" gap={4} direction="row">
            <Flex direction="column">
              <Text
                fontSize={16}
                mb="12px"
                fontWeight="800"
                letterSpacing="-0.03em"
              >
                {gradientText}
              </Text>
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="0"
                fontSize="28px"
                as="h1"
              >
                {bigText}
              </Text>
            </Flex>
          </Flex>
          <Text
            fontWeight="bold"
            letterSpacing="-0.03em"
            fontSize="14px"
            maxW="824px"
            zIndex="2"
            marginTop="12px"
            position="relative"
          >
            {bottomDescription}
          </Text>
          {children}
        </Flex>

        {content && (
          <Flex
            flex="1"
            zIndex="2"
            position="relative"
            className="space-x-[1.25rem]"
          >
            {content}
          </Flex>
        )}

        <Flex
          position="absolute"
          zIndex="1"
          right="0"
          bottom="0"
          maxH="100%"
          overflow="hidden"
          // opacity={0.1}
        >
          {jumpLogo && <JumpBigWhite />}
        </Flex>
      </Box>
    </Box>
  );
};
