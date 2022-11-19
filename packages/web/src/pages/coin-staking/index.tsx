import { useCallback, useEffect, useMemo, useState } from "react";
import Big from "big.js";
import {
  Box,
  Flex,
  Text,
  Skeleton,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import {
  Button,
  GradientText,
  ModalImageDialog,
  PageContainer,
  ValueBox,
  Card,
  Tutorial,
} from "@/components";
import { useWalletSelector } from "@/context/wallet-selector";
import { X_JUMP_TOKEN, JUMP_TOKEN } from "@/env/contract";
import { WithdrawModal } from "@/modals/staking/withdraw";
import { StakeModal } from "@/modals";
import { useXJumpMetadata } from "@/hooks/modules/launchpad";
import {
  useTokenBalance,
  useTokenMetadata,
  useTokenRatio,
} from "@/hooks/modules/token";
import { useTheme } from "@/hooks/theme";
import {
  jumpYearlyDistributionCompromise,
  parseToBigAndDivByDecimals,
  divideAndParseToTwoDecimals,
  calcAPR,
  calcAmountRaw,
} from "./staking.config";
import { stepItemsStaking } from "./staking.tutorial";
import { useStaking } from "@/stores/staking-store";
import { WalletIcon } from "@/assets/svg";
import { getDecimals } from "@/tools";

/**
 * @name Staking
 * @page
 * @description - This is the staking JUMP page where user can stake and unstake Jump
 */
export const Staking = () => {
  const [baseTokenMetadata, setBaseTokenMetadata] = useState<any>();

  const { jumpGradient, glassyWhiteOpaque } = useTheme();
  const { accountId, selector } = useWalletSelector();
  const { stakeXToken, burnXToken } = useStaking();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const stakingDisclosure = useDisclosure();
  const withdrawDisclosure = useDisclosure();

  // Blockchain Data
  const {
    data: { base_token = "1", x_token = "1" } = {},
    loading: loadingTokenRatio,
  } = useTokenRatio(X_JUMP_TOKEN);

  const { data: balance = "0", loading: loadingBalance } = useTokenBalance(
    X_JUMP_TOKEN,
    accountId
  );

  const { data: baseTokenBalance, loading: loadingBaseTokenBalance } =
    useTokenBalance(JUMP_TOKEN, accountId);

  const { data: jumpMetadata } = useTokenMetadata(JUMP_TOKEN);

  useEffect(() => {
    (async () => {
      const metadata = await useXJumpMetadata(selector);

      setBaseTokenMetadata(metadata);
    })();
  }, []);

  // Calculating balances
  const balanceXToken = useMemo(() => balance || "0", [balance]);

  const baseToken = useMemo(() => {
    return base_token === "0" ? "1" : base_token;
  }, [base_token]);

  const xToken = useMemo(() => {
    return x_token === "0" ? "1" : x_token;
  }, [x_token]);

  const submitStaking = useCallback(
    async (amount: string) => {
      const deposit = calcAmountRaw(amount, jumpMetadata?.decimals!);

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
      const withdraw = calcAmountRaw(amount, jumpMetadata?.decimals!);

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

  // Calculating meaningful ratios
  const decimals = useMemo(() => {
    return getDecimals(jumpMetadata?.decimals);
  }, [jumpMetadata]);

  const jumpRatio = useMemo(() => {
    return parseToBigAndDivByDecimals(baseToken, decimals);
  }, [baseToken, decimals]);

  const xJumpRatio = useMemo(() => {
    return parseToBigAndDivByDecimals(xToken, decimals);
  }, [xToken, decimals]);

  const jumpValue = useMemo(() => {
    return divideAndParseToTwoDecimals(jumpRatio, xJumpRatio);
  }, [jumpRatio, xJumpRatio]);

  const xJumpValue = useMemo(() => {
    return divideAndParseToTwoDecimals(xJumpRatio, jumpRatio);
  }, [jumpRatio, xJumpRatio]);

  const xTokenBalance = useMemo(() => {
    return parseToBigAndDivByDecimals(balanceXToken, decimals);
  }, [balanceXToken, decimals]);

  const xTokenInToken = useMemo(() => {
    return divideAndParseToTwoDecimals(xTokenBalance, jumpValue);
  }, [xTokenBalance, jumpValue]);

  const apr = useMemo(() => {
    return calcAPR(jumpYearlyDistributionCompromise, baseToken);
  }, [jumpYearlyDistributionCompromise, baseToken]);

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
          <Tutorial items={stepItemsStaking} />

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
                  JUMP Staking
                </GradientText>
                <Text
                  fontSize={50}
                  mt={-4}
                  fontWeight="800"
                  letterSpacing="-0.03em"
                >
                  xJUMP Single-Stake Pool
                </Text>
                <Text maxW="900px" fontSize={18}>
                  By staking JUMP, users earn the fees generated by the Jump
                  DeFi ecosystem of protocols. When you stake JUMP in the xJUMP
                  Pool you receive xJUMP tokens. xJUMP is used to determine Jump
                  Pad allocation tiers for token sales and is also used for
                  governance over the Jump DAO.
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
                User Portal
              </GradientText>
              <Text mb="40px" maxW="500px" fontWeight="semibold" fontSize={18}>
                Stake your JUMP tokens in the xJUMP Pool.
              </Text>
            </div>
            <Flex direction="column" gap={4} width="100%">
              <Skeleton isLoaded={!isLoading} className="rounded-[15px] w-full">
                <Button
                  className="w-full flex justify-between"
                  onClick={stakingDisclosure.onOpen}
                  disabled={!baseTokenBalance || baseTokenBalance === "0"}
                >
                  Stake JUMP <WalletIcon className="h-6" />
                </Button>
              </Skeleton>

              <Skeleton isLoaded={!isLoading} className="rounded-[15px] w-full">
                <Button
                  outline
                  className="w-full flex justify-between"
                  onClick={withdrawDisclosure.onOpen}
                  disabled={!balance || balance === "0"}
                >
                  <div className="w-full items-center justify-between flex lg:hidden">
                    Unstake <WalletIcon className="h-6" />
                  </div>

                  <div className="w-full items-center justify-between hidden lg:flex">
                    Unstake and Claim Rewards <WalletIcon className="h-6" />
                  </div>
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
            Click here to learn how xJUMP staking works
          </Text>
        </Flex>

        <Button white className="px-[50px]" onClick={onOpen}>
          Learn More Here
        </Button>
      </Box>

      <ModalImageDialog
        image="https://images.unsplash.com/photo-1523568114750-b593de7df18f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80"
        isOpen={isOpen}
        title="Understanding xJUMP Staking"
        onClose={onClose}
        footer={
          <Button white className="px-[12px]">
            Read More on Docs
          </Button>
        }
        shouldBlurBackdrop
      >
        <Text color="white" fontSize={16}>
          All major JUMP token utilities are tied to xJUMP, making it easy for
          users to access everything in one place. The main benefit to staking
          JUMP in the xJUMP pool is access to the revenues generated by the Jump
          DeFi protocols. Additionally, xJUMP tokens are staked to determine
          Jump Pad allocation tiers for token sales and for governance over the
          Jump DAO.
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
