import { Flex, Button, Input, useNumberInput } from "@chakra-ui/react";

export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: string | number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      min,
      max,
      value,
      onChange: (_, valueNumber) => onChange(valueNumber),
    });

  const input = getInputProps();
  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();

  return (
    <Flex className="space-x-[4px]">
      <Button {...dec} bg="white" color="black">
        -
      </Button>

      <Input
        {...input}
        bg="white"
        color="black"
        placeholder="Tickets"
        variant="filled"
        _hover={{ bg: "white" }}
        _focus={{ bg: "white" }}
      />
      <Button {...inc} bg="white" color="black">
        +
      </Button>
    </Flex>
  );
}
