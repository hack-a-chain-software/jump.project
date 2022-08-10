import { useState } from "react";
import { Tabs } from "./submodules";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/theme";
import { Card, ValueBox } from "@/components";
import { Flex, Text, useMediaQuery } from "@chakra-ui/react";

interface Tabs {
  [key: string]: tab;
}

export interface tab {
  name: string;
  items: Item[];
}

export interface Item {
  label: string;
  value: string;
}

export function ProjectStats({ tabs }: { tabs: Tabs }) {
  const { glassyWhiteOpaque } = useTheme();
  const [isMobile] = useMediaQuery("(max-width: 1024px)");
  const [current, setCurrent] = useState<string>(Object.keys(tabs).at(0) || "");

  return (
    <Card flex={1} flexGrow="1.9" w="100%" maxWidth={isMobile ? "100%" : "65%"}>
      <Flex w="100%" flexDirection="column" gap={4}>
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

          <Tabs
            tabs={tabs}
            current={current}
            change={(key: string) => setCurrent(key)}
          />
        </Flex>

        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          key={"launchpad-project-stats-" + current}
        >
          <Flex
            key={current}
            className="max-w-full space-x-[12px] overflow-x-auto"
          >
            {tabs[current].items.map(({ label, value }, index) => (
              <ValueBox
                title={label}
                value={value}
                height="114px"
                borderColor={glassyWhiteOpaque}
                key={"project-stats-" + current + index}
              />
            ))}
          </Flex>
        </motion.div>
      </Flex>
    </Card>
  );
}
