import { useTheme } from "@/hooks/theme";
import { Flex, Button } from "@chakra-ui/react";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Tabs({
  tabs,
  current,
  change,
}: {
  tabs: {};
  current: string;
  change: (key: string) => void;
}) {
  const { glassyWhiteOpaque } = useTheme();

  return (
    <Flex
      className="
        flex-grow
        flex flex-col
        max-w-[210px]
        h-max
      "
    >
      <Flex
        h="42px"
        borderRadius="13px"
        borderColor={glassyWhiteOpaque}
        border="solid 1px"
      >
        {Object.keys(tabs).map((key) => (
          <Button
            key={tabs[key].name}
            onClick={() => change(key)}
            className={classNames(
              key === current ? "bg-white text-black" : "bg-transparent white",
              "w-full h-full rounded-[13px] focus:outline-none hover:bg-white/[0.12] hover:text-white"
            )}
          >
            {tabs[key].name}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
}
