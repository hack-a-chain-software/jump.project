import {
  TopCard,
  PageContainer,
  Button,
  VestingCard,
  Empty,
  TutorialItemInterface,
} from "@/components";
import { Tab, Listbox, Transition } from "@headlessui/react";
import {
  ContractData,
  InvestorInfo,
  Token,
  Vesting,
} from "@/stores/vesting-store";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import WarningBar from "@/components/WarningBar";
import { WalletSelector } from "@near-wallet-selector/core";
import { FilterOption } from "@/pages/vesting/index";

type VestingComponentProps = {
  stepItems: TutorialItemInterface[];
  accountId: string | null;
  selector: WalletSelector | null;
  loading: boolean;
  investorInfo: Partial<InvestorInfo>;
  totalLocked: string; // Big
  totalUnlocked: string; // Big
  totalWithdrawn: string; // Big
  filter: FilterOption;
  setFilter: (filter: FilterOption) => void;
  withdraw: (
    vestings: string[],
    accountId: string,
    connection: WalletSelector
  ) => Promise<void>;
  filtered: Vesting[];
  connectWallet: () => void;
};

function VestingComponent(props: VestingComponentProps) {
  const {
    stepItems,
    accountId,
    selector,
    loading,
    investorInfo,
    filter,
    setFilter,
    withdraw,
    filtered,
    connectWallet,
  } = props;

  function renderTab(selected: boolean, text: string) {
    return (
      <>
        <Button
          inline
          className={`${
            selected ? "font-bold" : "font-medium"
          } rounded-none h-auto text-4 leading-4 tracking-tight pb-2 px-0`}
        >
          {text}
        </Button>
        {selected && <hr className="h-1 mx-auto bg-violet border-none z-10" />}
      </>
    );
  }

  function renderListBox() {
    const options = [
      {
        name: "All",
        value: "all",
      },
      {
        name: "In Progress",
        value: "running",
      },
      {
        name: "Finished",
        value: "complete",
      },
    ];

    return (
      <Listbox value={filter} onChange={setFilter}>
        {({ open }) => (
          <div className="relative w-[136px] h-10">
            <Listbox.Button className="w-full flex justify-between pt-2 pb-3 pl-4 pr-3 bg-white-600 rounded-sm font-normal text-3.5 leading-5 tracking-normal">
              {options.reduce(
                (name: string, option) =>
                  option.value === filter ? option.name : name,
                "All"
              )}
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-all ${
                  open ? "rotate-180 mt-[1px]" : "rotate-0"
                }`}
                aria-hidden="true"
              />
            </Listbox.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-90 translate-y-[-10%] opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-90 translate-y-[-10%] opacity-0"
            >
              <Listbox.Options className="bg-white rounded-sm mt-2 p-2 flex flex-col gap-1">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className="relative hover:bg-[#D6B8D8] cursor-default select-none py-2.5 px-4 rounded-sm font-medium text-3.5 leading-4.5 tracking-normal text-black"
                    value={option.value}
                  >
                    {option.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    );
  }

  function renderOptions() {
    return (
      <div className="flex justify-between">
        {renderListBox()}

        <Button
          className="w-[134px]"
          disabled={!accountId || !filtered.length}
          onClick={() =>
            withdraw(
              filtered
                .filter(
                  ({ available_to_withdraw }) =>
                    Number(available_to_withdraw) >
                    Math.pow(10, investorInfo.token?.decimals || 0)
                )
                .map(({ id }) => String(id)),
              accountId ? accountId : "",
              selector ? selector : ({} as WalletSelector)
            )
          }
        >
          Claim All
        </Button>
      </div>
    );
  }

  function renderWarningBar() {
    //TODO Implement onClick
    return (
      <>
        <WarningBar className="mt-[-.375rem]">
          {!accountId ? "Connect your wallet to see rewards." : ""}
          {(filter === "all" || filter === "running") && !filtered.length ? (
            "You need to claim NFT Staking Pools rewards to earn LOCKED JUMP"
          ) : (
            <></>
          )}
          {filter === "complete" && !filtered.length ? (
            "You need to claim NFT Staking Pools rewards to earn LOCKED JUMP"
          ) : (
            <></>
          )}
          {filter === "withdrawn" ? (
            "All your rewards available to withdraw, after the end of the vesting period will be here."
          ) : (
            <></>
          )}
          {filter !== "withdrawn" && filtered.length ? (
            <>
              To decrease the waiting time, you can get Fast Pass NFT. To read
              more,&nbsp;
              <a
                href="#"
                className="border-white border-b-[1px] hover:border-none"
              >
                click here.
              </a>
            </>
          ) : (
            <></>
          )}
        </WarningBar>
      </>
    );
  }

  function renderEmpty() {
    return (
      <>
        {!accountId ? (
          <Empty className="pt-8 pb-32 px-6 h-min gap-y-6">
            <h2 className="text-6 font-extrabold tracking-tight leading-6">
              Connect your Wallet
            </h2>
            <Button white onClick={connectWallet} big>
              Connect Wallet
            </Button>
          </Empty>
        ) : (
          <></>
        )}
        {(filter === "all" || filter === "running") && !filtered.length ? (
          <Empty className="pt-8 pb-32 h-min w-full items-start">
            <p>It seems you don’t have rewards in vesting period.</p>
          </Empty>
        ) : (
          <></>
        )}
        {filter === "complete" && !filtered.length ? (
          <Empty className="pt-8 pb-32 h-min w-full items-start">
            <p>It seems you don’t have completed rewards to withdraw</p>
          </Empty>
        ) : (
          <></>
        )}
        {filter === "withdrawn" && !filtered.length ? (
          <Empty className="pt-8 pb-32 h-min w-full items-start">
            <p>It seems you still don’t have rewards withdrawn</p>
          </Empty>
        ) : (
          <></>
        )}
      </>
    );
  }

  function renderDashboardPanel() {
    return (
      <>
        {renderWarningBar()}
        {filter !== "withdrawn" ? renderOptions() : <></>}

        {renderEmpty()}

        {!loading && filtered.length ? (
          <div className="flex flex-wrap w-full gap-8 items-stretch">
            {filtered.map((vesting, index) => (
              <VestingCard
                className="vesting-card"
                {...vesting}
                token={investorInfo.token as Token}
                contractData={investorInfo.contractData as ContractData}
                key={"VestingCard-" + index}
              />
            ))}
          </div>
        ) : (
          <></>
        )}
      </>
    );
  }

  return (
    <PageContainer>
      <TopCard
        transparent
        gradientText="Jump Vesting"
        bigText="Unlock and claim JUMP rewards"
        bottomDescription="Claim your JUMP and boost the rate of vested rewards."
        stepItems={stepItems}
      />

      <Tab.Group
        onChange={(index) =>
          index === 0 ? setFilter("all") : setFilter("withdrawn")
        }
      >
        <Tab.List className="flex gap-x-10 relative">
          <Tab className="outline-none">
            {({ selected }) => renderTab(selected, "Vesting period")}
          </Tab>
          <Tab className="outline-none">
            {({ selected }) => renderTab(selected, "Withdrawn")}
          </Tab>
          <hr className="absolute inset-[-1.5rem] bottom-0 top-auto bg-white-600 w-[calc(100%_+_3rem)] z-0" />
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="outline-none flex flex-col gap-8">
            {renderDashboardPanel()}
          </Tab.Panel>
          <Tab.Panel className="outline-none flex flex-col gap-8">
            {renderDashboardPanel()}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </PageContainer>
  );
}

export default VestingComponent;
