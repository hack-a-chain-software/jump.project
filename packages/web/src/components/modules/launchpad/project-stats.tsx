import { motion } from "framer-motion";
import { useTheme } from "@/hooks/theme";
import { Card, ValueBox } from "@/components";
import { Flex, Text } from "@chakra-ui/react";

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
  description,
}: {
  stats: Stats;
  description: string;
}) {
  const { glassyWhiteOpaque } = useTheme();

  return (
    <Card flex={1} w="100%">
      <Flex gap={8} width="100%" className="flex-col xl:flex-row">
        <Flex flexGrow={1} flexWrap="wrap" direction="column" flexShrink="5">
          <Text
            fontWeight="800"
            fontFamily="Inter"
            letterSpacing="-0.05em"
            fontSize="40px"
            as="h1"
          >
            About
          </Text>

          <Text children={description} />
        </Flex>

        <Flex
          flexGrow={5}
          flexDirection="column"
          className="lg:min-w-[800px]"
          gap={4}
        >
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
                      <Flex
                        key={`project-stats-table-${key}-${index}`}
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
                    ))}
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
