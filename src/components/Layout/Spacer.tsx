import React from "react";
import { View } from "react-native";

interface ISpacerProps {
  height?: number;
  width?: number;
}

export default function Spacer({ height, width }: ISpacerProps) {
  return (
    <View
      style={{
        flex: !!height || !!width ? undefined : 1,
        height,
        width,
      }}
    />
  );
}
