import { useTheme } from "../../hooks/theme";
import { ExclamationIcon } from "@heroicons/react/solid";
import { Flex, useColorModeValue } from "@chakra-ui/react";

export function ReportButton() {
  const { jumpGradient, glassyWhiteOpaque } = useTheme();

  const cardBg = useColorModeValue(jumpGradient, jumpGradient);
  const cardOpacity = useColorModeValue(glassyWhiteOpaque, glassyWhiteOpaque);

  return (
    <Flex
      bg={cardBg}
      onClick={() => {
        window.open(
          "https://docs.google.com/forms/d/e/1FAIpQLSdFwl4C7HKeYZxfgeZu62BakWBHBM9-WihDMJ4w2Rl2nMcV_Q/viewform",
          "_blank"
        );
      }}
      borderRadius="24px"
      className="fixed bottom-[24px] right-[24px] z-[9999] cursor-pointer hover:opacity-[0.95]"
    >
      <Flex
        borderRadius="24px"
        bg={cardOpacity}
        className="
          w-[180px] 
          flex items-center
          space-x-[12px]
          px-[16px]
          py-[9px]
          text-white
        "
      >
        <ExclamationIcon className="w-8" />

        <span className="text-[18px]">Report Bug</span>
      </Flex>
    </Flex>
  );
}
