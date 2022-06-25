import {
  Flex,
  Select as ChakraSelect,
  SelectProps,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTheme } from "../../hooks/theme";

export const Select = (props: SelectProps) => {
  const { jumpGradient, gradientBackground } = useTheme();
  return (
    <Flex p="2px" bg={jumpGradient} borderRadius="17px">
      <Flex
        cursor="pointer"
        bg={useColorModeValue(gradientBackground, "#21002F")}
        p="12px"
        pl="12px"
        pr="12px"
        h="60px"
        borderRadius="15px"
      >
        <ChakraSelect
          pr="10px"
          color={useColorModeValue("black", "white")}
          cursor="pointer"
          bg="transparent"
          focusBorderColor="transparent"
          borderWidth={0}
          _hover={{
            borderColor: useColorModeValue("white", "black"),
          }}
          {...props}
        />
      </Flex>
    </Flex>
  );
};
