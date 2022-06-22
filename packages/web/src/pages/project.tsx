import {
  Box,
  Flex,
  Image,
  Input,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  DiscordIcon,
  TelegramIcon,
  TwitterIcon,
  WalletIcon,
  WebIcon,
  WhitepaperIcon,
} from "../assets/svg";
import { Button, PageContainer, ValueBox } from "../components";
import { BackButton } from "../components/shared/back-button";

const tabKinds = {
  pool: "Pool Information",
  token: "Token Information",
};

/**
 * @description - Launchpad project details page
 * @name Project
 */
export const Project = () => {
  const [kind, setKind] = useState(tabKinds.pool);
  const navigate = useNavigate();
  return (
    <PageContainer>
      <BackButton onClick={() => navigate("/")} />

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
        <Flex
          pr="50px"
          flex={1}
          px="40px"
          w="100%"
          py="40px"
          direction="column"
        >
          <Image
            w="70px"
            h="70px"
            borderRadius={100}
            src="https://img.raydium.io/icon/poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk.png"
          />
          <Flex alignItems="center" pl="10px" gap={5}>
            <Text fontSize="24px" fontWeight="bold" color="white">
              Atlas
            </Text>
            <Flex
              alignItems="center"
              justifyContent="center"
              p="10px 15px"
              fontSize={12}
              bg="white"
              borderRadius={100}
            >
              <Text color="black" fontWeight="semibold">
                0.012 USDC
              </Text>
            </Flex>
          </Flex>

          <Flex
            px="20px"
            py="20px"
            color="white"
            justifyContent="space-between"
          >
            <Flex direction="column">
              <Text fontWeight="bold" fontSize={24}>
                30,000,000
                <Text as="strong" fontSize={12}>
                  ATLAS
                </Text>
              </Text>
              <Text fontSize={16}>Total Raise</Text>
            </Flex>
            <Flex direction="column">
              <Text fontWeight="bold" fontSize={24}>
                60
                <Text as="strong" fontSize={12}>
                  USDC
                </Text>
              </Text>
              <Text fontSize={16}>Allocation per ticket</Text>
            </Flex>
            <Flex direction="column">
              <Text fontWeight="bold" fontSize={24}>
                369553
                <Text as="strong" fontSize={12}>
                  Tickets
                </Text>
              </Text>
              <Text fontSize={16}>Total Tickets Deposited</Text>
            </Flex>
          </Flex>

          <Progress
            value={80}
            borderRadius={20}
            colorScheme="brand"
            bg="gray.700"
          />
        </Flex>
        <Flex
          flex={1}
          w="100%"
          py="40px"
          px="40px"
          direction="column"
          justifyContent="space-evenly"
          bg="brand.900"
          h="100%"
          gap="30px"
          color="white"
        >
          <Text fontSize={20} fontWeight="semibold">
            Join Project
          </Text>
          <Flex gap="5px" direction="column">
            <Text>Tickets - 60 USDC Per Ticket</Text>
            <Input
              bg="white"
              color="black"
              placeholder="Tickets"
              type="number"
              variant="filled"
              _focus={{ bg: "white" }}
            />
            <Text>You have 3 tickets available to deposit</Text>
          </Flex>
          <Stack direction="column" gap={2}>
            <Button bg="white" color="darkerGrey">
              Deposit
              <WalletIcon />
            </Button>
          </Stack>
        </Flex>
      </Box>
      <Flex>
        <Flex p="30px" flex={0.9} direction="column">
          <Text fontSize="24px" fontWeight="bold" mb="15px">
            Project Details
          </Text>
          <p>
            POLIS is the primary governance token of Star Atlas. Star Atlas is a
            grand strategy game that combines space exploration, territorial
            conquest, and political domination. In the distant future, players
            can join one of three galactic factions to directly influence the
            course of the metaverse and earn real-world income for their
            contributions. The Star Atlas offers a unique gaming experience by
            combining block chain mechanics with traditional game mechanics. All
            assets in the metaverse are directly owned by players, and can be
            traded on the marketplace or exchanged on other cryptocurrency
            networks.
          </p>
          <Flex
            mt="30px"
            justifyContent="space-between"
            borderRadius={15}
            padding="20px"
            bg="brand.900"
            alignItems="center"
          >
            <Text fontSize="16px" fontWeight="bold" color="white">
              Social Media
            </Text>
            <Flex color="white" direction="row" gap="10px">
              <Flex
                cursor="pointer"
                w="40px"
                h="40px"
                bg="black"
                alignItems="center"
                borderRadius={10}
                justifyContent="center"
              >
                <DiscordIcon />
              </Flex>
              <Flex
                cursor="pointer"
                w="40px"
                h="40px"
                bg="black"
                alignItems="center"
                borderRadius={10}
                justifyContent="center"
              >
                <TwitterIcon />
              </Flex>
              <Flex
                cursor="pointer"
                w="40px"
                h="40px"
                bg="black"
                alignItems="center"
                borderRadius={10}
                justifyContent="center"
              >
                <TelegramIcon />
              </Flex>

              <Flex
                cursor="pointer"
                w="40px"
                h="40px"
                bg="black"
                alignItems="center"
                borderRadius={10}
                justifyContent="center"
              >
                <WebIcon />
              </Flex>

              <Flex
                cursor="pointer"
                w="40px"
                h="40px"
                bg="black"
                alignItems="center"
                borderRadius={10}
                justifyContent="center"
              >
                <WhitepaperIcon />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex flex={1}>
          <Flex
            flex={1}
            w="100%"
            borderRadius={15}
            p="30px"
            direction="column"
            bg="brand.900"
            h="100%"
            color="white"
          >
            <Flex
              bg="black"
              borderRadius={8}
              alignItems="center"
              gap="10px"
              p="4px"
            >
              <Button
                color="white"
                borderRadius={5}
                bg="brand.900"
                w="100%"
                py="12px"
              >
                Pool information
              </Button>
              <Button
                color="white"
                bg="black"
                borderRadius={5}
                w="100%"
                py="12px"
              >
                Token information
              </Button>
            </Flex>
            <Stack p="10px" gap="2px" color="white">
              <Flex
                py="10px"
                direction="column"
                borderBottom="3px dotted white"
              >
                <Text>Pool opens</Text>
                <Text>20 April, 2022 - 10:00 UTC</Text>
              </Flex>
              <Flex
                py="10px"
                direction="column"
                borderBottom="3px dotted white"
              >
                <Text>Pool closes</Text>
                <Text>20 April, 2022 - 10:00 UTC</Text>
              </Flex>
              <Flex
                py="10px"
                direction="column"
                borderBottom="3px dotted white"
              >
                <Text>Total Tickets</Text>
                <Text>5000000</Text>
              </Flex>
              <Flex
                py="10px"
                direction="column"
                borderBottom="3px dotted transparent"
              >
                <Text>Vesting Period</Text>
                <Text>1 month</Text>
              </Flex>
            </Stack>
          </Flex>
        </Flex>
      </Flex>
    </PageContainer>
  );
};
