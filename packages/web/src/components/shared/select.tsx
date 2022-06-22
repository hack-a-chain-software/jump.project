import { Flex, Select as ChakraSelect, SelectProps } from "@chakra-ui/react";

export const Select = (props: SelectProps) => {
  return (
    <Flex
      cursor="pointer"
      bg="brand.900"
      p="12px"
      pl="2px"
      pr="10px"
      h="60px"
      borderRadius="15px"
    >
      <ChakraSelect
        bg="brand.900"
        cursor="pointer"
        focusBorderColor="transparent"
        borderColor="brand.900"
        _hover={{
          borderColor: "brand.900",
        }}
        color="white"
        {...props}
      />
    </Flex>
  );
};
