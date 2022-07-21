import { Flex, Input, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import { WalletIcon } from "../../assets/svg";
import { ModalImageDialog, DialogParams, Button } from "../../components";
import { initialValues, validationSchema } from "./form/formStaking";

interface IWithdrawModalProps
  extends Omit<DialogParams, "children" | "title" | "footer"> {
  onSubmit: () => void;
}

export const WithdrawModal = ({ onSubmit, ...rest }: IWithdrawModalProps) => {
  const { values, setFieldValue, handleSubmit } = useFormik({
    onSubmit: () => {
      onSubmit();
    },
    initialValues: initialValues,
    validationSchema: validationSchema,
  });

  return (
    <ModalImageDialog
      {...rest}
      title="Withdraw Staked Jump"
      image="https://images.unsplash.com/photo-1593672715438-d88a70629abe?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80"
      footer={
        <Button
          justifyContent="space-between"
          bg="white"
          color="black"
          w="100%"
          onClick={() => handleSubmit()}
        >
          Withdraw <WalletIcon />
        </Button>
      }
    >
      <Flex
        flex={1}
        flexDirection="column"
        alignItems="start"
        justifyContent="center"
        h="100%"
      >
        <Text
          letterSpacing="-0.03em"
          fontWeight="semibold"
          fontSize={14}
          lineHeight={1.2}
          color="white"
          mb={30}
        >
          Stake some tokens into our Jump staking pool to earn launchpad
          allocations to invest in launchpad project
        </Text>
        <Text opacity={0.9} mb={1} fontSize={14} color="white">
          Staking Amount
        </Text>
        <Input
          bg="white"
          color="black"
          onChange={(e) => setFieldValue("value", e.target.value)}
          placeholder="Staking Deposit Value"
          type="number"
          variant="filled"
          value={values.value}
          _hover={{ bg: "white" }}
          _focus={{ bg: "white" }}
        />
        <Text opacity={0.8} mt={1} fontSize={14} color="white">
          Balance: 1000 Jump
        </Text>
      </Flex>
    </ModalImageDialog>
  );
};
