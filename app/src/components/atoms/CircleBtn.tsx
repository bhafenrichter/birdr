import React from "react";
import { Pressable, ViewStyle } from "react-native";
import { Colors, Shadows } from "../../theme";
import type { LucideIcon } from "lucide-react-native";

export interface CircleBtnProps {
  icon: LucideIcon;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  testID: string;
}

export const CircleBtn: React.FC<CircleBtnProps> = ({
  icon: LucideIconComponent,
  size = 44,
  iconSize,
  color = Colors.white,
  backgroundColor = Colors.sage,
  onPress,
  disabled = false,
  testID,
}) => {
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [containerStyle, pressed && { opacity: 0.7 }]}
    >
      <LucideIconComponent
        size={iconSize ?? size * 0.5}
        color={color}
        strokeWidth={1.5}
      />
    </Pressable>
  );
};

export default CircleBtn;
