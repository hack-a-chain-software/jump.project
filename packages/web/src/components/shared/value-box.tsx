import { Box, BoxProps, Text, useColorModeValue } from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";
import { If } from "./if";

type Props = {
  title: string | JSX.Element;
  value: string | JSX.Element;
  bottomText?: string | JSX.Element | false;
};

export function ValueBox({
  title,
  value,
  bottomText,
  ...boxProps
}: Props & BoxProps) {
  return (
    <Box
      p="20px"
      borderRadius={20}
      borderWidth="1px"
      gap="5px"
      border="2px solid"
      borderColor={useColorModeValue(
        "rgba(0,0,0,0.3)",
        "rgba(255,255,255,0.3)"
      )}
      display="flex"
      flexDirection="column"
      minW="200px"
      {...boxProps}
    >
      <Text fontSize="14px" fontWeight="bold">
        {title}
      </Text>
      <Text mt="auto" fontSize="28px" fontWeight="bold">
        {value}
      </Text>
      <If condition={!!bottomText}>
        <Text>{bottomText}</Text>
      </If>
    </Box>
  );
}
