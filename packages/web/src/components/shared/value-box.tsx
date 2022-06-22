import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { If } from "./if";

type Props = {
  variant?: "regular" | "brand";
  title: string;
  value: string;
  bottomText?: string;
  darkModeInteraction?: boolean;
};

export function ValueBox({
  title,
  value,
  variant = "regular",
  bottomText,
  darkModeInteraction,
}: Props) {
  return (
    <Box
      p="20px"
      borderRadius={20}
      borderWidth="1px"
      gap="5px"
      borderColor={
        variant === "brand"
          ? "brand.900"
          : !darkModeInteraction
          ? "white"
          : useColorModeValue("white", "black")
      }
      display="flex"
      flexDirection="column"
      w="100%"
    >
      <Text
        color={!darkModeInteraction ? "white" : undefined}
        fontSize="14px"
        fontWeight="bold"
      >
        {title}
      </Text>
      <Text
        fontSize="28px"
        color={
          variant === "brand"
            ? "brand.900"
            : !darkModeInteraction
            ? "white"
            : useColorModeValue("white", "black")
        }
        fontWeight="bold"
      >
        {value}
      </Text>
      <If condition={!!bottomText}>
        <Text color={!darkModeInteraction ? "white" : undefined}>
          {bottomText}
        </Text>
      </If>
    </Box>
  );
}
