import BN from "bn.js";
import { useMemo } from "react";
import { Card } from "@/components";
import { formatNumber } from "@near/ts";
import { Flex, Text, Skeleton } from "@chakra-ui/react";
import { useWalletSelector } from "@/context/wallet-selector";

const CONNECT_WALLET_MESSAGE = "Connect wallet";

export function ProjectStats({
  isLoading,
  launchpadProject,
  investorAllowance,
  investorAllocation,
  metadataPriceToken,
  metadataProjectToken,
}: {
  isLoading: boolean;
  launchpadProject: any;
  investorAllocation: any;
  investorAllowance: any;
  metadataPriceToken: any;
  metadataProjectToken: any;
}) {
  const { accountId } = useWalletSelector();

  const formatDate = (start_timestamp?: string) => {
    const date = new Date(Number(start_timestamp ?? "0"));

    return date.toLocaleDateString();
  };

  const totalRaise = useMemo(() => {
    const {
      total_amount_sale_project_tokens = "",
      token_allocation_price = "",
      token_allocation_size = "",
    } = launchpadProject || {};

    const totalAmount = new BN(total_amount_sale_project_tokens!);
    const allocationPrice = new BN(token_allocation_price!);
    const allocationSize = new BN(token_allocation_size || "1");

    return totalAmount.mul(allocationPrice).div(allocationSize);
  }, [launchpadProject]);

  const stats = useMemo(() => {
    return {
      price: {
        name: "Price",
        items: [
          {
            label: "Total raise (in price token)",
            value: formatNumber(totalRaise, metadataPriceToken?.decimals ?? 0),
          },
          {
            label: "Project tokens for sale",
            value: formatNumber(
              new BN(launchpadProject?.total_amount_sale_project_tokens ?? "0"),
              metadataProjectToken?.decimals ?? 0
            ),
          },
          {
            label: "Allocation size",
            value: formatNumber(
              new BN(launchpadProject?.token_allocation_size ?? "0"),
              metadataProjectToken?.decimals ?? 0
            ),
          },
          {
            label: "How many allocations you can still buy",
            value: accountId ? investorAllowance! : CONNECT_WALLET_MESSAGE,
          },
          {
            label: "How many allocations you already bought",
            value: accountId
              ? investorAllocation.allocationsBought ?? "0"
              : CONNECT_WALLET_MESSAGE,
          },
          {
            label: "Total allocations bought / total allocations",
            value:
              formatNumber(
                new BN(launchpadProject?.allocations_sold ?? "0").div(
                  new BN(
                    launchpadProject?.total_amount_sale_project_tokens ?? "1"
                  )
                ),
                metadataProjectToken?.decimals ?? 0
              ) + "%",
          },
        ],
      },
      vesting: {
        name: "Vesting",
        items: [
          {
            label: "Start sale date",
            value: formatDate(launchpadProject?.open_sale_1_timestamp!),
          },
          {
            label: "Start sale phase 2 date",
            value: formatDate(launchpadProject?.open_sale_2_timestamp!),
          },
          {
            label: "End sale date",
            value: formatDate(launchpadProject?.final_sale_2_timestamp!),
          },
          {
            label: "DEX Launch date",
            value: formatDate(launchpadProject?.liquidity_pool_timestamp!), // TODO
          },
          {
            label: "Vesting initial release %",
            value: launchpadProject?.fraction_instant_release + "%",
          },
          {
            label: "Vesting cliff release %",
            value: launchpadProject?.fraction_cliff_release + "%",
          },
          {
            label: "Vesting final release %",
            value:
              100 -
              Number?.parseInt(
                launchpadProject?.fraction_instant_release || "0"
              ) -
              Number?.parseInt(
                launchpadProject?.fraction_cliff_release || "0"
              ) +
              "%",
          },
          {
            label: "Vesting cliff launchpadProject date",
            value: formatDate(launchpadProject?.cliff_timestamp!),
          },
          {
            label: "Vesting cliff end date",
            value: formatDate(launchpadProject?.end_cliff_timestamp!),
          },
        ],
      },
    };
  }, [launchpadProject, metadataPriceToken, metadataProjectToken]);

  return (
    <Card className="col-span-12 xl:col-span-8">
      <Flex flexGrow={5} flexDirection="column" gap={4}>
        <Flex w="100%" gap={1} flexWrap="wrap" justifyContent="space-between">
          <Flex direction="column">
            <Text
              color="white"
              fontWeight="800"
              fontFamily="Inter"
              letterSpacing="-0.05em"
              fontSize="24px"
              mb="-20px"
              as="h1"
            >
              Project
            </Text>
            <Text
              fontWeight="800"
              fontFamily="Inter"
              letterSpacing="-0.05em"
              fontSize="50px"
              as="h1"
            >
              Stats
            </Text>
          </Flex>
        </Flex>

        <Flex
          gap={5}
          width="100%"
          className="flex-col md:flex-row md:space-x-[12px]"
        >
          {Object.keys(stats).map((key) => {
            const table = stats[key];

            return (
              <Flex
                flex="1"
                key={`project-stats-table-${key}`}
                flexDirection="column"
                width="100%"
              >
                <Flex marginBottom="12px">
                  <Text
                    color="white"
                    fontWeight="800"
                    fontFamily="Inter"
                    letterSpacing="-0.05em"
                    fontSize="24px"
                    as="h1"
                    children={table.name}
                  />
                </Flex>

                <Flex flexDirection="column" width="100%" gap={2}>
                  {table.items.map(({ label, value }, index) => (
                    <Skeleton
                      className="rounded-[16px]"
                      isLoaded={!isLoading}
                      key={`project-stats-table-${key}-${index}`}
                    >
                      <Flex
                        justifyContent="space-between"
                        className="flex-col lg:flex-row"
                        bg={
                          index % 2 === 0
                            ? "rgba(255,255,255,0.10)"
                            : "transparent"
                        }
                      >
                        <Text children={label} fontWeight="800" />

                        <Text children={value} />
                      </Flex>
                    </Skeleton>
                  ))}
                </Flex>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </Card>
  );
}
