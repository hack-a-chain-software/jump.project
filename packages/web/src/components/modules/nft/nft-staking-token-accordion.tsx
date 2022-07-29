import { motion } from "framer-motion";
import { InfoIcon } from "@/assets/svg";
import { ValueBox } from "@/components";
import { useTheme } from "@/hooks/theme";
import { Flex, Text, Grid, Image } from "@chakra-ui/react";

type Props = {
  select: any;
  selected: boolean;
  token: {
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
};

export function TokenAccordion({ token: { staked_meta, nft_id } }: Props) {
  const { jumpGradient, gradientBoxTopCard, glassyWhiteOpaque } = useTheme();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      key={"nft-staking-token-accordion" + nft_id}
    >
      <Flex width="100%" flexDirection="column">
        <Flex width="100%">
          {/* <TokenCard
            select={select}
            selected={selected}
            {...token}
          /> */}
          <Flex width="309px" height="298px">
            <Image
              width="100%"
              height="100%"
              borderRadius="20px"
              src={staked_meta.media}
            />
          </Flex>

          <Flex
            flexGrow="1"
            height="298px"
            marginLeft="20px"
            padding="3px"
            borderRadius="25px"
            background={useColorModeValue("transparent", jumpGradient)}
          >
            <Flex
              flexGrow="1"
              borderRadius="25px"
              boxSize="border-box"
              bg={useColorModeValue(jumpGradient, gradientBoxTopCard)}
            >
              <Flex
                flexGrow="1"
                borderRadius="25px"
                boxSize="border-box"
                flexDirection="column"
                padding="35px 39px 35px 39px"
                bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
              >
                <Flex marginBottom="25px" flexDirection="column">
                  <Text
                    color="white"
                    fontSize="20px"
                    fontWeight="700"
                    letterSpacing="-0.03em"
                  >
                    {staked_meta.description}
                  </Text>

                  <Text
                    color="white"
                    fontSize="24px"
                    fontWeight="600"
                    lineHeight="29px"
                  >
                    {staked_meta.title}
                  </Text>
                </Flex>

                <Grid
                  gap="15px"
                  width="100%"
                  gridTemplateColumns="repeat(auto-fill, 200px)"
                >
                  <ValueBox
                    color="white"
                    value="400 JUMP"
                    title="JUMP Rewards"
                    bottomText="Per Week"
                    borderColor={glassyWhiteOpaque}
                  />

                  <ValueBox
                    color="white"
                    value="80 ACOVA"
                    title="ACOVA Rewards"
                    bottomText="Per Week"
                    borderColor={glassyWhiteOpaque}
                  />

                  <ValueBox
                    color="white"
                    value="80 TRP"
                    title="TRP Rewards"
                    bottomText="Per Week"
                    borderColor={glassyWhiteOpaque}
                  />
                </Grid>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex
          width="100%"
          background="#EB5757"
          borderRadius="20px"
          minHeight="90px"
          alignItems="center"
          padding="0px 32px"
          margin="22px 0px 36px 0px"
        >
          <InfoIcon color="white" />

          <Text
            color="white"
            fontSize="20px"
            fontWeight="400"
            lineHeight="24px"
            marginLeft="16px"
          >
            This NFT is subject to an early withdraw penalty of 80%, wait until
            22 April, 2022 - 10:00 AM GMT to withdraw
          </Text>
        </Flex>
      </Flex>
    </motion.div>
  );
}
