import React from "react";
import { View, Pressable, ViewStyle } from "react-native";
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from "../../theme";
import { Text } from "./Text";

export interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  testID: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  selectedIndex,
  onSelect,
  testID,
}) => {
  const containerStyle: ViewStyle = {
    flexDirection: "row",
    backgroundColor: Colors.sageTint,
    borderRadius: BorderRadius.lg,
    padding: 3,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {segments.map((label, index) => {
        const isActive = index === selectedIndex;
        const pillStyle: ViewStyle = {
          flex: 1,
          paddingVertical: Spacing.sm,
          borderRadius: BorderRadius.lg - 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isActive ? Colors.white : "transparent",
        };

        return (
          <Pressable
            key={label}
            style={pillStyle}
            onPress={() => onSelect(index)}
            testID={`${testID}-segment-${index}`}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              variant={isActive ? "semiBold" : "regular"}
              size="sm"
              color={isActive ? Colors.sage : Colors.inkSoft}
              testID={`${testID}-segment-${index}-label`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedControl;
