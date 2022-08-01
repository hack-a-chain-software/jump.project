/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/ban-types */
import {
  Box,
  Flex,
  Grid,
  Stack,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { WalletIcon } from "../assets/svg";
import isEqual from "lodash/isEqual";
import { AnimatePresence, motion } from "framer-motion";
import {
  If,
  GradientButton,
  GradientText,
  NFTStakingCard,
  PageContainer,
  ValueBox,
  StakeModal,
  TokenCard,
  BackButton,
  TokenAccordion,
} from "@/components";
import { useTheme } from "../hooks/theme";
import { WalletConnection } from "near-api-js";
import { useNftStaking } from "../stores/nft-staking-store";
import { getNear } from "@/hooks/near";
import { useQuery } from "@apollo/client";
import { StakingProjectDocument } from "@near/apollo";
import { useNearQuery } from "react-near";

type Token = {
  nft_id: string;
  staked_meta: {
    media: string;
    title?: string;
    description?: string;
  };
  jumpRewards: string;
  acovaRewards: string;
  trpRewards: string;
};

export function NFTStakingProject() {
  const navigate = useNavigate();

  const { id = "" } = useParams();
  const collection = window.atob(id);

  const { jumpGradient, darkPurple, gradientBoxTopCard, glassyWhiteOpaque } =
    useTheme();

  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState<Token | null>(null);

  const { user, wallet } = getNear(import.meta.env.VITE_STAKING_CONTRACT);
  const { init, unstake, claimRewards } = useNftStaking();

  useEffect(() => {
    if (user.isConnected) {
      init(wallet as WalletConnection);
    }
  }, [user.isConnected]);

  const [selected, setSelected] = useState<Array<string>>([]);

  const select = (tokenId) => {
    if (selected.includes(tokenId)) {
      setSelected([...selected.filter((token) => token !== tokenId)]);

      return;
    }

    setSelected([...selected, tokenId]);
  };

  const toggleStakeModal = () => {
    if (!user.isConnected) {
      user.connect();

      return;
    }

    setShow(!show);
  };

  const { data: { staking } = {}, loading } = useQuery(StakingProjectDocument, {
    variables: {
      collection,
      accountId: user.address || "",
    },
  });

  const { data: abc, error } = useNearQuery("view_staked", {
    contract: import.meta.env.VITE_STAKING_CONTRACT,
    variables: {
      account_id: user.address || "",
      collection: {
        type: "n_f_t_contract",
        account_id: collection,
      },
    },
    skip: !user.isConnected,
  });

  const tokens = [];

  return (
    <PageContainer loading={loading}>
      <StakeModal
        isOpen={show}
        collection={collection}
        onClose={() => {
          setShow(!show);
        }}
      />

      <BackButton onClick={() => navigate("/nft-staking")} />
      <NFTStakingCard
        collectionLogo={staking?.collection_meta?.image}
        collectionName={staking?.collection_meta?.name}
      />
      <Flex flex={1} direction="row">
        <Flex flex={1} direction="column">
          <Text fontWeight="800" fontSize={30} letterSpacing="-0.03em" mb={3}>
            Your Position:
          </Text>
          <Grid gap={3} gridTemplateColumns="1fr 1fr">
            <ValueBox
              height="139px"
              title="Your JUMP Rewards"
              value={user.isConnected ? "0 JUMP" : "Connect Wallet"}
              bottomText={user.isConnected && "Your Total JUMP Rewards"}
            />
            <ValueBox
              height="139px"
              title="Your ACOVA Rewards"
              value={user.isConnected ? "0 ACOVA" : "Connect Wallet"}
              bottomText={user.isConnected && "Your Total ACOVA Rewards"}
            />
          </Grid>
          <ValueBox
            mt={3}
            height="139px"
            title="Your ACOVA Rewards"
            value={user.isConnected ? "0 ACOVA" : "Connect Wallet"}
            bottomText={user.isConnected && "Your Total ACOVA Rewards"}
          />
        </Flex>

        <Flex flex={1}>
          <Box
            ml="20px"
            display="flex"
            p="3px"
            w="100%"
            background={useColorModeValue("transparent", jumpGradient)}
            borderRadius="26px"
          >
            <Box
              display="flex"
              flexDirection="column"
              w="100%"
              h="100%"
              borderRadius="24px"
              bg={useColorModeValue(jumpGradient, gradientBoxTopCard)}
            >
              <Box
                p="40px"
                bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
              >
                <GradientText
                  mb="-5px"
                  fontWeight="800"
                  fontSize={16}
                  color="white"
                >
                  User Area
                </GradientText>
                <Text
                  fontWeight="800"
                  fontSize={30}
                  letterSpacing="-0.03em"
                  mb={3}
                  color="white"
                >
                  Interact with Your Position
                </Text>
                <Text mt="-10px" fontWeight="semibold" color="white">
                  This is the area wher you can interact with the Staking as a
                  Investor
                </Text>
                <Stack mt="50px" gap={1}>
                  <GradientButton
                    onClick={() => toggleStakeModal()}
                    bg={useColorModeValue("white", darkPurple)}
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
                    onClick={() =>
                      unstake(
                        tokens.map(({ nft_id }) => nft_id),
                        collection
                      )
                    }
                    bg={useColorModeValue("white", darkPurple)}
                    justifyContent="space-between"
                  >
                    Unstake All NFTs <WalletIcon />
                  </GradientButton>
                  <GradientButton
                    onClick={() => claimRewards([])}
                    bg={useColorModeValue("white", darkPurple)}
                    justifyContent="space-between"
                  >
                    Claim Pool Rewards <WalletIcon />
                  </GradientButton>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Flex>

      <If
        fallback={
          user.isConnected && (
            <Flex
              pt="20px"
              marginX="auto"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Text
                fontWeight="800"
                fontSize={30}
                letterSpacing="-0.03em"
                mb={3}
              >
                You don't have a staked NFT
              </Text>

              <Text
                _hover={{
                  opacity: 0.8,
                }}
                onClick={() => toggleStakeModal()}
                marginTop="-12px"
                cursor="pointer"
                color="#761BA0"
                fontWeight="800"
                fontSize={34}
                letterSpacing="-0.03em"
                mb={3}
              >
                Stake Now!
              </Text>
            </Flex>
          )
        }
        condition={user.isConnected && tokens?.length > 0}
      >
        <Flex
          paddingTop="66px"
          alignItems="center"
          justifyContent="space-between"
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
              onClick={() => unstake(selected, collection)}
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
                selected={selected && selected.includes(focused?.nft_id)}
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
              tokens.map((token: Token, index) => (
                <Flex
                  key={"nft-staked-tokens-" + index}
                  onClick={() =>
                    setFocused(isEqual(token, focused) ? null : token)
                  }
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
                    selected={selected && selected.includes(token.nft_id)}
                  />
                </Flex>
              ))}
          </Grid>
        </Flex>
      </If>
    </PageContainer>
  );
}
