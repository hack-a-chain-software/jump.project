import { Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { WalletIcon } from "../assets/svg";
import { ArrowRightIcon } from "../assets/svg/arrow-right";
import {
  Button,
  GradientText,
  ModalImageDialog,
  PageContainer,
  ValueBox,
} from "../components";
import { GradientButton } from "../components/shared/gradient-button";
import { useTheme } from "../hooks/theme";

/**
 * @name Staking
 * @page
 * @description - This is the staking JUMP page where user can stake and unstake Jump
 */
export const Staking = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { gradientBoxTopCard, jumpGradient } = useTheme();
  return (
    <PageContainer>
      <Box p="3px" background={jumpGradient} borderRadius="26px">
        <Box
          maxW="100%"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          w="100%"
          p="30px"
          minH="399px"
          borderRadius="24px"
          bg={gradientBoxTopCard}
        >
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
              <ValueBox
                h="144px"
                w="100%"
                flex={1}
                mt={2}
                value={<GradientText>$34,145,999</GradientText>}
                title="Total Staked"
                bottomText="21,341,250 JUMP"
              />
            </Flex>
            <Flex flex={1} pt={2} gap={3} mt={2}>
              <ValueBox
                h="144px"
                w="100%"
                mt={2}
                value="0 JUMP"
                title="Estimated Rewards"
                bottomText="Per Week"
              />
              <ValueBox
                h="144px"
                mt={2}
                w="100%"
                value="0 JUMP"
                title="Staked"
                bottomText="Your Staked JUMP"
              />
              <ValueBox
                h="144px"
                mt={2}
                w="100%"
                value="17,73%"
                title="APR"
                bottomText="Earnings Per Year"
              />
            </Flex>
          </Flex>
          <Flex direction="column" ml="80px" flex={1}>
            <GradientText
              fontSize={24}
              fontWeight="800"
              letterSpacing="-0.03em"
            >
              User Area
            </GradientText>
            <Text mb="40px" w="500px" fontWeight="semibold" fontSize={16}>
              This is the user area where you can interact with the Jump staking
              to earn passive income as an investor.
            </Text>
            <Stack gap={1}>
              <GradientButton justifyContent="space-between">
                Claim your Rewards <WalletIcon />
              </GradientButton>
              <GradientButton justifyContent="space-between">
                Withdraw <WalletIcon />
              </GradientButton>
              <GradientButton justifyContent="space-between">
                Stake <WalletIcon />
              </GradientButton>
            </Stack>
          </Flex>
        </Box>
      </Box>

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
    </PageContainer>
  );
};
