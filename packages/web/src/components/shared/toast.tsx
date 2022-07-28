import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { useTheme } from "@jump/src/hooks/theme";

export function Toast({ type, children }) {
  const { jumpGradient, darkPurple } = useTheme();

  return (
    <Box
      p="18px 36px"
      display="flex"
      borderRadius="12px"
      border="solid 1px"
      borderColor={useColorModeValue("rgba(0,0,0,0.3)", "#761BA0")}
      background={useColorModeValue("white", darkPurple)}
    >
      <Text
        fontSize="16px"
        fontWeight="bold"
        color={useColorModeValue("black", "white")}
      >
        {children}
      </Text>
    </Box>
  );
}
