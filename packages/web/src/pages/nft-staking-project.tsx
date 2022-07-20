/* eslint-disable @typescript-eslint/ban-types */
import { Box, Flex, Grid, Stack, Text, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { WalletIcon } from "../assets/svg";
import {
  GradientButton,
  GradientText,
  NFTStakingCard,
  PageContainer,
  TopCard,
  ValueBox,
} from "../components";
import { BackButton } from "../components/shared/back-button";
import { useTheme } from "../hooks/theme";

import { contractName } from "../env/contract";
import { WalletConnection } from "near-api-js";
import { useNftStaking } from "../stores/nft-staking";
import { useCollection } from "../stores/collection";
import { useNearWallet, useNearUser } from "react-near";

import { NFTStakeModal } from "../components";

type Props = {};

export function NFTStakingProject(params: Props) {
  const navigate = useNavigate();
  const { jumpGradient, darkPurple } = useTheme();

  const [show, setShow] = useState(false);

  const wallet = useNearWallet();
  const user = useNearUser(contractName);

  const { init, stake, unstake, unstakeAll, claimRewards } = useNftStaking();

  useEffect(() => {
    if (user.isConnected) {
      init(wallet as WalletConnection);
    }
  }, [user.isConnected]);

  return (
    <PageContainer>
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
                <GradientButton
                  onClick={() => unstake()}
                  bg={darkPurple}
                  justifyContent="space-between"
                >
                  Unstake NFT <WalletIcon />
                </GradientButton>
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

      <NFTStakeModal
        isOpen={show}
        onClose={() => {
          setShow(!show);
        }}
      />
    </PageContainer>
  );
}
