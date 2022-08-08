import { formatNumber } from "@near/ts";
import { useVestingStore } from "@/stores/vesting-store";
import { ModalImageDialog, Button } from "@/components";
import { Flex, Text } from "@chakra-ui/react";
import { useWalletSelector } from "@/context/wallet-selector";

export function BuyFastPass({
  token,
  passCost,
  vestingId,
  totalAmount,
  acceleration,
  isOpen = false,
  onClose = () => {},
}: {
  token: any;
  isOpen: boolean;
  acceleration: number;
  vestingId: string;
  totalAmount: number;
  passCost: number;
  onClose: () => void;
}) {
  const { accountId, selector } = useWalletSelector();

  const { fastPass } = useVestingStore();

  return (
    <ModalImageDialog
      image="https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
      isOpen={isOpen}
      title="Fast Pass"
      minH="max-content"
      minW="800px"
      onClose={() => {
        onClose();
      }}
      footer={
        <Button
          onClick={() =>
            fastPass(
              vestingId,
              totalAmount,
              passCost,
              accountId as string,
              selector
            )
          }
          bg="white"
          color="black"
          w="100%"
        >
          Buy Fast Pass!
        </Button>
      }
      shouldBlurBackdrop
    >
      <Flex marginBottom="75px" w="100%" direction="column">
        <Text>
          With the fast pass, your vesting period is reduced and you get your
          locked tokens faster
        </Text>

        <Text fontWeight="semibold" fontSize="16px" marginTop="12px">
          Time decrease: {(-100 / acceleration + 100).toFixed(0)}%
        </Text>

        <Text fontWeight="semibold" fontSize="16px">
          Price: {formatNumber(totalAmount * 0.05, token?.decimals)}{" "}
          {token?.symbol}
        </Text>
      </Flex>
    </ModalImageDialog>
  );
}
