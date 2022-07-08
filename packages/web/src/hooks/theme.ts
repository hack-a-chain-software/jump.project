import { useColorModeValue } from "@chakra-ui/react";

export const useTheme = () => {
  return {
    gradientBackground: useColorModeValue(
      "radial-gradient(41.57% 98.54% at 58.43% 41.55%, #FFFFFF 0%, #FEEFFF 100%)",
      "radial-gradient(40.33% 70.37% at 60.65% 14.31%, #340000 0%, #21002F 100%)"
    ),
    gradientBoxTopCard: useColorModeValue(
      "linear-gradient(90deg, #761BA0 0%, #D63A2F 100%)",
      "radial-gradient(#340000 0%, #21002F 100%)"
    ),
    jumpGradient: "linear-gradient(90deg, #761BA0 0%, #D63A2F 100%)",
    darkRed: "#340000",
    darkPurple: "#21002F",
  };
};
