import { TopCard, PageContainer, Button, VestingCard } from "@/components";
import { Tab, Listbox } from "@headlessui/react";
import { ContractData, Token } from "@/stores/vesting-store";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import WarningBar from "@/components/WarningBar";

type VestingComponentProps = {
  stepItems;
  accountId;
  selector;
  isLoading;
  loading;
  investorInfo;
  totalLocked;
  totalUnlocked;
  totalWithdrawn;
  filter;
  setFilter;
  withdraw;
  vestings;
  filtered;
};

function VestingComponent(props: VestingComponentProps) {
  const {
    stepItems,
    accountId,
    selector,
    isLoading,
    loading,
    investorInfo,
    totalLocked,
    totalUnlocked,
    totalWithdrawn,
    filter,
    setFilter,
    withdraw,
    vestings,
    filtered,
  } = props;

  function renderTab(selected: boolean, text: string) {
    return (
      <>
        <Button
          inline
          className={`${
            selected ? "font-bold" : "font-medium"
          } rounded-none h-auto text-4 leading-4 tracking-tight pb-2`}
        >
          {text}
        </Button>
        {selected && <hr className="h-1 mx-auto bg-violet border-none" />}
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
        <div className="relative w-[136px]">
          <Listbox.Button className="w-full flex justify-between">
            {options.reduce(
              (name: string, option) =>
                option.value === filter ? option.name : name,
              "All"
            )}
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Listbox.Button>
          <Listbox.Options>
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-default select-none p-2 ${
                    active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                  }`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.name}
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    );
  }

  function renderOptions() {
    return (
      <div className="flex justify-between">
        {renderListBox()}

        <Button
          onClick={() =>
            withdraw(
              filtered
                .filter(
                  ({ available_to_withdraw }) =>
                    Number(available_to_withdraw) >
                    Math.pow(10, investorInfo.token?.decimals || 0)
                )
                .map(({ id }) => String(id)),
              accountId,
              selector
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
        <WarningBar>
          To decrease the waiting time, you can get Fast Pass NFT. To read more,{" "}
          <a href="#">click here</a>.
        </WarningBar>
      </>
    );
  }

  function renderDashboardPanel(withdrawn: boolean) {
    //TODO Fix VestingCard
    return (
      <>
        {renderWarningBar()}
        {!withdrawn && renderOptions()}

        {vestings && (
          <div className="flex flex-wrap w-full gap-8 items-stretch">
            {/*{filtered.map((vesting, index) => (*/}
            {/*  <VestingCard*/}
            {/*    className="vesting-card"*/}
            {/*    {...vesting}*/}
            {/*    token={investorInfo.token as Token}*/}
            {/*    contractData={investorInfo.contractData as ContractData}*/}
            {/*    key={"VestingCard-" + index}*/}
            {/*  />*/}
            {/*))}*/}
          </div>
        )}
      </>
    );
  }

  return (
    <PageContainer>
      <TopCard
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
        <Tab.List className="space-x-2">
          <Tab className="outline-none">
            {({ selected }) => renderTab(selected, "Vesting period")}
          </Tab>
          <Tab className="outline-none">
            {({ selected }) => renderTab(selected, "Withdrawn")}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="outline-none">
            {renderDashboardPanel(false)}
          </Tab.Panel>
          <Tab.Panel className="outline-none">
            {renderDashboardPanel(true)}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </PageContainer>
  );
}

export default VestingComponent;
