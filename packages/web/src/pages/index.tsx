import Big from "big.js";
import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { StatusEnum } from "@near/apollo";
import { TopCard, PreviewProjects } from "@/components";
import { Steps } from "intro.js-react";

export function Index() {
  const [showSteps, setShowSteps] = useState(false);

  const stepItems = [
    {
      element: ".launchpad",
      title: "Launchpad",
      intro: (
        <div>
          <span>
            Jump launchpad is a page where you can stake your xJump, receive
            allocations and invest in crypto projects.
          </span>
        </div>
      ),
    },
    {
      title: "Member Area",
      element: ".member-area",
      intro: (
        <div className="flex flex-col">
          <span className="mb-2">This is member area.</span>

          <span>
            In this section you can stake your xJump tokens, watch your level,
            check the amount of staked tokens and the total of your allocations.
          </span>
        </div>
      ),
    },
    {
      title: "Projects",
      element: ".table-projects",
      intro: (
        <div className="flex flex-col">
          <span>
            Here are all the projects that have vesting programs that you can
            invest with your allocations
          </span>
        </div>
      ),
    },
  ];

  const formatBig = (value, decimals) => {
    const decimalsBig = new Big(10).pow(Number(decimals) ?? 0);

    return new Big(value ?? 0).div(decimalsBig);
  };

  return (
    <div className="relative flex-col p-[30px] w-full overflow-hidden pt-[150px]">
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

      <Flex gap={5} className="flex-col lg:flex-row mb-[72px]">
        <TopCard
          gradientText="Launchpad "
          bigText="Welcome to Jump Pad"
          bottomDescription="Jump Pad is a NEAR native token launchpad that empowers crypto currency projects with the ability to distribute tokens and raise capital from the community or private investors for raise liquidity. "
          jumpLogo
          onClick={() => setShowSteps(true)}
        />
      </Flex>

      <div className="w-full">
        <PreviewProjects title="Sales in progress" status={StatusEnum.Open} />
        <PreviewProjects title="Upcoming sales" status={StatusEnum.Waiting} />
        <PreviewProjects title="Closed sales" status={StatusEnum.Closed} />
      </div>
    </div>
  );
}

export default Index;
