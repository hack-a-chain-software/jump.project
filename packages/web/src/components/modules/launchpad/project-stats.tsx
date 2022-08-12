import { Card } from "@/components";
import { Flex, Text, Skeleton } from "@chakra-ui/react";

interface Stats {
  [key: string]: table;
}

export interface table {
  name: string;
  items: Item[];
}

export interface Item {
  label: string;
  value: string;
}

export function ProjectStats({
  stats,
  isLoading,
}: {
  stats: Stats;
  isLoading: boolean;
}) {
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
