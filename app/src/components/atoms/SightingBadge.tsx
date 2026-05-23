import React from "react";
import { View, ViewStyle } from "react-native";
import { Colors, Fonts, FontSizes, Shadows } from "../../theme";
import { Text } from "./Text";

export interface SightingBadgeProps {
  count: number;
  size?: number;
  testID: string;
}

export const SightingBadge: React.FC<SightingBadgeProps> = ({
  count,
  size = 28,
  testID,
}) => {
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  };

  return (
    <View style={containerStyle} testID={testID} accessible accessibilityLabel={`${count} sightings`}>
      <Text
        variant="bold"
        size="xs"
        color={Colors.white}
        testID={`${testID}-count`}
      >
        {String(count)}
      </Text>
    </View>
  );
};

export default SightingBadge;
