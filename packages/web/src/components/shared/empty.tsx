import { Flex, Text } from "@chakra-ui/react";
import { JumpIcon } from "@/assets/svg/jump-logo";

export function Empty({ text }: { text: string }) {
  return (
    <Flex
      height="400px"
      marginX="auto"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <JumpIcon />

      <Text
        marginTop="16px"
        fontWeight="800"
        fontSize={30}
        letterSpacing="-0.03em"
        mb={3}
      >
        {text}
      </Text>
    </Flex>
  );
}
