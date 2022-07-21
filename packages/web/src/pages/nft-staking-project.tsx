/* eslint-disable @typescript-eslint/ban-types */
import { Box, Flex, Grid, Stack, Text, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { WalletIcon } from "../assets/svg";
import isEqual from "lodash/isEqual";

import { AnimatePresence, motion } from "framer-motion";

import {
  GradientButton,
  GradientText,
  NFTStakingCard,
  PageContainer,
  ValueBox,
  StakeModal,
  TokenCard,
  TokenAccordion,
} from "@jump/src/components";

import { BackButton } from "@jump/src/components/shared/back-button";

import { useTheme } from "../hooks/theme";

import { WalletConnection } from "near-api-js";
import { useNftStaking } from "../stores/nft-staking";
import { useNearWallet, useNearUser } from "react-near";

type Props = {};

const tokens = [
  {
    token_id: "1",
    metadata: {
      title: "Trash Panda #1000",
      media: "/mock.png",
      description: "Degenerate Trash Pandas",
    },
    jumpRewards: "100",
    acovaRewards: "10",
    trpRewards: "30",
  },
  {
    token_id: "2",
    metadata: {
      media: "/mock2.png",
      title: "Trash Panda #2000",
      description: "Degenerate Trash Pandas",
    },
    jumpRewards: "100",
    acovaRewards: "10",
    trpRewards: "30",
  },
  {
    token_id: "3",
    metadata: {
      title: "Trash Panda #3000",
      media: "/mock.png",
      description: "Degenerate Trash Pandas",
    },
    jumpRewards: "100",
    acovaRewards: "10",
    trpRewards: "30",
  },
  {
    token_id: "4",
    metadata: {
      media: "/mock2.png",
      title: "Trash Panda #1016",
      description: "Degenerate Trash Pandas",
    },
    jumpRewards: "100",
    acovaRewards: "10",
    trpRewards: "30",
  },
  {
    token_id: "5",
    metadata: {
      title: "Trash Panda #4000",
      media: "/mock.png",
      description: "Degenerate Trash Pandas",
    },
    jumpRewards: "100",
    acovaRewards: "10",
    trpRewards: "30",
  },
  {
    token_id: "6",
    metadata: {
      title: "Trash Panda #5000",
      media: "/mock2.png",
      description: "Degenerate Trash Pandas",
    },
    jumpRewards: "100",
    acovaRewards: "10",
    trpRewards: "30",
  },
];

export function NFTStakingProject(params: Props) {
  const navigate = useNavigate();
  const { jumpGradient, darkPurple } = useTheme();

  const [show, setShow] = useState(false);

  const wallet = useNearWallet();
  const user = useNearUser(import.meta.env.VITE_STAKING_CONTRACT);

  const { init, stake, unstake, unstakeAll, claimRewards } = useNftStaking();

  const [selected, setSelected] = useState([]);
  const [focused, setFocused] = useState<object | null>(null);

  useEffect(() => {
    if (user.isConnected) {
      init(wallet as WalletConnection);
    }
  }, [user.isConnected]);

  const select = (tokenId) => {
    if (selected.includes(tokenId)) {
      setSelected([...selected.filter((token) => token !== tokenId)]);

      return;
    }

    setSelected([...selected, tokenId]);
  };

  return (
    <PageContainer marginBottom="300px">
      <StakeModal
        isOpen={show}
        onClose={() => {
          setShow(!show);
        }}
      />

      <BackButton onClick={() => navigate("/nft-staking")} />
      <NFTStakingCard
        collectionLogo="https://d1fdloi71mui9q.cloudfront.net/7gfrOO2CQ7OSk7s9Bpiv_roo-king.png"
        collectionName="Classy Kangaroos"
        tokens={[
          {
            name: "JUMP",
            ammount: "10",
          },
          {
            name: "ACOVA",
            ammount: "20",
          },
          {
            name: "CGK",
            ammount: "10",
          },
        ]}
      />
      <Flex flex={1} direction="row">
        <Flex flex={1} direction="column">
          <Text fontWeight="800" fontSize={30} letterSpacing="-0.03em" mb={3}>
            Your Position:
          </Text>
          <Grid gap={3} gridTemplateColumns="1fr 1fr">
            <ValueBox
              title="Your JUMP Rewards"
              value="400 JUMP"
              bottomText="Your Total JUMP Rewards"
            />
            <ValueBox
              title="Your ACOVA Rewards"
              value="80 ACOVA"
              bottomText="Your Total ACOVA Rewards"
            />
          </Grid>
          <ValueBox
            mt={3}
            title="Your ACOVA Rewards"
            value="80 ACOVA"
            bottomText="Your Total ACOVA Rewards"
          />
        </Flex>
        <Flex flex={1}>
          <Box
            ml="20px"
            display="flex"
            p="3px"
            w="100%"
            background={jumpGradient}
            borderRadius="26px"
          >
            <Box
              display="flex"
              flexDirection="column"
              w="100%"
              h="100%"
              p="40px"
              borderRadius="24px"
              bg={darkPurple}
            >
              <GradientText mb="-5px" fontWeight="800" fontSize={16}>
                User Area
              </GradientText>
              <Text
                fontWeight="800"
                fontSize={30}
                letterSpacing="-0.03em"
                mb={3}
              >
                Interact with Your Position
              </Text>
              <Text mt="-10px" fontWeight="semibold">
                This is the area wher you can interact with the Staking as a
                Investor
              </Text>
              <Stack mt="50px" gap={1}>
                <GradientButton
                  onClick={() => setShow(!show)}
                  bg={darkPurple}
                  justifyContent="space-between"
                >
                  Stake NFT <WalletIcon />
                </GradientButton>
                {/* <GradientButton
                  onClick={() => unstake()}
                  bg={darkPurple}
                  justifyContent="space-between"
                >
                  Unstake NFT <WalletIcon />
                </GradientButton> */}
                <GradientButton
                  onClick={() => unstakeAll()}
                  bg={darkPurple}
                  justifyContent="space-between"
                >
                  Unstake All NFTs <WalletIcon />
                </GradientButton>
                <GradientButton
                  onClick={() => claimRewards()}
                  bg={darkPurple}
                  justifyContent="space-between"
                >
                  Claim Pool Rewards <WalletIcon />
                </GradientButton>
              </Stack>
            </Box>
          </Box>
        </Flex>
      </Flex>

      <Flex marginTop="42px" alignItems="center" justifyContent="space-between">
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
            onClick={() => {}}
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
              token={focused}
              select={select}
              selected={selected && selected.includes(focused?.token_id)}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <Flex>
        <Grid
          columnGap="8px"
          rowGap="37px"
          width="100%"
          justifyContent="space-between"
          gridTemplateColumns="repeat(auto-fill, 309px)"
        >
          {tokens.map((token, index) => (
            <Flex
              onClick={() => setFocused(isEqual(token, focused) ? null : token)}
              borderRadius="20px"
              border={
                isEqual(token, focused)
                  ? "solid 1px #761BA0"
                  : "solid 1px transparent"
              }
            >
              <TokenCard
                {...token}
                select={select}
                key={"nft-staking-collection-token" + index}
                selected={selected && selected.includes(token.token_id)}
              />
            </Flex>
          ))}
        </Grid>
      </Flex>
    </PageContainer>
  );
}
