import * as R from "ramda";
import { Box, BoxProps, Flex, Image, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { useTheme } from "../../../hooks/theme";
import { ValueBox } from "../../shared";

type Props = {
  collectionName: string;
  collectionLogo: string;
  tokens: {
    name: string;
    ammount: string;
  }[];
  frequency?: "weekly" | "daily" | "monthly";
};

export function NFTStakingCard(props: Props & BoxProps) {
  const { jumpGradient, gradientBoxTopCard } = useTheme();

  const bottomText = useMemo(() => {
    switch (props.frequency) {
      case "daily":
        return "Per Day";

      case "weekly":
        return "Per Week";

      case "monthly":
        return "Per Month";
    }
  }, [props.frequency]);

  return (
    <Box
      cursor="pointer"
      p="3px"
      background={jumpGradient}
      borderRadius="26px"
      {...(R.omit(
        ["collectionName", "collectionLogo", "tokens", "frequency"],
        props
      ) as Record<string, string>)}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        p="60px"
        borderRadius="24px"
        bg={gradientBoxTopCard}
      >
        <Flex userSelect="none" direction="column">
          <Image
            src={props.collectionLogo}
            w="60px"
            h="60px"
            borderRadius={30}
          />
          <Text fontSize={34} fontWeight="800" letterSpacing="-0.03em">
            {props.collectionName}
          </Text>
          <Text
            w="500px"
            fontSize={18}
            fontWeight="600"
            letterSpacing="-0.03em"
          >
            Earn {props.tokens.map((e) => `${e.name}, `)} as rewards by staking
            on {props.collectionName} staking pool
          </Text>
        </Flex>
        <Flex gap={5}>
          {props.tokens.map((token, i) => (
            <ValueBox
              title={token.name + " Rewards"}
              value={token.ammount + " " + token.name}
              bottomText={bottomText}
              key={i}
            />
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

NFTStakingCard.defaultProps = {
  frequency: "monthly",
} as Props;
