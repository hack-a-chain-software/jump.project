import { Box, BoxProps } from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";

export const GradientBox: React.FC<BoxProps> = ({ children, ...props }) => {
  const { jumpGradient, gradientBoxTopCard } = useTheme();
  return (
    <Box borderRadius="24px" bg={gradientBoxTopCard}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        p="70px"
        borderRadius="24px"
        bg="rgba(0,0,0,0.1)"
        {...props}
      >
        {children}
      </Box>
    </Box>
  );
};
