import React from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { Colors, BorderRadius, Spacing, Shadows } from "../../theme";

export interface CardProps extends ViewProps {
  variant?: "default" | "outlined";
  padding?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  shadow?: keyof typeof Shadows | "none";
  testID: string;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = Spacing.lg,
  backgroundColor = Colors.white,
  borderColor = Colors.sageTint,
  borderRadius = BorderRadius.xl,
  shadow = "sm",
  children,
  testID,
  style,
  ...rest
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius,
    padding,
    ...(variant === "outlined" && { borderWidth: 1, borderColor }),
    ...(shadow !== "none" && Shadows[shadow]),
  };

  return (
    <View style={[cardStyle, style]} testID={testID} {...rest}>
      {children}
    </View>
  );
};

export default Card;
