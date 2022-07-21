import { Flex, Text, Grid, Image, Spinner } from "@chakra-ui/react";

import { useEffect, useState } from "react";

import { Button } from "@jump/src/components";

import { CheckIcon } from "@jump/src/assets/svg";
import { ArrowRightIcon } from "@jump/src/assets/svg/arrow-right";

import { getNear } from "@jump/src/hooks/near";
import { useNftStaking } from "@jump/src/stores/nft-staking";
import { useCollection } from "@jump/src/stores/collection";
import { ModalImageDialog } from "@jump/src/components";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function StakeModal({ isOpen = false, onClose = () => {} }: Props) {
  const { user, wallet } = getNear(import.meta.env.VITE_STAKING_CONTRACT);

  const { stake } = useNftStaking();

  const { contract, tokens, loading, fetchTokens } = useCollection();

  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (user.isConnected && wallet && isOpen) {
      fetchTokens(wallet, "negentra_base_nft.testnet");
    }
  }, [user.isConnected, wallet, isOpen]);

  const stakeNFT = async () => {
    if (!selected) {
      return;
    }

    stake(wallet, contract, selected);
  };

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
        <Button onClick={() => stakeNFT()} bg="white" color="black" w="100%">
          Stake Now!
          <ArrowRightIcon />
        </Button>
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
          <Grid
            templateColumns="repeat(1, 1fr)"
            rowGap="12px"
            maxHeight="370px"
            overflow="auto"
          >
            {tokens.map(({ metadata, token_id }, i) => (
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
        )}
      </Flex>
    </ModalImageDialog>
  );
}
