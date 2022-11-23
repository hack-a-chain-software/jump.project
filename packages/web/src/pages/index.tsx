import { Flex } from "@chakra-ui/react";
import { StatusEnum } from "@near/apollo";
import { TopCard, PreviewProjects } from "@/components";
import { Tutorial } from "@/components";
import PageContainer from "@/components/PageContainer";

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

  return (
    <PageContainer>
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
    </PageContainer>
  );
}

export default Index;
