import { Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { WalletIcon } from "../assets/svg";
import { ArrowRightIcon } from "../assets/svg/arrow-right";
import {
  Button,
  ModalImageDialog,
  PageContainer,
  ValueBox,
} from "../components";

/**
 * @name Staking
 * @page
 * @description - This is the staking JUMP page where user can stake and unstake Jump
 */
export const Staking = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <PageContainer>
      <Box
        overflow="hidden"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        borderRadius="25px"
        bg="darkerGrey"
      >
        <Flex pr="50px" flex={1} w="100%" py="40px" direction="column">
          <Flex direction="row">
            <Flex flex={1} direction="column" pl="60px">
              <Text color="white" fontFamily="Damion" fontSize="50px" as="h1">
                Staking
              </Text>
              <Text color="white" fontSize="16px">
                Earn passive income and laucnhpad tickets by Staking JUMP
              </Text>
            </Flex>

            <Flex flex={1} direction="column" pl="60px">
              <ValueBox
                variant="brand"
                value="$34,145,999"
                title="Total Staked"
                bottomText="Per Week"
                darkModeInteraction={false}
              />
            </Flex>
          </Flex>
          <Flex
            direction="row"
            justifyContent="space-evenly"
            alignItems="center"
            gap="8px"
            pl="40px"
            mt="10px"
          >
            <ValueBox
              value="0 JUMP"
              title="Estimated Rewards"
              bottomText="Per Week"
              darkModeInteraction={false}
            />
            <ValueBox
              value="0 JUMP"
              title="Staked"
              bottomText="Your Staked JUMP Tokens"
              darkModeInteraction={false}
            />
            <ValueBox
              value="17.13%"
              title="APR"
              bottomText="Earnings Per Year"
              darkModeInteraction={false}
            />
          </Flex>
        </Flex>
        <Flex
          flex={1}
          w="100%"
          py="40px"
          px="40px"
          direction="column"
          bg="brand.900"
          h="100%"
        >
          <Text color="white" fontSize={20} fontWeight="semibold">
            User Area
          </Text>
          <Text color="white" fontSize={16} fontWeight="semibold">
            This is the area wher you can interact with the Staking as a
            Investor
          </Text>
          <Stack mt="40px" direction="column" gap={2}>
            <Button bg="white" color="darkerGrey">
              Claim your Rewards
              <WalletIcon />
            </Button>
            <Button bg="white" color="darkerGrey">
              Withdraw
              <WalletIcon />
            </Button>
            <Button bg="darkerGrey" color="white">
              Stake
              <WalletIcon />
            </Button>
          </Stack>
        </Flex>
      </Box>

      <Box
        bg="brand.900"
        w="100%"
        p="30px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderRadius={20}
      >
        <Flex direction="column">
          <Text color="white" fontWeight="bold">
            Need Help?
          </Text>
          <Text color="white" fontWeight="semibold" fontSize="20px">
            To understand how staking works checkout here
          </Text>
        </Flex>

        <Button onClick={onOpen} bg="white" color="black">
          Learn More
        </Button>

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
            tokens on our Staking Pool, for earning JUMP Tokens and getting
            access to tickets and invest inside the launchpad, the longer you
            lock your tokens more rewards you get! Still Confused?
          </Text>
        </ModalImageDialog>
      </Box>
    </PageContainer>
  );
};
