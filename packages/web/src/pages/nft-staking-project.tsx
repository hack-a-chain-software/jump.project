/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/ban-types */
import { Flex, Grid, Text, Button } from "@chakra-ui/react";
import isEqual from "lodash/isEqual";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { WalletIcon } from "../assets/svg";
import { AnimatePresence, motion } from "framer-motion";
import {
  If,
  NFTStakingCard,
  PageContainer,
  TokenCard,
  BackButton,
  TokenAccordion,
  NFTStakingUserRewards,
  NFTStakingUserActions,
} from "@/components";
import { NFTUnstakeModal } from "@/modals";
import { useNftStaking } from "../stores/nft-staking-store";
import toast from "react-hot-toast";
import isEmpty from "lodash/isEmpty";
import { useQuery } from "@apollo/client";
import { StakingProjectDocument } from "@near/apollo";
import { Token } from "@near/ts";
import { useWalletSelector } from "@/context/wallet-selector";

export function NFTStakingProject() {
  const navigate = useNavigate();

  const { id = "" } = useParams();
  const collection = window.atob(id);

  const [focused, setFocused] = useState<Token | null>(null);
  const [showUnstake, setShowUnstake] = useState(false);

  const { fetchUserTokens, tokens, loading } = useNftStaking();

  const { accountId, selector } = useWalletSelector();

  const [selected, setSelected] = useState<Token[]>([]);

  const updateSelectedTokens = (token: Token) => {
    if (selected.findIndex((item) => isEqual(item, token)) !== -1) {
      setSelected([...selected.filter((item) => !isEqual(item, token))]);

      return;
    }

    setSelected([...selected, token]);
  };

  const toggleUnstakeModal = () => {
    if (!accountId) {
      return;
    }

    if (isEmpty(selected)) {
      toast("Ooops! Select tokens to Unstake");

      return;
    }

    setShowUnstake(!showUnstake);
  };

  useEffect(() => {
    (async () => {
      if (accountId) {
        await fetchUserTokens(selector, accountId, collection);
      }
    })();
  }, [accountId]);

  const { data: { staking } = {} } = useQuery(StakingProjectDocument, {
    variables: {
      collection,
    },
  });

  return (
    <PageContainer>
      <NFTUnstakeModal
        selected={selected}
        isOpen={showUnstake}
        collection={collection}
        onClose={() => toggleUnstakeModal()}
      />

      <BackButton onClick={() => navigate("/nft-staking")} />

      <NFTStakingCard
        logo={staking?.collection_meta.image}
        name={staking?.collection_meta.name}
        rewards={staking?.rewards}
      />

      <Flex flex={1} direction="row" flexWrap="wrap" gap={12}>
        <NFTStakingUserRewards rewards={staking?.rewards} />

        <NFTStakingUserActions />
      </Flex>

      <If condition={!isEmpty(tokens) && !loading}>
        <Flex
          paddingTop="66px"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={5}
        >
          <Flex>
            <Text fontSize="24px" fontWeight="700">
              Your Staked NFTS:
            </Text>
          </Flex>

          <Flex>
            <Button
              bg="white"
              borderRadius="15px"
              height="60px"
              w="307px"
              color="black"
              display="flex"
              alignItems="center"
              onClick={() => toggleUnstakeModal()}
            >
              <Text marginRight="16px">Unstake Selected NFTs!</Text>

              <WalletIcon />
            </Button>
          </Flex>
        </Flex>

        <AnimatePresence initial={false}>
          {focused && (
            <motion.section
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0, overflow: "hidden" },
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <TokenAccordion
                {...focused}
                rewards={staking?.rewards}
                token={staking.token_address}
                penalty={staking?.early_withdraw_penalty}
                minStakedPeriod={staking?.min_staking_period}
              />
            </motion.section>
          )}
        </AnimatePresence>

        <Flex paddingBottom="300px">
          <Grid
            columnGap="8px"
            rowGap="37px"
            width="100%"
            justifyContent="space-between"
            gridTemplateColumns="repeat(auto-fill, 309px)"
          >
            {tokens &&
              tokens.map((token, index) => (
                <Flex
                  key={"nft-staked-tokens-" + index}
                  onClick={() =>
                    setFocused(
                      isEqual(token, focused) ? null : (token as Token)
                    )
                  }
                  borderRadius="20px"
                  border={
                    isEqual(token, focused)
                      ? "solid 1px #761BA0"
                      : "solid 1px transparent"
                  }
                >
                  <TokenCard
                    {...(token as Token)}
                    select={() => updateSelectedTokens(token as Token)}
                    key={"nft-staking-collection-token" + index}
                    selected={
                      selected.findIndex((item) => isEqual(token, item)) !== -1
                    }
                  />
                </Flex>
              ))}
          </Grid>
        </Flex>
      </If>
    </PageContainer>
  );
}
