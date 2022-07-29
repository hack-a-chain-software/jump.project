import { Flex, Image, Text } from "@chakra-ui/react";

import { InfoIcon, CheckIcon } from "@/assets/svg";
import { useTheme } from "@/hooks/theme";

type Props = {
  metadata: {
    media: string;
    title?: string;
    description?: string;
  };
  select: Function;
  token_id: string;
  selected?: boolean;
};

export function TokenCard({
  metadata: { media, title, description },
  token_id,
  select = () => {},
  selected = false,
}: Props) {
  const { jumpGradient } = useTheme();

  return (
    <Flex
      borderRadius="20px"
      cursor="pointer"
      width="309px"
      height="298px"
      position="relative"
    >
      <Image
        width="100%"
        height="100%"
        borderRadius="20px"
        src={
          "https://img.freepik.com/premium-vector/hand-drawn-bored-ape-style-punk-nft-style-collection-bored-ape-yacht-club-nft-artwork_361671-260.jpg?w=2000"
        }
      />

      <Flex
        top="22px"
        right="22px"
        width="40px"
        height="40px"
        borderRadius="5px"
        position="absolute"
        alignItems="center"
        justifyContent="center"
        background={selected ? jumpGradient : "white"}
        onClick={(e) => {
          e.stopPropagation();

          select(token_id);
        }}
      >
        {selected && <CheckIcon color="white" />}
      </Flex>

      <Flex
        position="absolute"
        bottom="22px"
        left="22px"
        right="22px"
        height="76px"
        borderRadius="10px"
        background="#c4c4c466"
        backdropFilter="blur(100px)"
        padding="21px 18px"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex flexDirection="column" marginRight="12px">
          <Text
            color="#000000"
            lineHeight="15px"
            fontSize="12px"
            fontWeight="400"
            fontFamily="Inter"
            marginBottom="-3px"
          >
            {description}
          </Text>

          <Text
            color="#000000"
            lineHeight="19px"
            fontSize="16px"
            fontWeight="500"
            fontFamily="Inter"
          >
            {title}
          </Text>
        </Flex>

        <InfoIcon color={jumpGradient} width="24px" height="24px" />
      </Flex>
    </Flex>
  );
}
