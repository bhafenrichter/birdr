import React from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from "../../theme";
import { Text } from "./Text";

type ButtonSize = "sm" | "md" | "lg";

export interface GhostButtonProps extends PressableProps {
  title: string;
  size?: ButtonSize;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID: string;
}

const sizeStyles: Record<ButtonSize, { py: number; px: number; fontSize: keyof typeof FontSizes }> = {
  sm: { py: Spacing.sm, px: Spacing.lg, fontSize: "sm" },
  md: { py: Spacing.md, px: Spacing.xl, fontSize: "base" },
  lg: { py: Spacing.lg, px: Spacing["2xl"], fontSize: "md" },
};

export const GhostButton: React.FC<GhostButtonProps> = ({
  title,
  size = "md",
  icon,
  fullWidth = false,
  disabled = false,
  testID,
  ...rest
}) => {
  const s = sizeStyles[size];

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: s.py,
    paddingHorizontal: s.px,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.sageTint,
    alignSelf: fullWidth ? "stretch" : "flex-start",
    gap: Spacing.sm,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      disabled={disabled}
      style={({ pressed }) => [containerStyle, pressed && { opacity: 0.7 }]}
      {...rest}
    >
      {icon}
      <Text
        variant="medium"
        size={s.fontSize}
        color={Colors.sage}
        testID={`${testID}-label`}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default GhostButton;
