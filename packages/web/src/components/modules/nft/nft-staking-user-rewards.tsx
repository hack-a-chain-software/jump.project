import { ValueBox } from "@/components";
import { Text, Flex, Grid } from "@chakra-ui/react";
import { useNearContractsAndWallet } from "@/context/near";
import { useNftStaking, StakingToken } from "@/stores/nft-staking-store";
import { useMemo } from "react";
import { formatNumber } from "@near/ts";

export function NFTStakingUserRewards({
  rewards,
}: {
  rewards: StakingToken[];
}) {
  const { tokens } = useNftStaking();
  const { wallet } = useNearContractsAndWallet();

  const tokenRewads = useMemo(() => {
    return rewards?.map((token) => {
      return {
        ...token,
        userBalance: tokens.reduce(
          (sum, { balance }) => sum + balance[token.account_id || ""],
          0
        ),
      };
    });
  }, [tokens, rewards]);

  return (
    <Flex flex={1} direction="column">
      <Text fontWeight="800" fontSize={30} letterSpacing="-0.03em" mb={3}>
        Your Position:
      </Text>

      <Grid gap={3} gridTemplateColumns="1fr 1fr">
        {tokenRewads &&
          tokenRewads.map(({ name, userBalance, decimals, symbol }, index) => (
            <ValueBox
              key={"user-rewards-" + index}
              height="139px"
              title={`Your ${name} Rewards`}
              value={
                wallet?.isSignedIn()
                  ? formatNumber(Number(userBalance), decimals) + " " + symbol
                  : "Connect Wallet"
              }
              bottomText={`Your Total ${name} Rewards`}
            />
          ))}
      </Grid>
    </Flex>
  );
}
