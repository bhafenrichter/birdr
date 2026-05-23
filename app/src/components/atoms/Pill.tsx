import React from "react";
import { View, ViewStyle } from "react-native";
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from "../../theme";
import { Text } from "./Text";

export interface PillProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  testID: string;
}

export const Pill: React.FC<PillProps> = ({
  label,
  color = Colors.sage,
  backgroundColor = Colors.sageTint,
  size = "sm",
  icon,
  testID,
}) => {
  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: size === "sm" ? 2 : Spacing.xs,
    paddingHorizontal: size === "sm" ? Spacing.sm : Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor,
    gap: Spacing.xs,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {icon}
      <Text
        variant="medium"
        size={size === "sm" ? "xs" : "sm"}
        color={color}
        testID={`${testID}-label`}
      >
        {label}
      </Text>
    </View>
  );
};

export default Pill;
