import Big from "big.js";
import { useMemo } from "react";
import { format } from "date-fns";
import { Card } from "@/components";
import { getUTCDate } from "@near/ts";
import { Flex, Text, Skeleton } from "@chakra-ui/react";
import { useWalletSelector } from "@/context/wallet-selector";
import {
  launchpadProject,
  investorAllocation,
  tokenMetadata,
} from "@/interfaces";

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
  investorAllowance: string;
  metadataPriceToken: tokenMetadata;
  launchpadProject: launchpadProject;
  metadataProjectToken: tokenMetadata;
  investorAllocation: investorAllocation;
}) {
  const { accountId } = useWalletSelector();

  const formatDate = (start_timestamp?: string) => {
    const date = getUTCDate(Number(start_timestamp ?? "0"));
    return format(date, "mm/dd/yyyy");
  };

  const formatNumber = (value, decimals) => {
    const decimalsBig = new Big(10).pow(decimals ?? 1);

    return new Big(value ?? 0).div(decimalsBig);
  };

  const totalRaise = useMemo(() => {
    const {
      total_amount_sale_project_tokens = "",
      token_allocation_price = "",
      token_allocation_size = "",
    } = launchpadProject || {};

    const totalAmount = new Big(total_amount_sale_project_tokens!);
    const allocationPrice = new Big(token_allocation_price!);
    const allocationSize = new Big(token_allocation_size || 1);

    return totalAmount.mul(allocationPrice).div(allocationSize);
  }, [launchpadProject]);

  const stats = useMemo(() => {
    return {
      price: {
        name: "Price",
        items: [
          {
            label: "Total raise (in price token)",
            value: formatNumber(totalRaise, metadataPriceToken?.decimals),
          },
          {
            label: "Project tokens for sale",
            value: formatNumber(
              launchpadProject?.total_amount_sale_project_tokens,
              metadataProjectToken?.decimals
            ),
          },
          {
            label: "Allocation size",
            value: formatNumber(
              launchpadProject?.token_allocation_size,
              metadataProjectToken?.decimals
            ),
          },
          {
            label: "How many allocations you can still buy",
            value: accountId ? investorAllowance! : CONNECT_WALLET_MESSAGE,
          },
          {
            label: "How many allocations you already bought",
            value: accountId
              ? investorAllocation.allocationsBought
              : CONNECT_WALLET_MESSAGE,
          },
          {
            label: "Total allocations bought / total allocations",
            value:
              formatNumber(
                new Big(launchpadProject?.allocations_sold ?? 0)
                  .div(
                    new Big(
                      launchpadProject?.total_amount_sale_project_tokens ?? 1
                    )
                  )
                  .toString(),
                metadataProjectToken?.decimals
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
            value: formatDate(launchpadProject?.liquidity_pool_timestamp!),
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
