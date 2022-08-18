import { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useLaunchPadProjectQuery } from "@near/apollo";
import { useNavigate, useParams } from "react-router";
import {
  DiscordIcon,
  TelegramIcon,
  TwitterIcon,
  WebIcon,
  WhitepaperIcon,
} from "../assets/svg";
import { BackButton } from "../components/shared/back-button";
import { useTheme } from "../hooks/theme";
import { useWalletSelector } from "@/context/wallet-selector";
import {
  If,
  ProjectInfo,
  ProjectStats,
  ProjectAbout,
  PageContainer,
  ProjectUserArea,
  ProjectAllocations,
} from "@/components";
import {
  useViewVestedAllocations,
  useViewInvestorAllowance,
  useViewInvestorAllocation,
  useViewTotalEstimatedInvestorAllowance,
} from "@/hooks/modules/launchpad";
import { useTokenBalance, useTokenMetadata } from "@/hooks/modules/token";

/**
 * @description - Launchpad project details page
 * @name Project
 */
export const Project = () => {
  const { id } = useParams();
  const { jumpGradient } = useTheme();
  const { accountId } = useWalletSelector();

  const navigate = useNavigate();

  const navigateToExternalURL = (uri: string) => {
    window.open(uri);
  };

  const {
    data: { launchpad_project: launchpadProject } = {},
    loading: loadingLaunchpadProject,
  } = useLaunchPadProjectQuery({
    variables: {
      accountId: accountId ?? "",
      projectId: id ?? "",
    },
    skip: !id,
  });

  const { data: investorAllocation, loading: loadingAllocation } =
    useViewInvestorAllocation(accountId!, id!);

  const { data: metadataPriceToken, loading: laodingPriceTokenMetadata } =
    useTokenMetadata(launchpadProject?.price_token!);

  const { data: metadataProjectToken, loading: loadingProjectToken } =
    useTokenMetadata(launchpadProject?.project_token!);

  const { data: vestedAllocations, loading: loadingVestedAllocations } =
    useViewVestedAllocations(accountId!, launchpadProject?.listing_id!);

  const { data: investorAllowance, loading: loadingAllowance } =
    useViewInvestorAllowance(accountId!, launchpadProject?.listing_id!);

  const { data: totalAllowanceData = "0", loading: loadingTotalAllowance } =
    useViewTotalEstimatedInvestorAllowance(accountId!);

  const { data: priceTokenBalance, loading: loadingPriceTokenBalance } =
    useTokenBalance(launchpadProject?.price_token!, accountId!);

  const isLoading = useMemo(
    () =>
      loadingAllocation ||
      loadingAllowance ||
      loadingProjectToken ||
      loadingTotalAllowance ||
      loadingLaunchpadProject ||
      loadingPriceTokenBalance ||
      loadingVestedAllocations ||
      laodingPriceTokenMetadata,
    [
      loadingAllowance,
      loadingAllocation,
      loadingProjectToken,
      loadingTotalAllowance,
      loadingLaunchpadProject,
      loadingPriceTokenBalance,
      loadingVestedAllocations,
      laodingPriceTokenMetadata,
    ]
  );

  return (
    <PageContainer>
      <BackButton onClick={() => navigate("/")} />

      <div className="grid grid-cols-12 gap-4">
        <ProjectInfo
          isLoading={isLoading}
          launchpadProject={launchpadProject!}
          metadataPriceToken={metadataPriceToken!}
        />

        <ProjectAbout
          isLoading={isLoading}
          launchpadProject={launchpadProject!}
        />

        <ProjectUserArea
          isLoading={isLoading}
          launchpadProject={launchpadProject!}
          vestedAllocations={vestedAllocations!}
          investorAllocation={investorAllocation}
          metadataProjectToken={metadataProjectToken!}
        />

        <ProjectAllocations
          isLoading={isLoading}
          launchpadProject={launchpadProject!}
          priceTokenBalance={priceTokenBalance!}
          totalAllowanceData={totalAllowanceData!}
          investorAllocation={investorAllocation!}
        />

        <ProjectStats
          isLoading={isLoading}
          launchpadProject={launchpadProject!}
          investorAllowance={investorAllowance!}
          investorAllocation={investorAllocation!}
          metadataPriceToken={metadataPriceToken!}
          metadataProjectToken={metadataProjectToken!}
        />
      </div>

      <Box
        bg={jumpGradient}
        p="30px"
        display="flex"
        flexWrap="wrap"
        gap={5}
        alignItems="center"
        justifyContent="space-between"
        borderRadius={20}
      >
        <Flex direction="column">
          <Text
            letterSpacing="-0.03em"
            mb="-5px"
            color="white"
            fontWeight="800"
          >
            Project
          </Text>
          <Text
            color="white"
            fontWeight="800"
            letterSpacing="-0.03em"
            fontSize="20px"
          >
            Social Networks
          </Text>
        </Flex>
        <Flex color="white" gap={1}>
          <If condition={!!launchpadProject?.discord}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() => navigateToExternalURL(launchpadProject?.discord!)}
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <DiscordIcon />
            </Flex>
          </If>
          <If condition={!!launchpadProject?.twitter}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() => navigateToExternalURL(launchpadProject?.twitter!)}
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <TwitterIcon />
            </Flex>
          </If>
          <If condition={!!launchpadProject?.telegram}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() => navigateToExternalURL(launchpadProject?.telegram!)}
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <TelegramIcon />
            </Flex>
          </If>

          <If condition={!!launchpadProject?.website}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() => navigateToExternalURL(launchpadProject?.website!)}
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <WebIcon />
            </Flex>
          </If>
          <If condition={!!launchpadProject?.whitepaper}>
            <Flex
              w="40px"
              h="40px"
              alignItems="center"
              justifyContent="center"
              bg="black"
              p="3px"
              borderRadius={10}
              onClick={() =>
                navigateToExternalURL(launchpadProject?.whitepaper!)
              }
              cursor="pointer"
              className="hover:bg-white hover:text-black"
            >
              <WhitepaperIcon />
            </Flex>
          </If>
        </Flex>
      </Box>
    </PageContainer>
  );
};
