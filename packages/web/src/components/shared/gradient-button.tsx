import { Box, ButtonProps, useColorModeValue } from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";
import { Button } from "./button";

type Props = ButtonProps;

export function GradientButton(props: Props) {
  const { jumpGradient } = useTheme();
  return (
    <Box p="2px" bg={jumpGradient} borderRadius={18}>
      <Button
        w="100%"
        color={useColorModeValue("black", "white")}
        bg={useColorModeValue("rgba(255,255,255,0.95)", "rgba(0,0,0,0.8)")}
        _hover={{
          bg: useColorModeValue("rgba(255,255,255,0.95)", "rgba(0,0,0,0.8)"),
        }}
        _active={{
          bg: useColorModeValue("rgba(255,255,255,0.95)", "rgba(0,0,0,0.8)"),
        }}
        {...props}
      />
    </Box>
  );
}
