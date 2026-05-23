import React from "react";
import { Pressable, ViewStyle } from "react-native";
import { Colors, Spacing, BorderRadius } from "../../theme";
import { Text } from "./Text";

export interface HabitatPillProps {
  habitat: string;
  active?: boolean;
  onPress?: () => void;
  testID: string;
}

export const HabitatPill: React.FC<HabitatPillProps> = ({
  habitat,
  active = false,
  onPress,
  testID,
}) => {
  const containerStyle: ViewStyle = {
    alignSelf: "flex-start",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: active ? Colors.sage : Colors.inkFaint,
    backgroundColor: active ? Colors.sageTint : "transparent",
  };

  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Habitat: ${habitat}`}
      accessibilityState={{ selected: active }}
    >
      <Text
        variant="medium"
        size="xs"
        color={active ? Colors.sage : Colors.inkSoft}
        testID={`${testID}-label`}
      >
        {habitat}
      </Text>
    </Pressable>
  );
};

export default HabitatPill;
