import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";

type ProgressBarProps = {
  valuePercentage: number;
};

export const ProgressBar = (props: ProgressBarProps) => {
  const { jumpGradient } = useTheme();
  const { valuePercentage: value } = props;
  const fillerRelativePercentage = (100 / value) * 100;

  return (
    <Box
      h="10px"
      borderRadius={100}
      w="100%"
      bg={useColorModeValue("rgba(0,0,0,0.4)", "rgba(255,255,255,0.2)")}
    >
      <Box h="10px" bg={jumpGradient} borderRadius="10px" w={`${value}%`}></Box>
    </Box>
  );
};
