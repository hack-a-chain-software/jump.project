import BN from "bn.js";
import { useMemo, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckIcon, ArrowRightIcon } from "@/assets/svg";
import { ModalImageDialog, Button, If } from "@/components";
import { Flex, Text } from "@chakra-ui/react";
import { useWalletSelector } from "@/context/wallet-selector";
import { InvestorInfo } from "@/hooks/modules/launchpad";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { tokenMetadata } from "@/interfaces";
import { BigDecimalFloat } from "@near/ts";
import { CURRENCY_FORMAT_OPTIONS } from "@/constants";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export default function ({
  isOpen,
  onClose,
  investor,
  launchpadSettings,
  baseToken: { metadata, balance },
}: {
  isOpen: boolean;
  onClose: () => void;
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
  investor: InvestorInfo;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { selector, accountId } = useWalletSelector();

  const { increaseMembership } = useLaunchpadStore();

  const stakedTokens = useMemo(
    () => new BN(investor?.staked_token ?? 0),
    [investor?.staked_token]
  );

  const tiers = useMemo(
    () =>
      launchpadSettings?.tiers_minimum_tokens.map((t, index) => {
        const amount = new BN(t);

        return {
          amount,
          level: index + 1,
          disabled: amount.lte(stakedTokens),
        };
      }),
    [launchpadSettings, stakedTokens]
  );

  const onMaxLevel = useMemo(() => {
    return tiers?.every(({ disabled }) => disabled);
  }, [tiers]);

  const amountToSelectedLevel = useMemo(() => {
    return tiers?.find(({ level }) => level === selected!)?.amount!;
  }, [stakedTokens, tiers, selected]);

  const formatedAmountToSelectedLevel = useMemo(() => {
    return new BigDecimalFloat(
      amountToSelectedLevel ?? new BN(0),
      new BN(metadata?.decimals ?? 0).neg()
    ).toLocaleString("en", CURRENCY_FORMAT_OPTIONS);
  }, [metadata, amountToSelectedLevel, selected]);

  const isInsuficcientBalance = useMemo(() => {
    return new BN(balance ?? 0).lt(amountToSelectedLevel ?? new BN(0));
  }, [balance, amountToSelectedLevel]);

  const upgradeLevel = () =>
    increaseMembership(selected!, accountId!, selector);

  return (
    <ModalImageDialog
      image="https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
      isOpen={isOpen}
      title="Upgrade Level"
      minH="max-content"
      minW="800px"
      onClose={() => {
        setSelected(null);
        onClose();
      }}
      footer={
        !onMaxLevel && (
          <Button
            onClick={() => upgradeLevel()}
            bg="white"
            color="black"
            w="100%"
            disabled={!selected || isInsuficcientBalance}
          >
            Upgrade Now!
            <ArrowRightIcon />
          </Button>
        )
      }
      shouldBlurBackdrop
    >
      <Flex w="100%" direction="column">
        <Text color="white" marginTop="-12px" marginBottom="12px">
          Select level to upgrade
        </Text>

        <div>
          <RadioGroup value={selected} onChange={setSelected} className="my-2">
            <div className="flex space-x-[6px]">
              {!onMaxLevel &&
                tiers?.map(({ amount, level, disabled }) => (
                  <RadioGroup.Option
                    key={amount.toString()}
                    value={level}
                    disabled={disabled}
                    className={({ checked, disabled }) =>
                      classNames(
                        checked
                          ? "bg-gray-200 border-transparent text-black"
                          : "",
                        disabled
                          ? "opacity-[.6] cursor-not-allowed bg-white text-black"
                          : "cursor-pointer",
                        !checked && !disabled
                          ? "border-gray-200 text-gray-900 hover:bg-gray-300 bg-white"
                          : "",
                        "relative border rounded-[15px] p-3 flex items-center justify-center text-sm font-medium uppercase"
                      )
                    }
                  >
                    {({ checked }) => (
                      <RadioGroup.Label as="span" className="whitespace-nowrap">
                        <span children={"LVL " + level} />

                        {checked && (
                          <div className="absolute inset-0 w-full h-full rounded-[15px] flex items-center justify-center bg-transparent backdrop-blur-[2px]">
                            <CheckIcon className="text-black" />
                          </div>
                        )}
                      </RadioGroup.Label>
                    )}
                  </RadioGroup.Option>
                ))}
            </div>
          </RadioGroup>
        </div>

        {selected && (
          <>
            <div className="flex w-full space-x-[4px] pt-[12px]">
              <Text fontSize={18}>Next level: </Text>

              <Text fontSize={18} children={selected} fontWeight="semibold" />
            </div>

            <div className="flex w-full space-x-[4px] pb-[12px]">
              <Text fontSize={18}>Next level cost: </Text>

              <Text
                fontSize={18}
                children={
                  formatedAmountToSelectedLevel + " " + metadata?.symbol
                }
                fontWeight="semibold"
              />
            </div>
          </>
        )}

        {isInsuficcientBalance && (
          <div>
            <span className="text-[#EB5757]">Insufficient Balance</span>
          </div>
        )}

        {onMaxLevel && (
          <div>
            <span className="text-[#EB5757]">Already at maximum level</span>
          </div>
        )}
      </Flex>
    </ModalImageDialog>
  );
}
