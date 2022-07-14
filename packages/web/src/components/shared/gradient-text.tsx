import { Text, TextProps } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export function GradientText(props: PropsWithChildren<TextProps>) {
  return <Text {...props} />;
}
