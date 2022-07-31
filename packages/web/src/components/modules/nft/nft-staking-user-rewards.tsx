import { ValueBox } from "@/components";
import { Text, Flex, Grid } from "@chakra-ui/react";
import { useNearContractsAndWallet } from "@/context/near";
import { useNftStaking } from "@/stores/nft-staking-store";

export function NFTStakingUserRewards() {
  const { stakingInfo } = useNftStaking();
  const { wallet } = useNearContractsAndWallet();

  return (
    <Flex flex={1} direction="column">
      <Text fontWeight="800" fontSize={30} letterSpacing="-0.03em" mb={3}>
        Your Position:
      </Text>

      <Grid gap={3} gridTemplateColumns="1fr 1fr">
        {stakingInfo.stakingTokenRewards &&
          stakingInfo.stakingTokenRewards.map((token, index) => (
            <ValueBox
              key={"user-rewards-" + index}
              height="139px"
              title={`Your ${token.name} Rewards`}
              value={
                wallet?.isSignedIn()
                  ? `${token.userBalance || 0} ${token.symbol}`
                  : "Connect Wallet"
              }
              bottomText={`Your Total ${token.name} Rewards`}
            />
          ))}
      </Grid>
    </Flex>
  );
}
