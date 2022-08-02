import { useNftStaking } from "@/stores/nft-staking-store";
import { ArrowRightIcon } from "@/assets/svg";
import { ModalImageDialog, Button, If } from "@/components";
import { useNearContractsAndWallet } from "@/context/near";
import { Flex, Text, Grid, Image } from "@chakra-ui/react";
import { WalletConnection } from "near-api-js";
import { Token } from "@/stores/nft-staking-store";

export function NFTUnstakeModal({
  selected,
  isOpen = false,
  onClose = () => {},
  collection,
}: {
  isOpen: boolean;
  selected: Token[];
  collection: string;
  onClose: () => void;
}) {
  const { unstake } = useNftStaking();
  const { wallet } = useNearContractsAndWallet();

  return (
    <ModalImageDialog
      image="https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
      isOpen={isOpen}
      title="Unstake NFT"
      minH="max-content"
      minW="800px"
      onClose={() => onClose()}
      footer={
        <Button
          onClick={() =>
            unstake(
              wallet as WalletConnection,
              selected.map((item) => item.token_id),
              collection
            )
          }
          bg="white"
          color="black"
          w="100%"
        >
          Unstake
          <ArrowRightIcon />
        </Button>
      }
      shouldBlurBackdrop
    >
      <Flex marginBottom="75px" w="100%" direction="column">
        <Text marginTop="-12px" marginBottom="12px">
          Unstake all selected NFT's?
        </Text>

        <Grid
          templateColumns="repeat(1, 1fr)"
          rowGap="12px"
          maxHeight="370px"
          overflow="auto"
        >
          {selected &&
            selected.map(({ metadata }, i) => (
              <Flex
                key={"nft-stake-token" + i}
                borderRadius="20px"
                cursor="pointer"
                width="100%"
                height="auto"
                position="relative"
              >
                <Image
                  width="100%"
                  height="100%"
                  borderRadius="20px"
                  className="aspect-square"
                  src={metadata.media}
                />
              </Flex>
            ))}
        </Grid>
      </Flex>
    </ModalImageDialog>
  );
}
