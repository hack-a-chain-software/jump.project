import { Button } from "@/components";
import { Image, Text } from "@chakra-ui/react";

export function WalletModuleItem({
  name,
  iconUrl,
  onClick,
}: {
  name: string;
  iconUrl: string;
  onClick: () => void;
}) {
  return (
    <Button
      color="white"
      border="1px solid white"
      bg="transparent"
      onClick={onClick}
      height="56px"
      justifyContent="start"
    >
      <Image src={iconUrl} width="32px" height="32px" />

      {name}
    </Button>
  );
}
