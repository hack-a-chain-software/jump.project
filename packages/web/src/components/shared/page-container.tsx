import { Flex, FlexProps, Spinner } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/ban-types
interface Props extends PropsWithChildren<FlexProps> {
  loading: boolean;
}

export const PageContainer = (props: Partial<Props>) => {
  return (
    <Flex
      direction="column"
      p="30px"
      w="100%"
      minH="100vh"
      pt="150px"
      {...props}
    >
      {props.loading ? (
        <Flex height="100%" alignItems="center" justifyContent="center">
          <Spinner size="xl" />
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
