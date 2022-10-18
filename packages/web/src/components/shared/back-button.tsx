import { Flex, FlexProps, Text } from "@chakra-ui/react";
import { ArrowRightIcon } from "../../assets/svg/arrow-right";

type Props = Partial<FlexProps>;

export const BackButton = (props: Props & { text?: string }) => {
  return (
    <Flex
      cursor="pointer"
      direction="row"
      gap="10px"
      alignItems="center"
      userSelect="none"
      {...props}
    >
      <ArrowRightIcon width="30px" className="rotate-180" />
      <Text fontWeight="bold" fontSize="20px">
        {props.text || "Go Back"}
      </Text>
    </Flex>
  );
};
