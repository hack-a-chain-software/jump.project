import { ValueBox, If } from "@/components";
import { Text, Flex, Grid, Skeleton } from "@chakra-ui/react";
import { useNftStaking } from "@/stores/nft-staking-store";
import { StakingToken } from "@near/ts";
import { useMemo } from "react";
import { formatNumber } from "@near/ts";
import isEmpty from "lodash/isEmpty";
import { useWalletSelector } from "@/context/wallet-selector";

export function NFTStakingUserRewards({
  rewards,
}: {
  rewards: StakingToken[];
}) {
  const { tokens } = useNftStaking();
  const { accountId } = useWalletSelector();

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
        <If
          fallback={
            <>
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  height="128px"
                  borderRadius={20}
                  endColor="rgba(255,255,255,0.3)"
                  key={"nft-staking-user-reward-" + i}
                />
              ))}
            </>
          }
          condition={!isEmpty(tokenRewads)}
        >
          {tokenRewads &&
            tokenRewads.map(
              ({ name, userBalance, decimals, symbol }, index) => (
                <ValueBox
                  key={"user-rewards-" + index}
                  height="139px"
                  title={`Your ${name} Rewards`}
                  value={
                    accountId
                      ? formatNumber(Number(userBalance), decimals) +
                        " " +
                        symbol
                      : "Connect Wallet"
                  }
                  bottomText={`Your Total ${name} Rewards`}
                />
              )
            )}
        </If>
      </Grid>
    </Flex>
  );
}
