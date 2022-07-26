import { useState } from "react";
import isEmpty from "lodash/isEmpty";
import { useNearQuery } from "react-near";
import { getNear } from "@jump/src/hooks/near";
import { useNftStaking } from "@jump/src/stores/nft-staking-store";
import { CheckIcon, ArrowRightIcon } from "@jump/src/assets/svg";
import { ModalImageDialog, Button, If } from "@jump/src/components";
import { Flex, Text, Grid, Image, Spinner } from "@chakra-ui/react";

export function StakeModal({
  isOpen = false,
  onClose = () => {},
  collection,
}: {
  isOpen: boolean;
  collection: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState("");

  const { user } = getNear(import.meta.env.VITE_STAKING_CONTRACT);

  const { stake } = useNftStaking();

  const stakeNFT = async () => {
    if (!selected) {
      return;
    }

    stake(collection, selected);
  };

  const { data, loading } = useNearQuery("nft_tokens_for_owner", {
    contract: collection,
    variables: {
      account_id: user.address || "",
    },
    skip: !user.isConnected,
  });

  return (
    <ModalImageDialog
      image="https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
      isOpen={isOpen}
      title="Stake NFT"
      minH="max-content"
      minW="800px"
      onClose={() => {
        setSelected("");
        onClose();
      }}
      footer={
        !loading &&
        !isEmpty(data) && (
          <Button onClick={() => stakeNFT()} bg="white" color="black" w="100%">
            Stake Now!
            <ArrowRightIcon />
          </Button>
        )
      }
      shouldBlurBackdrop
    >
      <Flex marginBottom="75px" w="100%" direction="column">
        <Text marginTop="-12px" marginBottom="12px">
          please select your nft from the wallet
        </Text>

        {loading ? (
          <Flex height="370px" alignItems="center" justifyContent="center">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <If
            condition={!isEmpty(data)}
            fallback={
              <Flex pt="64px" marginTop="auto">
                <Text fontSize="18px">
                  You don't have tokens available to stake
                </Text>
              </Flex>
            }
          >
            <Grid
              templateColumns="repeat(1, 1fr)"
              rowGap="12px"
              maxHeight="370px"
              overflow="auto"
            >
              {data.map(({ metadata, token_id }, i) => (
                <Flex
                  key={"nft-stake-token" + i}
                  borderRadius="20px"
                  cursor="pointer"
                  width="100%"
                  height="auto"
                  padding="3px"
                  position="relative"
                  onClick={() =>
                    setSelected(selected === token_id ? "" : token_id)
                  }
                  background={selected === token_id ? "#761BA0" : "transparent"}
                >
                  <Image
                    width="100%"
                    height="100%"
                    borderRadius="20px"
                    className="aspect-square"
                    src={metadata.media}
                  />

                  {selected === token_id && (
                    <Flex
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      borderRadius="20px"
                      alignItems="center"
                      position="absolute"
                      justifyContent="center"
                      backdropFilter="blur(3px)"
                      background="rgba(0, 0, 0, .1)"
                    >
                      <CheckIcon color="#761BA0" height="48px" width="48px" />
                    </Flex>
                  )}
                </Flex>
              ))}
            </Grid>
          </If>
        )}
      </Flex>
    </ModalImageDialog>
  );
}
