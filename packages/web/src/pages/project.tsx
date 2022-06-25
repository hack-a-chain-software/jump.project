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
import {
  Button,
  GradientButton,
  GradientText,
  PageContainer,
  TopCard,
  ValueBox,
} from "../components";
import { BackButton } from "../components/shared/back-button";
import { ProgressBar } from "../components/shared/progress-bar";
import { useTheme } from "../hooks/theme";

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
  const { jumpGradient, gradientBackground, gradientBoxTopCard } = useTheme();
  return (
    <PageContainer>
      <BackButton onClick={() => navigate("/")} />
      <Flex gap={5} justifyContent="space-between">
        <Box p="3px" background={jumpGradient} w="100%" borderRadius="26px">
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            w="100%"
            h="100%"
            p="40px"
            borderRadius="24px"
            bg={gradientBoxTopCard}
          >
            <Flex direction="column">
              <Text
                color="white"
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="24px"
                mb="-20px"
                as="h1"
                background={jumpGradient}
                style={
                  {
                    "-webkit-background-clip": "text",
                    "-webkit-text-fill-color": "transparent",
                    "text-fill-color": "transparent",
                  } as any
                }
              >
                0.012 USDC
              </Text>
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="50px"
                as="h1"
              >
                Polis
              </Text>
              <Text
                fontWeight="bold"
                letterSpacing="-0.03em"
                fontSize="16px"
                w="500px"
              >
                POLIS is the primary governance token of Star Atlas. Star Atlas
                is a grand strategy game that combines space exploration,
                territorial conquest, and political domination.
              </Text>
            </Flex>
          </Box>
        </Box>
        <Box p="3px" background={jumpGradient} w="200%" borderRadius="26px">
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            w="100%"
            h="100%"
            p="40px"
            borderRadius="24px"
            bg={gradientBoxTopCard}
          >
            <Flex direction="column">
              <Text
                color="white"
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="24px"
                mb="-20px"
                as="h1"
                background={jumpGradient}
                style={
                  {
                    "-webkit-background-clip": "text",
                    "-webkit-text-fill-color": "transparent",
                    "text-fill-color": "transparent",
                  } as any
                }
              >
                Project
              </Text>
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="50px"
                as="h1"
              >
                Stats
              </Text>
              <Flex justifyContent="space-between" gap="30px">
                <Flex direction="column">
                  <Text letterSpacing="-0,03em" fontWeight="bold" fontSize={24}>
                    <GradientText lineHeight={1}>
                      30,000,000
                      <Text as="strong" fontSize={12}>
                        ATLAS
                      </Text>
                    </GradientText>
                  </Text>
                  <Text fontSize={16}>Total Raise</Text>
                </Flex>
                <Flex direction="column">
                  <Text letterSpacing="-0,03em" fontWeight="bold" fontSize={24}>
                    <GradientText lineHeight={1}>
                      60
                      <Text as="strong" fontSize={12}>
                        USDC
                      </Text>
                    </GradientText>
                  </Text>
                  <Text fontSize={16}>Allocation per ticket</Text>
                </Flex>
                <Flex direction="column">
                  <Text letterSpacing="-0,03em" fontWeight="bold" fontSize={24}>
                    <GradientText lineHeight={1}>
                      300000
                      <Text as="strong" fontSize={12}>
                        Tickets
                      </Text>
                    </GradientText>
                  </Text>
                  <Text fontSize={16}>Total Tickets Deposited</Text>
                </Flex>
              </Flex>
              <Flex flex={1} pt="10px">
                <ProgressBar valuePercentage={80} />
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Flex>
      <Flex justifyContent="space-between">
        <Flex flex={1.1} p="20px" direction="column">
          <Text
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="40px"
            as="h1"
          >
            Description
          </Text>
          <Text>
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
          </Text>
        </Flex>
        <Box
          ml="20px"
          display="flex"
          flex={1.3}
          p="3px"
          background={jumpGradient}
          // minW="600px"
          borderRadius="26px"
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            w="100%"
            h="100%"
            p="40px"
            borderRadius="24px"
            bg={gradientBoxTopCard}
          >
            <Flex direction="column" flex={1}>
              <GradientText
                fontWeight="800"
                letterSpacing="-0,03em"
                fontSize={24}
              >
                Join Project
              </GradientText>
              <Text
                fontWeight="800"
                fontFamily="Inter"
                letterSpacing="-0.05em"
                fontSize="50px"
                marginTop="-20px"
                as="h1"
              >
                Star Atlas
              </Text>

              <Flex my="30px" gap="5px" direction="column">
                <Text>Tickets - 60 USDC Per Ticket</Text>
                <Input
                  bg="white"
                  color="black"
                  placeholder="Tickets"
                  type="number"
                  variant="filled"
                  _hover={{ bg: "white" }}
                  _focus={{ bg: "white" }}
                />
                <Text>You have 3 tickets available to deposit</Text>
              </Flex>

              <GradientButton justifyContent="space-between" w="100%">
                Connect Wallet
                <WalletIcon />
              </GradientButton>
            </Flex>
          </Box>
        </Box>
      </Flex>
      <Box
        bg={jumpGradient}
        p="30px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderRadius={20}
      >
        <Flex direction="column">
          <Text
            letterSpacing="-0.03em"
            mb="-5px"
            color="white"
            fontWeight="800"
          >
            Project
          </Text>
          <Text
            color="white"
            fontWeight="800"
            letterSpacing="-0.03em"
            fontSize="20px"
          >
            Social Networks
          </Text>
        </Flex>

        <Button px="50px" onClick={() => {}} bg="white" color="black">
          Learn More Here
        </Button>
      </Box>
    </PageContainer>
  );
};
