import BN from "BN.js";
import { useMemo } from "react";
import { Card } from "@/components";
import { formatNumber } from "@near/ts";
import { tokenMetadata, launchpadProject } from "@/interfaces";
import { Flex, Skeleton, Image, Text } from "@chakra-ui/react";

export function ProjectInfo({
  isLoading,
  launchpadProject,
  metadataPriceToken,
}: {
  isLoading: boolean;
  launchpadProject: launchpadProject;
  metadataPriceToken: tokenMetadata;
}) {
  const finalPrice = useMemo(() => {
    if (!metadataPriceToken?.decimals && launchpadProject) {
      return "0";
    }

    return formatNumber(
      new BN(launchpadProject?.token_allocation_price ?? "0"),
      metadataPriceToken?.decimals!
    );
  }, [launchpadProject, metadataPriceToken?.decimals]);

  return (
    <Card className="col-span-12 lg:col-span-6">
      <Flex className="flex-col space-y-[8px] w-full">
        <Flex alignItems="center" mb="5px" gap={3}>
          <Skeleton
            className="w-[50px] h-[50px] rounded-full"
            isLoaded={!isLoading}
          >
            <Image
              className="w-[50px] h-[50px]"
              src={launchpadProject?.project_token_info?.image || ""}
            />
          </Skeleton>

          <Skeleton
            className="min-w-[200px] rounded-[16px]"
            isLoaded={!isLoading}
          >
            <Text
              fontWeight="800"
              fontFamily="Inter"
              letterSpacing="-0.06em"
              fontSize="30px"
              as="h1"
              color="white"
            >
              {finalPrice} {launchpadProject?.price_token_info?.symbol}
            </Text>
          </Skeleton>
        </Flex>
        <Skeleton
          className="w-full rounded-[16px] min-h-[60px]"
          isLoaded={!isLoading}
        >
          <Text
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="40px"
            as="h1"
          >
            {launchpadProject?.project_name}
          </Text>
        </Skeleton>

        <Skeleton
          className="w-full rounded-[16px] min-h-[30px]"
          isLoaded={!isLoading}
        >
          <Text
            fontWeight="500"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="20px"
            as="h1"
          >
            {launchpadProject?.description_token}
          </Text>
        </Skeleton>
      </Flex>
    </Card>
  );
}
