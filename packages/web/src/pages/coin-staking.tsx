import {
  Box,
  Flex,
  Text,
  Skeleton,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNearQuery } from "react-near";
import { WalletIcon } from "../assets/svg";
import {
  Button,
  GradientText,
  ModalImageDialog,
  PageContainer,
  ValueBox,
  Card,
} from "../components";
import { X_JUMP_TOKEN, JUMP_TOKEN } from "../env/contract";
import { useTheme } from "../hooks/theme";
import { StakeModal } from "../modals";
import { useStaking } from "../stores/staking-store";
import { WithdrawModal } from "../modals/staking/withdraw";
import { useWalletSelector } from "@/context/wallet-selector";
import Big from "big.js";
import { Tutorial } from "@/components";
import { JumpIcon } from "../assets/svg/jump-logo";
import { XJumpIcon } from "../assets/svg/xjump-logo";
import { viewFunction } from "@/tools";
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
  const [baseTokenMetadata, setBaseTokenMetadata] = useState<any>();

  const {
    data: { base_token = "1", x_token = "1" } = {},
    loading: loadingTokenRatio,
  } = useNearQuery<TokenRatio>("view_token_ratio", {
    contract: X_JUMP_TOKEN,
    poolInterval: 1000 * 60,
    debug: true,
    onError(err) {
      console.warn(err);
    },
  });

  // amount of tokens that jump will deposit every month
  // this is an alternative while there is no track record
  // of yield to extrapolate from
  const jumpYearlyDistributionCompromise = "10000000000000000000";

  const { data: balance = "0", loading: loadingBalance } = useNearQuery<
    string,
    { account_id: string }
  >("ft_balance_of", {
    contract: X_JUMP_TOKEN,
    variables: {
      account_id: accountId as string,
    },
    poolInterval: 1000 * 60,
    skip: !accountId,
  });

  const { data: baseTokenBalance, loading: loadingBaseTokenBalance } =
    useNearQuery<string, { account_id: string }>("ft_balance_of", {
      contract: JUMP_TOKEN,
      variables: {
        account_id: accountId as string,
      },
      poolInterval: 1000 * 60,
      skip: !accountId,
    });

  const { data: jumpMetadata } = useNearQuery<{
    decimals: number;
    symbol: string;
    icon: string;
  }>("ft_metadata", {
    contract: JUMP_TOKEN,
    poolInterval: 1000 * 60,
    skip: !accountId,
    debug: true,
  });

  useEffect(() => {
    (async () => {
      const metadata = await viewFunction(
        selector,
        X_JUMP_TOKEN,
        "ft_metadata"
      );

      setBaseTokenMetadata(metadata);
      console.log(metadata);
    })();
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const stakingDisclosure = useDisclosure();
  const withdrawDisclosure = useDisclosure();

  const { jumpGradient, glassyWhiteOpaque } = useTheme();

  const balanceXToken = useMemo(() => balance || "0", [balance]);

  const baseToken = useMemo(() => {
    return base_token === "0" ? "1" : base_token;
  }, [base_token]);

  const xToken = useMemo(() => {
    return x_token === "0" ? "1" : x_token;
  }, [x_token]);

  const getAmountRaw = (amount) => {
    const denom = new Big("10").pow(jumpMetadata?.decimals!);

    return new Big(amount).mul(denom).toString();
  };

  const submitStaking = useCallback(
    async (amount: string) => {
      const deposit = getAmountRaw(amount);

      try {
        await stakeXToken(deposit, accountId!, selector);
      } catch (error) {
        console.warn(error);
      }
    },
    [accountId, jumpMetadata]
  );

  const submitWithdraw = useCallback(
    async (amount: string) => {
      const withdraw = getAmountRaw(amount);

      try {
        await burnXToken(withdraw, accountId!, selector);
      } catch (error) {
        console.warn(error);
      }
    },
    [accountId, jumpMetadata]
  );

  const isLoading = useMemo(() => {
    return loadingBalance && loadingTokenRatio && loadingBaseTokenBalance;
  }, [loadingBalance, loadingTokenRatio]);

  const decimals = useMemo(() => {
    return Big(10).pow(jumpMetadata?.decimals || 1);
  }, [jumpMetadata]);

  const jumpRatio = useMemo(() => {
    return new Big(baseToken).div(decimals);
  }, [baseToken, decimals]);

  const xJumpRatio = useMemo(() => {
    return new Big(xToken).div(decimals);
  }, [xToken, decimals]);

  const jumpValue = useMemo(() => {
    return jumpRatio.div(xJumpRatio).toFixed(2);
  }, [jumpRatio, xJumpRatio]);

  const xJumpValue = useMemo(() => {
    return xJumpRatio.div(jumpRatio).toFixed(2);
  }, [jumpRatio, xJumpRatio]);

  const xTokenBalance = useMemo(() => {
    return new Big(balanceXToken).div(decimals);
  }, [balanceXToken, decimals]);

  const xTokenInToken = useMemo(() => {
    return xTokenBalance.div(jumpValue).toFixed(2);
  }, [xTokenBalance, jumpValue]);

  const apr = useMemo(() => {
    const base = new Big(jumpYearlyDistributionCompromise).mul(100);

    const baseBig = new Big(baseToken);

    const denom = new Big(10).pow(9);

    return base.div(baseBig).div(denom).toFixed(2);
  }, [jumpYearlyDistributionCompromise, baseToken]);

  const stepItems = [
    {
      element: ".jump-staking",
      title: "Jump Staking",
      intro: (
        <div>
          <span>
            This is where you stake your Jumps in xJump. Required to enter
            vesting projects.
          </span>
        </div>
      ),
    },
    {
      title: "User Area",
      element: ".user-area",
      intro: (
        <div className="flex flex-col">
          <span>
            In this section you can stake your Jump tokens. Stake now!
          </span>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <Flex gap={4} w="100%" flexWrap="wrap">
        <Card
          p="3px"
          flexGrow="1"
          borderRadius="26px"
          position="relative"
          className="jump-staking"
        >
          <Tutorial items={stepItems} />

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
                  fontSize={50}
                  mt={-4}
                  fontWeight="800"
                  letterSpacing="-0.03em"
                >
                  Staking
                </Text>
                <Text maxW="365px" fontSize={18}>
                  When you stake JUMP tokens you earn tickets to join the
                  Launchpad pools!
                </Text>
              </Flex>
            </Flex>
            <Flex
              className="flex-wrap lg:flex-nowrap"
              flex={1}
              pt={2}
              gap={3}
              mt={2}
            >
              <Skeleton
                isLoaded={!isLoading}
                className="w-full h-[144px] mt-2 rounded-[20px]"
              >
                <ValueBox
                  borderColor={glassyWhiteOpaque}
                  value={
                    <Flex className="items-center space-x-[8px]">
                      <Box
                        borderRadius={99}
                        border="solid 3px"
                        outline={glassyWhiteOpaque}
                        borderColor={glassyWhiteOpaque}
                        boxSizing="content-box"
                        className="h-[28px] w-[28px]"
                      >
                        <Image
                          width="100%"
                          height="100%"
                          borderRadius="20px"
                          src={jumpMetadata?.icon}
                        />
                      </Box>
                      <Text children={jumpValue} />
                    </Flex>
                  }
                  title="xJUMP Value"
                  bottomText={`1 JUMP = ${xJumpValue} xJump`}
                  className="h-full w-full"
                />
              </Skeleton>

              <Skeleton
                isLoaded={!isLoading}
                className="w-full h-[144px] mt-2 rounded-[20px]"
              >
                <ValueBox
                  title="You own"
                  className="h-full w-full"
                  bottomText={"worth " + xTokenInToken + " JUMP"}
                  borderColor={glassyWhiteOpaque}
                  value={
                    <Flex className="items-center space-x-[8px]">
                      <Box
                        clipPath="polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                        border="solid 3px"
                        borderLeft="solid 1px"
                        borderRight="solid 1px"
                        background={glassyWhiteOpaque}
                        borderColor="rgba(255,255,255,0.05)"
                        boxSizing="content-box"
                        className="h-[30px] w-[30px]"
                      >
                        <Image
                          width="100%"
                          height="100%"
                          src={baseTokenMetadata?.icon}
                        />
                      </Box>
                      <Text children={xTokenBalance.toFixed(2)} />
                    </Flex>
                  }
                />
              </Skeleton>

              <Skeleton
                isLoaded={!isLoading}
                className="w-full h-[144px] mt-2 rounded-[20px]"
              >
                <ValueBox
                  title="APR"
                  value={apr + "%"}
                  className="h-full w-full"
                  bottomText="Earnings Per Year"
                  borderColor={glassyWhiteOpaque}
                />
              </Skeleton>
            </Flex>
          </Flex>
        </Card>

        <Card flex={1} flexGrow="1" position="relative" className="user-area">
          <Flex
            h="100%"
            direction="column"
            flex={1}
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <div>
              <GradientText
                fontSize={24}
                fontWeight="800"
                letterSpacing="-0.03em"
              >
                User Area
              </GradientText>
              <Text mb="40px" maxW="500px" fontWeight="semibold" fontSize={18}>
                This is the user area where you can interact with the Jump
                staking to earn passive income as an investor.
              </Text>
            </div>
            <Flex direction="column" gap={4} width="100%">
              <Skeleton isLoaded={!isLoading} className="rounded-[15px] w-full">
                <Button
                  color="black"
                  border="1px solid white"
                  bg="white"
                  justifyContent="space-between"
                  maxWidth="100%"
                  width="100%"
                  onClick={stakingDisclosure.onOpen}
                  disabled={!baseTokenBalance || baseTokenBalance === "0"}
                >
                  Stake <WalletIcon />
                </Button>
              </Skeleton>

              <Skeleton isLoaded={!isLoading} className="rounded-[15px] w-full">
                <Button
                  color="white"
                  border="1px solid white"
                  bg="transparent"
                  maxWidth="100%"
                  width="100%"
                  justifyContent="space-between"
                  onClick={withdrawDisclosure.onOpen}
                  disabled={!balance || balance === "0"}
                >
                  <Flex
                    w="100%"
                    alignItems="center"
                    justifyContent="space-between"
                    className="flex md:hidden"
                  >
                    Unstake <WalletIcon />
                  </Flex>

                  <Flex
                    w="100%"
                    alignItems="center"
                    justifyContent="space-between"
                    className="hidden md:flex"
                  >
                    Unstake and Claim Rewards <WalletIcon />
                  </Flex>
                </Button>
              </Skeleton>
            </Flex>
          </Flex>
        </Card>
      </Flex>
      <Box
        bg={jumpGradient}
        p="30px"
        alignItems="center"
        justifyContent="space-between"
        borderRadius={20}
        // position="absolute"
        className="max-w-fit sm:max-w-none flex flex-col sm:flex-row 
        gap-[16px]  sm:gap-0"
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
          <Button bg="white" color="black" px="12px" className="px-[12px]">
            Read More on Docs
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

export default Staking;
