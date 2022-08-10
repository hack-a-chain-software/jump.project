import { Flex, FlexProps } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

export const PageContainer = (props: PropsWithChildren<FlexProps>) => {
  return (
    <Flex
      direction="column"
      p="30px"
      w="100%"
      minH="100vh"
      pt="150px"
      {...props}
    >
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-[30px]"
      >
        {props.children}
      </motion.div>
    </Flex>
  );
};
