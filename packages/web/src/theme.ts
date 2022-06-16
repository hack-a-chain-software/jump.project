import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  colors: {
    brand: {
      500: "#7646FF", // you need this
      900: "#7646FF",
    },
    darkerGrey: "#1E1E1E",
  },
  config,
});
