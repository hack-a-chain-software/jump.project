import BN from "bn.js";
import { Flex, Input, Text } from "@chakra-ui/react";
import { X_JUMP_TOKEN } from "@/env/contract";
import { useNearContractsAndWallet } from "@/context/near";
import { useFormik } from "formik";
import { useNearQuery } from "react-near";
import { WalletIcon } from "../../assets/svg";
import { ModalImageDialog, DialogParams, Button } from "../../components";
import { initialValues, validationSchema } from "./form/formStaking";

interface IWithdrawModalProps
  extends Omit<DialogParams, "children" | "title" | "footer"> {
  _onSubmit: (values: typeof initialValues) => void | Promise<void>;
}

export const WithdrawModal = ({ _onSubmit, ...rest }: IWithdrawModalProps) => {
  const { wallet, isFullyConnected } = useNearContractsAndWallet();

  const { data: balance = "0" } = useNearQuery<string, { account_id: string }>(
    "ft_balance_of",
    {
      contract: X_JUMP_TOKEN,
      variables: {
        account_id: wallet?.getAccountId(),
      },
      poolInterval: 1000 * 60,
      skip: !isFullyConnected,
      debug: true,
    }
  );

  const { data: jumpMetadata, loading } = useNearQuery<
    {
      decimals: number;
    },
    { account_id: string }
  >("ft_metadata", {
    contract: X_JUMP_TOKEN,
    poolInterval: 1000 * 60,
    debug: true,
  });

  const { values, setFieldValue, handleSubmit, isSubmitting } = useFormik({
    onSubmit: async (values) => {
      try {
        await _onSubmit(values);
      } catch (error) {
        console.log(error);
      } finally {
        rest.onClose();
      }
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
          isLoading={isSubmitting}
          disabled={isSubmitting}
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
          Balance:{" "}
          {new BN(balance || 0)
            .mul(new BN(10 ** -(jumpMetadata?.decimals || 0)))
            .toString()}{" "}
          xJUMP
        </Text>
      </Flex>
    </ModalImageDialog>
  );
};
