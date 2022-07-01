import { Text, TextProps } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export function GradientText(props: PropsWithChildren<TextProps>) {
  return (
    <Text
      background="linear-gradient(90deg, #761BA0 0%, #D63A2F 100%)"
      style={
        {
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "text-fill-color": "transparent",
        } as any
      }
      {...props}
    />
  );
}
