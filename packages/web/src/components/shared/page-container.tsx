import { Flex, FlexProps, CircularProgress } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { LoadingIndicator } from "./loading-indicator";

export const PageContainer = (
  props: PropsWithChildren<FlexProps> & { pageLoading?: boolean }
) => {
  return (
    <Flex
      direction="column"
      p="30px"
      w="100%"
      minH="100vh"
      pt="150px"
      {...props}
    >
      {props.pageLoading ? (
        <Flex height="100%" alignItems="center" justifyContent="center">
          <LoadingIndicator />
        </Flex>
      ) : (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-[30px]"
        >
          {props.children}
        </motion.div>
      )}
    </Flex>
  );
};
