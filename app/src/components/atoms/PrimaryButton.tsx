import React from "react";
import {
  Pressable,
  PressableProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text } from "./Text";

type ButtonSize = "sm" | "md" | "lg";

export interface PrimaryButtonProps extends PressableProps {
  title: string;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID: string;
}

const sizeStyles: Record<ButtonSize, { py: number; px: number; fontSize: keyof typeof FontSizes }> = {
  sm: { py: Spacing.sm, px: Spacing.lg, fontSize: "sm" },
  md: { py: Spacing.md, px: Spacing.xl, fontSize: "base" },
  lg: { py: Spacing.lg, px: Spacing["2xl"], fontSize: "md" },
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  size = "md",
  isLoading = false,
  icon,
  fullWidth = false,
  disabled = false,
  testID,
  ...rest
}) => {
  const s = sizeStyles[size];

  const containerStyle: ViewStyle = {
    borderRadius: BorderRadius.full,
    alignSelf: fullWidth ? "stretch" : "flex-start",
    overflow: "hidden",
    ...Shadows.sm,
    opacity: disabled ? 0.5 : 1,
  };

  const innerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: s.py,
    paddingHorizontal: s.px,
    gap: Spacing.sm,
  };

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || isLoading }}
      testID={testID}
      disabled={disabled || isLoading}
      style={({ pressed }) => [containerStyle, pressed && { opacity: 0.8 }]}
      {...rest}
    >
      <LinearGradient
        colors={[Colors.sage, Colors.sageLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={innerStyle}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            {icon}
            <Text
              variant="medium"
              size={s.fontSize}
              color={Colors.white}
              testID={`${testID}-label`}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
};

export default PrimaryButton;
