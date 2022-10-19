import Big from "big.js";
import { Fragment, useMemo, useState } from "react";
import { useWalletSelector } from "@/context/wallet-selector";
import { InvestorInfo } from "@/hooks/modules/launchpad";
import { useLaunchpadStore } from "@/stores/launchpad-store";
import { tokenMetadata } from "@/interfaces";
import { Dialog, Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import { XIcon } from "@heroicons/react/solid";
import { Coins } from "@/assets/svg";

const tiersBadge = [
  {
    name: "No Tier",
    class: "no-tier",
  },
  {
    name: "Bronze",
    class: "bronze",
  },
  {
    name: "Silver",
    class: "silver",
  },
  {
    name: "Gold",
    class: "gold",
  },
  {
    name: "Tungsten",
    class: "tungsten",
  },
  {
    name: "Platinum",
    class: "platinum",
  },
  {
    name: "Diamond",
    class: "diamond",
  },
];

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
    () => new Big(investor?.staked_token ?? 0),
    [investor?.staked_token]
  );

  const tiers = useMemo(
    () =>
      launchpadSettings?.tiers_minimum_tokens.map((t, index) => {
        const amount = new Big(t);

        const level = index + 1;

        return {
          amount,
          level,
          allocations: level * 10,
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

  const decimals = useMemo(() => {
    return new Big(10).pow(metadata?.decimals ?? 0);
  }, [metadata]);

  const formatedAmountToSelectedLevel = useMemo(() => {
    return new Big(amountToSelectedLevel ?? 0).div(decimals).toFixed(2);
  }, [metadata, amountToSelectedLevel, selected]);

  const isInsuficcientBalance = useMemo(() => {
    return new Big(balance ?? 0).lt(amountToSelectedLevel ?? new Big(0));
  }, [balance, amountToSelectedLevel]);

  const upgradeLevel = () =>
    increaseMembership(selected!, accountId!, selector);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white px-[25px] py-[33px] rounded-[12px] max-w-[607px] w-full transition-all relative">
                <button
                  onClick={() => onClose()}
                  className="absolute right-[6px] top-[6px] hover:opacity-[0.6]"
                >
                  <XIcon className="text-[#0F172A] w-[24px] h-[24px]" />
                </button>
                <div className="flex flex-col items-start mb-[32px] px-[25px] py-[19px] w-full rounded-[20px] bg-[linear-gradient(90deg,#9795F0_0%,#FBC8D4_100%)] relative overflow-hidden">
                  <div className="mb-[16px]">
                    <span className="font-[800] text-[20px]">Tier Upgrade</span>
                  </div>

                  <div className="text-left">
                    <span className="font-[700] text-[14px] leading-[14px]">
                      Use xJUMPS to upgrade your tier and <br /> get more
                      allocations to join sales on early access.
                    </span>
                  </div>

                  <div className="absolute top-[-60px] right-[-80px]">
                    <Coins />
                  </div>
                </div>

                <div
                  className="
                    grid
                    mb-[31px]
                    place-items-start
                    gap-x-[18px] gap-y-[32px]
                    grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-2 web:grid-cols-3
                  "
                >
                  {(tiers || []).map(
                    ({ amount, level, disabled, allocations }, i) => (
                      <div
                        onClick={() => {
                          if (disabled) {
                            return;
                          }

                          setSelected(level);
                        }}
                        key={"tier-upgrade-modal-tier-" + i}
                        className={twMerge("items-start flex-col text-left", [
                          disabled && "opacity-[0.5] cursor-not-allowed",
                        ])}
                      >
                        <div className="px-[10px] py-[4px] rounded-[50px] bg-[linear-gradient(90deg,#510B72_0%,#740B0B_100%)] w-max mb-[8px]">
                          <span
                            className="font-[700] text-[14px] text-white"
                            children={
                              amount.div(decimals).toFixed(2) + metadata?.symbol
                            }
                          />
                        </div>

                        <div className="bg-white px-[25px] py-[20px] rounded-[12px] shadow-[0px_2px_10px_1px_rgba(152,73,156,0.25)]">
                          <div className="mb-[6px]">
                            <span
                              className="text-[#000000] font-[700] text-[14px]"
                              children={tiersBadge[level].name}
                            />
                          </div>

                          <div>
                            <span
                              className="text-[#431E5A] font-[800] text-[16px]"
                              children={allocations + " Allocations"}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex space-x-[11px] items-center mb-[32px]">
                  <div>
                    <span className="font-[700] text-[14px] text-[#000000]">
                      Your ballance:
                    </span>
                  </div>

                  <div>
                    <span
                      className="font-[700] text-[16px] text-[#000000]"
                      children={balance + metadata?.symbol}
                    />
                  </div>
                </div>

                <div className="mb-[8px]">
                  <button
                    onClick={() => upgradeLevel()}
                    disabled={onMaxLevel || !selected || isInsuficcientBalance}
                    className="rounded-[10px] bg-[linear-gradient(90deg,_#510B72_0%,_#740B0B_100%)] p-[12px] w-full disabled:opacity-[0.5] disabled:cursor-not-allowed"
                  >
                    <span className="font-[600] text-[16px] text-white">
                      Upgrade tier
                    </span>
                  </button>
                </div>

                <div className="flex items-center space-x-[11px] mb-[28px]">
                  <div>
                    <span className="font-[500] text-[14px] text-[#000000]">
                      Your new ballance:
                    </span>
                  </div>

                  <div>
                    <span className="font-[700] text-[14px] text-[#000000]">
                      24 xJUMP
                    </span>
                  </div>
                </div>

                <div className="px-[22px] py-[18px] rounded-[12px] shadow-[0px_2px_10px_1px_rgba(152,73,156,0.25)] bg-white text-left space-y-[4px]">
                  <div>
                    <span className="font-[700] text-[14px] text-[#000000]">
                      Your new tier
                    </span>
                  </div>

                  <div>
                    <span
                      className={twMerge(
                        "font-[800] text-[16px] leading-[19px] tracking-[-0.03em] bg-clip-text",
                        tiersBadge[6].class
                      )}
                      children={tiersBadge[6].name}
                    />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    // <ModalImageDialog
    //   image="https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
    //   isOpen={isOpen}
    //   title="Upgrade Level"
    //   minH="max-content"
    //   minW="800px"
    //   onClose={() => {
    //     setSelected(null);
    //     onClose();
    //   }}
    //   footer={
    //     !onMaxLevel && (
    //       <Button
    //         onClick={() => upgradeLevel()}
    //         bg="white"
    //         color="black"
    //         w="100%"
    //         disabled={!selected || isInsuficcientBalance}
    //       >
    //         Upgrade Now!
    //         <ArrowRightIcon />
    //       </Button>
    //     )
    //   }
    //   shouldBlurBackdrop
    // >
    //   <Flex w="100%" direction="column">
    //     <Text color="white" marginTop="-12px" marginBottom="12px">
    //       Select level to upgrade
    //     </Text>

    //     <div>
    //       <RadioGroup value={selected} onChange={setSelected} className="my-2">
    //         <div className="flex space-x-[6px]">
    //           {!onMaxLevel &&
    //             tiers?.map(({ amount, level, disabled }) => (
    //               <RadioGroup.Option
    //                 key={amount.toString()}
    //                 value={level}
    //                 disabled={disabled}
    //                 className={({ checked, disabled }) =>
    //                   classNames(
    //                     checked
    //                       ? "bg-gray-200 border-transparent text-black"
    //                       : "",
    //                     disabled
    //                       ? "opacity-[.6] cursor-not-allowed bg-white text-black"
    //                       : "cursor-pointer",
    //                     !checked && !disabled
    //                       ? "border-gray-200 text-gray-900 hover:bg-gray-300 bg-white"
    //                       : "",
    //                     "relative border rounded-[15px] p-3 flex items-center justify-center text-sm font-medium uppercase"
    //                   )
    //                 }
    //               >
    //                 {({ checked }) => (
    //                   <RadioGroup.Label as="span" className="whitespace-nowrap">
    //                     <span children={"LVL " + level} />

    //                     {checked && (
    //                       <div className="absolute inset-0 w-full h-full rounded-[15px] flex items-center justify-center bg-transparent backdrop-blur-[2px]">
    //                         <CheckIcon className="text-black" />
    //                       </div>
    //                     )}
    //                   </RadioGroup.Label>
    //                 )}
    //               </RadioGroup.Option>
    //             ))}
    //         </div>
    //       </RadioGroup>
    //     </div>

    //     {selected && (
    //       <>
    //         <div className="flex w-full space-x-[4px] pt-[12px]">
    //           <Text fontSize={18}>Next level: </Text>

    //           <Text fontSize={18} children={selected} fontWeight="semibold" />
    //         </div>

    //         <div className="flex w-full space-x-[4px] pb-[12px]">
    //           <Text fontSize={18}>Next level deposit: </Text>

    //           <Text
    //             fontSize={18}
    //             children={
    //               formatedAmountToSelectedLevel + " " + metadata?.symbol
    //             }
    //             fontWeight="semibold"
    //           />
    //         </div>
    //       </>
    //     )}

    //     {isInsuficcientBalance && (
    //       <div>
    //         <span className="text-[#EB5757]">Insufficient Balance</span>
    //       </div>
    //     )}

    //     {onMaxLevel && (
    //       <div>
    //         <span className="text-[#EB5757]">Already at maximum level</span>
    //       </div>
    //     )}
    //   </Flex>
    // </ModalImageDialog>
  );
}
