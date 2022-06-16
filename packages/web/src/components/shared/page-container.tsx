import { Flex, FlexProps } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

export const PageContainer = (props: PropsWithChildren<FlexProps>) => {
  return (
    <Flex
      gap="30px"
      direction="column"
      p="30px"
      w="100%"
      pt="150px"
      {...props}
    />
  );
};
