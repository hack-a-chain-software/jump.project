import Big from "big.js";
import { Flex } from "@chakra-ui/react";
import { StatusEnum } from "@near/apollo";
import { TopCard, PreviewProjects } from "@/components";
import { Tutorial } from "@/components";

export function Index() {
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
      title: "Previews",
      element: ".previews",
      intro: (
        <div className="flex flex-col">
          <span>
            Here you can find some of the latest projects in different stages
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
      <Flex gap={5} className="flex-col lg:flex-row mb-[72px] relative">
        <Tutorial items={stepItems} />

        <TopCard
          gradientText="Token Launchpad "
          bigText="Jump Pad"
          bottomDescription="Jump Pad is a NEAR native token launchpad that empowers crypto currency projects with the ability to distribute tokens and raise capital from the community or private investors. "
          jumpLogo
        />
      </Flex>

      <div className="w-full previews">
        <PreviewProjects title="Sales in progress" status={StatusEnum.Open} />
        <PreviewProjects title="Upcoming sales" status={StatusEnum.Waiting} />
        <PreviewProjects title="Closed sales" status={StatusEnum.Closed} />
      </div>
    </div>
  );
}

export default Index;
