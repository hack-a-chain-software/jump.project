import * as R from "ramda";
import { format, differenceInMilliseconds } from "date-fns";
import { Box, BoxProps, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { Button, ValueBox } from "@jump/src/components";

import { WalletIcon } from "@jump/src/assets/svg";

import { useTheme } from "../../../hooks/theme";
import { useMemo, useState } from "react";
import { formatNumber } from "@near/ts";
import { getNear } from "@jump/src/hooks/near";
import { useNearQuery } from "react-near";
import { useVestingStore } from "@jump/src/stores/vesting-store";
import { WalletConnection } from "near-api-js";
import { BuyFastPass } from "@jump/src/modals";

type Token = {
  decimals: number;
  symbol: string;
};

type Props = {
  id: String;
  endsAt: Date;
  token: Token;
  contract: any;
  createdAt: Date;
  fast_pass: boolean;
  totalAmount: number;
  withdrawnTokens: number;
  availableWidthdraw: number;
};

export function VestingCard(props: Props & BoxProps) {
  const { jumpGradient, gradientBoxTopCard, glassyWhite, glassyWhiteOpaque } =
    useTheme();

  const progress = useMemo(() => {
    const ends = props.endsAt || new Date();
    const start = props.createdAt || new Date();
    const today = new Date();
    const base = differenceInMilliseconds(ends, start);
    const current = differenceInMilliseconds(today, start) * 100;

    return Math.round(current / base);
  }, [props.endsAt, props.createdAt]);

  const { user, wallet } = getNear(import.meta.env.VITE_LOCKED_CONTRACT);

  const { withdraw, fastPass } = useVestingStore();

  const { data: storage } = useNearQuery("storage_balance_of", {
    contract: "jump_token.testnet",
    variables: {
      account_id: user.address,
    },
    skip: !user.isConnected,
  });

  const [showFastPass, setShowFastPass] = useState(false);

  return (
    <Box
      color="white"
      cursor="pointer"
      p="3px"
      background={useColorModeValue("transparent", jumpGradient)}
      borderRadius="26px"
      {...(R.omit(
        [
          "id",
          "totalAmount",
          "createdAt",
          "endsAt",
          "withdrawnTokens",
          "token",
          "fast_pass",
          "contract",
          "availableWidthdraw",
        ],
        props
      ) as Record<string, string>)}
    >
      <Box
        w="100%"
        bg={useColorModeValue(jumpGradient, gradientBoxTopCard)}
        borderRadius="24px"
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          w="100%"
          p="40px"
          borderRadius="24px"
          bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
        >
          <Flex userSelect="none" direction="column">
            <Flex
              padding="9px 20px"
              background="white"
              rounded="30px"
              width="max-content"
            >
              <Text color="black" fontSize="14px" fontWeight="700">
                {`Total amount - ${formatNumber(
                  props.totalAmount,
                  props.token.decimals
                )} JUMP`}
              </Text>
            </Flex>

            <Flex marginTop="10px" flexDirection="column">
              <Text fontSize="20px" fontWeight="600" letterSpacing="-0.03em">
                {`Ends at ${format(props.endsAt, "dd MMMM y")}`}
              </Text>

              <Text
                w="500px"
                fontSize="30px"
                fontWeight="800"
                letterSpacing="-0.03em"
              >
                {`${format(new Date(), "dd MMMM y")} - Vesting`}
              </Text>
            </Flex>

            <Flex
              flex="1"
              marginTop="13px"
              rounded="100px"
              bg="rgba(255, 255, 255, 0.38)"
            >
              <Flex
                height="10px"
                rounded="100px"
                bg={jumpGradient}
                width={progress + "%"}
              />
            </Flex>
          </Flex>

          <Flex gap={5} alignItems="center">
            <ValueBox
              borderColor={glassyWhiteOpaque}
              title="Available to Claim"
              value={`${formatNumber(
                props.availableWidthdraw,
                props.token.decimals
              )} ${props.token.symbol}`}
              bottomText="Unlocked amount"
            />

            <ValueBox
              borderColor={glassyWhiteOpaque}
              title="Claimed Amount"
              value={`${formatNumber(
                props.withdrawnTokens,
                props.token.decimals
              )} ${props.token.symbol}`}
              bottomText="Withdrawn amount"
            />

            <Flex
              width="300px"
              height="133px"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Button
                disabled={props.fast_pass}
                onClick={() => setShowFastPass(true)}
              >
                <Flex
                  width="100%"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  Buy Fast Pass
                  <WalletIcon />
                </Flex>
              </Button>

              <Button
                disabled={
                  props.availableWidthdraw <= Math.pow(10, props.token.decimals)
                }
                onClick={() =>
                  withdraw("0", storage, wallet as WalletConnection)
                }
              >
                <Flex
                  width="100%"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  Withdraw Available Tokens
                  <WalletIcon />
                </Flex>
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>

      <BuyFastPass
        onClose={() => setShowFastPass(false)}
        isOpen={showFastPass}
        storage={storage}
        token={props.token}
        vestingId={props.id}
        totalAmount={props.totalAmount}
        acceleration={props.contract.fast_pass_acceleration}
      />
    </Box>
  );
}
