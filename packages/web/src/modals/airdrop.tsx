import Big from "big.js";
import { useMemo } from "react";
import { ModalImageDialog, Button } from "@/components";
import { Flex, Text } from "@chakra-ui/react";
import { useWalletSelector } from "@/context/wallet-selector";
import { getTransaction, executeMultipleTransactions } from "@/tools";
import { Transaction } from "@near/ts";
import { useTokenMetadata } from "@/hooks/modules/token";
import { useQuery } from "@apollo/client";
import { NftStakingProjectsConnectionDocument } from "@near/apollo";

export function AirdropModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { selector, accountId } = useWalletSelector();

  const { data, loading } = useQuery(NftStakingProjectsConnectionDocument);

  const items = useMemo(() => {
    return data?.nft_staking_projects?.data?.map(
      ({ collection_id }) => collection_id
    );
  }, [loading]);

  const getJumpTokens = async () => {
    const wallet = await selector.wallet();

    const transactions: Transaction[] = [];

    const denomJ = new Big("10").pow(18!);
    const denomU = new Big("10").pow(6!);

    transactions.push(
      getTransaction(
        accountId!,
        "faucet_test4.testnet",
        "ft_faucet",
        {
          token: "faucet_test1.testnet",
          amount: new Big(20).mul(denomJ).toString(),
        },
        "0.25"
      )
    );

    transactions.push(
      getTransaction(
        accountId!,
        "faucet_test4.testnet",
        "ft_faucet",
        {
          token: "faucet_test2.testnet",
          amount: new Big(20).mul(denomU).toString(),
        },
        "0.25"
      )
    );

    executeMultipleTransactions(transactions, wallet);
  };

  const getNfts = async () => {
    const wallet = await selector.wallet();

    const transactions: Transaction[] = [];

    ["faucet_test3.testnet"].forEach((collection) =>
      transactions.push(
        getTransaction(
          accountId!,
          "faucet_test4.testnet",
          "nft_faucet",
          {
            collection,
          },
          "0.25"
        )
      )
    );

    executeMultipleTransactions(transactions, wallet);
  };

  return (
    <ModalImageDialog
      image="https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
      isOpen={isOpen}
      title="Airdrop Tokens"
      minH="max-content"
      minW="800px"
      onClose={() => onClose()}
      shouldBlurBackdrop
    >
      <Flex w="100%" direction="column">
        <Text color="white" marginTop="-12px" marginBottom="12px">
          Get Tokens to Jump Dex
        </Text>

        <div className="flex flex-col space-y-[12px] items-stretch w-[200px]">
          <Button onClick={() => getJumpTokens()} className="justify-start">
            Get JUMP Tokens
          </Button>

          <Button onClick={() => getNfts()} className="justify-start">
            Get NFT's to Stake
          </Button>
        </div>
      </Flex>
    </ModalImageDialog>
  );
}
