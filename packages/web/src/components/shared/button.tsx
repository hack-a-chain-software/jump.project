import React from "react";
import {
  Button as ChakraButton,
  ButtonProps,
  useColorModeValue,
} from "@chakra-ui/react";

interface IButtonProps extends ButtonProps {}

/**
 * @description - Chakra custom button component
 */
export function Button({
  bg = "white",
  color = "black",
  ...props
}: IButtonProps) {
  return (
    <ChakraButton
      bg={bg}
      color={color}
      borderRadius="15px"
      px="20px"
      py="30px"
      gap="12px"
      fontSize="16px"
      fontFamily="Inter"
      alignItems="center"
      fontWeight="semibold"
      _active={{
        opacity: 0.4,
      }}
      _hover={{
        opacity: 0.4,
      }}
      {...props}
    />
  );
}
