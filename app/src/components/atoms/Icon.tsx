import React from "react";
import { Pressable } from "react-native";
import { Colors } from "../../theme";
import type { LucideIcon } from "lucide-react-native";

export interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
  onPress?: () => void;
  testID: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: LucideIconComponent,
  size = 24,
  color = Colors.ink,
  strokeWidth = 1.5,
  onPress,
  testID,
}) => {
  const rendered = (
    <LucideIconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      testID={testID}
    />
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={`${testID}-pressable`}
        hitSlop={8}
        accessible
        accessibilityRole="button"
      >
        {rendered}
      </Pressable>
    );
  }

  return rendered;
};

export default Icon;
