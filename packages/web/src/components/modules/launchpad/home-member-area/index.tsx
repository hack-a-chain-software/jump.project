import Big from "big.js";
import UpgradeModal from "./upgrade-modal";
import { useMemo, Fragment, useState } from "react";
import { Button, Card, IconButton } from "@/components";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { useWalletSelector } from "@/context/wallet-selector";
import { Flex, Text, Stack, Skeleton } from "@chakra-ui/react";
import { LockIcon, WalletIcon } from "@/assets/svg";
import { format, addMilliseconds, isBefore } from "date-fns";
import { InvestorInfo } from "@/hooks/modules/launchpad";
import { tokenMetadata } from "@/interfaces";
import { Steps } from "intro.js-react";

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
    () => new Big(investor?.staked_token ?? 0),
    [investor?.staked_token]
  );

  const minimumTokens = useMemo(
    () => launchpadSettings?.tiers_minimum_tokens.map((t) => new Big(t)),
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

  const decimals = useMemo(() => {
    return new Big(10).pow(metadata?.decimals ?? 0);
  }, [metadata?.decimals]);

  const formattedBalance = useMemo(() => {
    return stakedTokens.div(decimals).toFixed(2);
  }, [stakedTokens, decimals]);

  const [showSteps, setShowSteps] = useState(false);

  const stepItems = [
    {
      title: "Current Level",
      element: ".current-level",
      intro: (
        <div className="flex flex-col space-y-[8px]">
          <span>
            Level is increased based on the total coins you deposited.
          </span>

          <span>Ex: if you stake 1 xpJump, your level will be 1.</span>
        </div>
      ),
    },
    {
      title: "Staked xJump",
      element: ".staked-xjump",
      intro: <span>Your total amount staked on xJump.</span>,
    },
    {
      title: "Base Allowance",
      element: ".base-allowance",
      intro: (
        <div className="flex flex-col space-y-[8px]">
          <span>
            Allowances are consumed when you invest in vesting campaigns.
          </span>

          <span>
            The higher your level, the greater the number of allocations
            available to use in projects.
          </span>
        </div>
      ),
    },
    {
      title: "Upgrade Button",
      element: ".upgrade-button",
      intro: <span>Action button to open upgrade modal.</span>,
    },
    {
      title: "Withdraw Button",
      element: ".withdraw-button",
      intro: (
        <div className="flex flex-col space-y-[8px]">
          <span>
            Action button to withdraw all staked xJump tokens and return to
            level 0.
          </span>

          <span className="font-[600]">
            Will be available at the end of lock period
          </span>
        </div>
      ),
    },
  ];

  return (
    <Card
      minWidth="315px"
      className="lg:flex-grow lg:max-w-[500px] member-area relative"
    >
      <div className="absolute right-[24px] top-[24px]">
        <IconButton onClick={() => setShowSteps(true)} />
      </div>

      <Steps
        enabled={showSteps}
        steps={stepItems}
        initialStep={0}
        onExit={() => setShowSteps(false)}
        options={{
          showProgress: false,
          showBullets: false,
          scrollToElement: false,
        }}
      />

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
                    <div className="flex justify-between w-full current-level relative">
                      <Text fontSize={18}>Current Level</Text>

                      <Text
                        fontSize={18}
                        children={"LVL " + level}
                        fontWeight="semibold"
                      />
                    </div>

                    <div className="flex justify-between w-full staked-xjump relative">
                      <Text>Staked xJump</Text>

                      <Text
                        fontSize={18}
                        fontWeight="semibold"
                        children={formattedBalance + " " + metadata?.symbol}
                      />
                    </div>

                    <div className="flex justify-between w-full base-allowance relative">
                      <Text>Base Allowance</Text>

                      <Text
                        fontSize={18}
                        fontWeight="semibold"
                        children={
                          new Big(totalAllowance ?? 0).toFixed(2) +
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
                className="upgrade-button relative"
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
                className="text-center withdraw-button relative"
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
