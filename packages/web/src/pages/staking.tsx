import { Box, Flex, Grid, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { useNearQuery } from "react-near";
import { WalletIcon } from "../assets/svg";
import { ArrowRightIcon } from "../assets/svg/arrow-right";
import {
  Button,
  GradientText,
  ModalImageDialog,
  PageContainer,
  ValueBox,
  Card,
} from "../components";
import { X_JUMP_TOKEN } from "../env/contract";
import { useTheme } from "../hooks/theme";
import { StakeModal } from "../modals";
import { useStaking } from "../stores/staking-store";
import { WithdrawModal } from "../modals/staking/withdraw";
import toast from "react-hot-toast";
import { useWalletSelector } from "@/context/wallet-selector";

interface TokenRatio {
  x_token: string;
  base_token: string;
}

/**
 * @name Staking
 * @page
 * @description - This is the staking JUMP page where user can stake and unstake Jump
 */
export const Staking = () => {
  const { accountId, selector } = useWalletSelector();
  const { stakeXToken, burnXToken } = useStaking();

  const { data = { base_token: "1", x_token: "1" } } = useNearQuery<TokenRatio>(
    "view_token_ratio",
    {
      contract: X_JUMP_TOKEN,
      poolInterval: 1000 * 60,
      debug: true,
      onCompleted: (res) => console.log(res),
      onError(err) {
        console.log(err);
      },
    }
  );

  const { data: balance = "0" } = useNearQuery<string, { account_id: string }>(
    "ft_balance_of",
    {
      contract: X_JUMP_TOKEN,
      variables: {
        account_id: accountId as string,
      },
      poolInterval: 1000 * 60,
      skip: !accountId,
      debug: true,
    }
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const stakingDisclosure = useDisclosure();
  const withdrawDisclosure = useDisclosure();

  const { jumpGradient, glassyWhiteOpaque } = useTheme();

  const balanceXToken = useMemo(() => balance || "0", [balance]);

  const tokenRatio = useMemo(() => {
    return Number(data.base_token) / Number(data.x_token);
  }, [data.base_token, data.x_token]);

  const submitStaking = useCallback(async (amount: string) => {
    try {
      await stakeXToken(amount, accountId as string, selector);
      toast.success(`You have staked ${amount} JUMP into ${amount} xJUMP`);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const submitWithdraw = useCallback(async (amount: string) => {
    try {
      await burnXToken(amount, accountId as string, selector);
      toast.success(`You have staked ${amount} JUMP into ${amount} xJUMP`);
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <PageContainer>
      <Flex gap={4} w="100%" flexWrap="wrap">
        <Card p="3px" flexGrow="1" borderRadius="26px">
          <Flex
            flex={1.6}
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex direction="row">
              <Flex direction="column" p={4}>
                <GradientText
                  fontSize={30}
                  fontWeight="800"
                  letterSpacing="-0.03em"
                >
                  Jump
                </GradientText>
                <Text
                  fontSize={40}
                  mt={-4}
                  fontWeight="800"
                  letterSpacing="-0.03em"
                >
                  Staking
                </Text>
                <Text w="300px" fontSize={16}>
                  When you stake JUMP tokens you earn tickets to join the
                  Launchpad pools!
                </Text>
              </Flex>
            </Flex>
            <Flex flex={1} pt={2} gap={3} mt={2}>
              <ValueBox
                borderColor={glassyWhiteOpaque}
                h="144px"
                w="100%"
                mt={2}
                value="0 JUMP"
                title="Estimated Rewards"
                bottomText="Per Week"
              />
              <ValueBox
                borderColor={glassyWhiteOpaque}
                h="144px"
                mt={2}
                w="100%"
                value={`${balanceXToken} JUMP`}
                title="Staked"
                bottomText="Your Staked JUMP"
              />
              <ValueBox
                borderColor={glassyWhiteOpaque}
                h="144px"
                mt={2}
                w="100%"
                value={`${tokenRatio}%`}
                title="APR"
                bottomText="Earnings Per Year"
              />
            </Flex>
          </Flex>
        </Card>
        <Card flex={1} flexGrow="1">
          <Flex
            h="100%"
            direction="column"
            flex={1}
            justifyContent="space-between"
          >
            <div>
              <GradientText
                fontSize={24}
                fontWeight="800"
                letterSpacing="-0.03em"
              >
                User Area
              </GradientText>
              <Text mb="40px" w="500px" fontWeight="semibold" fontSize={16}>
                This is the user area where you can interact with the Jump
                staking to earn passive income as an investor.
              </Text>
            </div>
            <Stack gap={1}>
              <Button
                color="white"
                border="1px solid white"
                bg="transparent"
                justifyContent="space-between"
                onClick={withdrawDisclosure.onOpen}
              >
                Unstake and Claim Rewards <WalletIcon />
              </Button>
              <Button
                color="black"
                border="1px solid white"
                bg="white"
                justifyContent="space-between"
                onClick={stakingDisclosure.onOpen}
              >
                Stake <WalletIcon />
              </Button>
            </Stack>
          </Flex>
        </Card>
      </Flex>
      <Box
        bg={jumpGradient}
        p="30px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderRadius={20}
        position="absolute"
        bottom="30px"
        left="150px"
        right="30px"
      >
        <Flex direction="column">
          <Text color="white" fontWeight="bold">
            Need Help?
          </Text>
          <Text color="white" fontWeight="semibold" fontSize="20px">
            To understand how staking works checkout here
          </Text>
        </Flex>

        <Button px="50px" onClick={onOpen} bg="white" color="black">
          Learn More Here
        </Button>
      </Box>

      <ModalImageDialog
        image="https://images.unsplash.com/photo-1523568114750-b593de7df18f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80"
        isOpen={isOpen}
        title="Understanding Staking"
        onClose={onClose}
        footer={
          <Button bg="white" color="black" w="100%">
            Read More on Docs
            <ArrowRightIcon />
          </Button>
        }
        shouldBlurBackdrop
      >
        <Text color="white" fontSize={16}>
          Staking is a way to earn rewards in crypto currencies. You lock your
          tokens on our Staking Pool, for earning JUMP Tokens and getting access
          to tickets and invest inside the launchpad, the longer you lock your
          tokens more rewards you get! Still Confused?
        </Text>
      </ModalImageDialog>
      <StakeModal
        isOpen={stakingDisclosure.isOpen}
        onClose={stakingDisclosure.onClose}
        _onSubmit={(v) => submitStaking(v.value)}
      />
      <WithdrawModal
        isOpen={withdrawDisclosure.isOpen}
        onClose={withdrawDisclosure.onClose}
        _onSubmit={(v) => submitWithdraw(v.value)}
      />
    </PageContainer>
  );
};
