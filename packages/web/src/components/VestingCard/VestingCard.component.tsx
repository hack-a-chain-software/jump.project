import * as R from "ramda";
import { format } from "date-fns";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { Button, ValueBox } from "@/components";
import { WalletIcon } from "@/assets/svg";
import { getUTCDate } from "@near/ts";
import { BuyFastPass } from "@/modals";
import { useTheme } from "@/hooks/theme";
import { VestingCardProps } from "@/components/VestingCard/VestingCard.container";

type VestingCardComponentProps = {
  containerProps: VestingCardProps;
  accountId;
  endAt;
  progress;
  selector;
  withdraw;
  showFastPass;
  setShowFastPass;
  baseTokenBalance;
  totalAmount;
  avaialbleToClaim;
  withdrawnAmount;
};

function VestingCardComponent(props: VestingCardComponentProps) {
  const {
    containerProps,
    accountId,
    endAt,
    progress,
    selector,
    withdraw,
    showFastPass,
    setShowFastPass,
    baseTokenBalance,
    totalAmount,
    avaialbleToClaim,
    withdrawnAmount,
  } = props;
  const { jumpGradient, gradientBoxTopCard, glassyWhiteOpaque } = useTheme();

  return (
    <Box
      color="white"
      p="3px"
      background={useColorModeValue("transparent", jumpGradient)}
      borderRadius="26px"
      {...(R.omit(
        [
          "id",
          "beneficiary",
          "locked_value",
          "start_timestamp",
          "vesting_duration",
          "fast_pass",
          "withdrawn_tokens",
          "available_to_withdraw",
          "token",
          "contractData",
        ],
        props.containerProps
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
          flexWrap="wrap"
          gap={5}
          bg={useColorModeValue(glassyWhiteOpaque, "transparent")}
        >
          <Flex direction="column">
            <Flex
              padding="9px 20px"
              background="white"
              rounded="30px"
              width="max-content"
              maxW="100%"
            >
              <Text color="black" fontSize="16px" fontWeight="700">
                {`Total amount - ${totalAmount} JUMP`}
              </Text>
            </Flex>

            <Flex marginTop="10px" flexDirection="column">
              <Text fontSize="24px" fontWeight="600" letterSpacing="-0.03em">
                {`Ends at ${format(endAt, "dd MMMM y")}`}
              </Text>

              <Text
                maxW="500px"
                fontSize="30px"
                fontWeight="800"
                letterSpacing="-0.03em"
              >
                {`${format(getUTCDate(), "dd MMMM y")} - Vesting`}
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

          <Flex
            gap={5}
            alignItems="center"
            flexGrow="1"
            maxWidth="840px"
            flexWrap="wrap"
          >
            <ValueBox
              minWidth="250px"
              borderColor={glassyWhiteOpaque}
              title="Available to Claim"
              value={`${avaialbleToClaim} ${containerProps.token?.symbol}`}
              bottomText="Unlocked amount"
            />

            <ValueBox
              minWidth="250px"
              borderColor={glassyWhiteOpaque}
              title="Claimed Amount"
              value={`${withdrawnAmount} ${containerProps.token?.symbol}`}
              bottomText="Withdrawn amount"
            />

            <Flex
              w="100%"
              maxW="300px"
              height="133px"
              flexDirection="column"
              justifyContent="space-evenly"
            >
              <Button
                disabled={
                  containerProps.fast_pass ||
                  baseTokenBalance === "0" ||
                  !accountId
                }
                full
                white
                className="flex justify-between p-4"
                onClick={() => setShowFastPass(true)}
              >
                {containerProps.fast_pass ? (
                  "Bought Fast Pass"
                ) : (
                  <>
                    Buy Fast Pass
                    <WalletIcon className="h-6" />
                  </>
                )}
              </Button>

              <Button
                disabled={
                  containerProps.available_to_withdraw === "0" || !accountId
                }
                full
                white
                className="flex justify-between p-4"
                onClick={async () => {
                  withdraw(
                    [String(containerProps.id)],
                    accountId as string,
                    selector
                  );
                }}
              >
                Withdraw Available Tokens
                <WalletIcon className="h-6" />
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>

      <BuyFastPass
        onClose={() => setShowFastPass(false)}
        isOpen={showFastPass}
        token={containerProps.token}
        vestingId={containerProps.id || ""}
        passCost={containerProps.contractData.fast_pass_cost}
        totalAmount={containerProps.locked_value}
        acceleration={Number(
          containerProps.contractData?.fast_pass_acceleration
        )}
      />
    </Box>
  );
}

export default VestingCardComponent;
