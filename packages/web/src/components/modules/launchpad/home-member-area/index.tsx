import BN from "bn.js";
import UpgradeModal from "./upgrade-modal";
import { useMemo, Fragment, useState } from "react";
import { Button, Card } from "@/components";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";
import { Flex, Text, Stack, Skeleton } from "@chakra-ui/react";
import { formatNumber } from "@near/ts";
import { LockIcon, WalletIcon } from "@/assets/svg";
import { format, addMilliseconds, isBefore } from "date-fns";
import { InvestorInfo } from "@/hooks/modules/launchpad";
import { BigDecimalFloat } from "@near/ts";
import { tokenMetadata } from "@/interfaces";
import { CURRENCY_FORMAT_OPTIONS } from "@/constants";

export function MemberArea({
  isLoaded,
  investor,
  totalAllowance,
  launchpadSettings,
  baseToken: { metadata, balance },
}: {
  isLoaded: boolean;
  investor: InvestorInfo;
  totalAllowance: string;
  launchpadSettings: {
    membership_token: string;
    token_lock_period: string;
    tiers_minimum_tokens: string[];
    tiers_entitled_allocations: string[];
    allowance_phase_2: string;
    partner_dex: string;
  };
  baseToken: {
    metadata: tokenMetadata;
    balance: string;
  };
}) {
  const { accountId, selector } = useWalletSelector();
  const { decreaseMembership } = useLaunchpadStore();

  const [showModal, setShowModal] = useState(false);

  const stakedTokens = useMemo(
    () => new BN(investor?.staked_token ?? 0),
    [investor?.staked_token]
  );

  const minimumTokens = useMemo(
    () => launchpadSettings?.tiers_minimum_tokens.map((t) => new BN(t)),
    [launchpadSettings]
  );

  const level = useMemo(() => {
    const metLevels = minimumTokens?.filter((tokenAmount) =>
      tokenAmount.lte(stakedTokens)
    );

    return metLevels?.length ?? 0;
  }, [minimumTokens, stakedTokens]);

  const downgradeLevel = () => {
    decreaseMembership(0, accountId!, selector);
  };

  const lastCheck = useMemo(() => {
    return new Date(Number(investor?.last_check!) / 1_000_000);
  }, [investor]);

  const endVesting = useMemo(() => {
    return addMilliseconds(
      lastCheck,
      Number(launchpadSettings?.token_lock_period) / 1_000_000
    );
  }, [launchpadSettings]);

  const isLocked = useMemo(() => {
    const now = new Date();

    return isBefore(now, endVesting);
  }, [investor, launchpadSettings]);

  const formattedBalance = useMemo(() => {
    return new BigDecimalFloat(
      stakedTokens ?? new BN(0),
      new BN(metadata?.decimals ?? 0).neg()
    ).toLocaleString("en", CURRENCY_FORMAT_OPTIONS);
  }, [metadata, stakedTokens]);

  return (
    <Card minWidth="315px" className="lg:flex-grow lg:max-w-[500px]">
      <Flex w="100%" h="100%" flexDirection="column">
        <Text
          justifyContent="space-between"
          fontSize={22}
          fontWeight="900"
          pb="5"
        >
          Member Area
        </Text>

        <Stack>
          <Skeleton
            flex={1}
            width="100%"
            borderRadius="18px"
            isLoaded={isLoaded}
            endColor="rgba(255,255,255,0.3)"
          >
            <Flex direction="column" flex={1} mt={5}>
              <Flex
                mb="5px"
                flexWrap="wrap"
                justifyContent="space-between"
                className="space-y-[8px]"
                flex={1}
              >
                {accountId ? (
                  <>
                    <div className="flex justify-between w-full">
                      <Text fontSize={18}>Current Level</Text>

                      <Text
                        fontSize={18}
                        children={"LVL " + level}
                        fontWeight="semibold"
                      />
                    </div>

                    <div className="flex justify-between w-full">
                      <Text>Staked xJump</Text>

                      <Text
                        fontSize={18}
                        fontWeight="semibold"
                        children={formattedBalance + " " + metadata?.symbol}
                      />
                    </div>

                    <div className="flex justify-between w-full">
                      <Text>Base Allowance</Text>

                      <Text
                        fontSize={18}
                        fontWeight="semibold"
                        children={
                          formatNumber(new BN(totalAllowance ?? 0), 0) +
                          " Allocations"
                        }
                      />
                    </div>
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Flex>
            </Flex>
          </Skeleton>

          <div className="mt-[25px] space-y-[12px] md:space-y-0 md:flex md:space-x-[12px]">
            <Skeleton
              flex={1}
              width="100%"
              borderRadius="18px"
              isLoaded={isLoaded}
              endColor="rgba(255,255,255,0.3)"
            >
              <Button
                onClick={() => setShowModal(!showModal)}
                disabled={!accountId}
                w="100%"
                bg="white"
                color="black"
                justifyContent="space-between"
              >
                Upgrade Level
                {(launchpadSettings?.tiers_minimum_tokens.length ?? 0) <=
                level ? (
                  <LockIcon />
                ) : (
                  <WalletIcon />
                )}
              </Button>
            </Skeleton>

            <Skeleton
              flex={1}
              width="100%"
              borderRadius="18px"
              isLoaded={isLoaded}
              endColor="rgba(255,255,255,0.3)"
            >
              <Button
                w="100%"
                bg="transparent"
                border="1px solid white"
                color="white"
                onClick={downgradeLevel}
                justifyContent="space-between"
                disabled={!level || isLocked || !accountId}
                className="text-center"
              >
                {isLocked ? (
                  <span
                    children={format(endVesting, "MM/dd/yyyy HH:mm")}
                    className="block mx-auto"
                  />
                ) : (
                  <Fragment>
                    Withdraw Tokens
                    {!!level ? <WalletIcon /> : <LockIcon />}
                  </Fragment>
                )}
              </Button>
            </Skeleton>
          </div>
        </Stack>
      </Flex>

      <UpgradeModal
        isOpen={showModal}
        investor={investor}
        baseToken={{ metadata, balance }}
        launchpadSettings={launchpadSettings}
        onClose={() => setShowModal(!showModal)}
      />
    </Card>
  );
}
