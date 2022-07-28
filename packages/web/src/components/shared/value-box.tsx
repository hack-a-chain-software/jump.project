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
      border="2px solid"
      borderColor={useColorModeValue(
        "rgba(0,0,0,0.3)",
        "rgba(255,255,255,0.3)"
      )}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minW="200px"
      maxHeight="128px"
      {...boxProps}
    >
      <Text fontSize="14px" letterSpacing="-0.03em" fontWeight="bold">
        {title}
      </Text>
      <Text mt="auto" lineHeight="28px" fontSize="28px" fontWeight="bold">
        {value}
      </Text>
      <If condition={!!bottomText}>
        <Text fontWeight="bold" fontSize="14px" letterSpacing="-0.03em">
          {bottomText}
        </Text>
      </If>
    </Box>
  );
}
