import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";

type Props = {
  gradientText: string;
  bigText: string;
  bottomDescription: string;
};

export const TopCard = ({
  gradientText,
  bigText,
  bottomDescription,
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
          <Text
            color="white"
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="28px"
            mb="-20px"
            as="h1"
            background={jumpGradient}
            style={
              {
                "-webkit-background-clip": "text",
                "-webkit-text-fill-color": "transparent",
                "text-fill-color": "transparent",
              } as any
            }
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
