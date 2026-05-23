import React from "react";
import { View, ViewStyle } from "react-native";
import { ConservationTierColors, Colors, Fonts, FontSizes } from "../../theme";
import type { ConservationTier } from "../../theme";
import { Text } from "./Text";

export interface ConservationBadgeProps {
  tier: ConservationTier;
  size?: number;
  testID: string;
}

export const ConservationBadge: React.FC<ConservationBadgeProps> = ({
  tier,
  size = 28,
  testID,
}) => {
  const bgColor = ConservationTierColors[tier];

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <View style={containerStyle} testID={testID} accessible accessibilityLabel={`Conservation status: ${tier}`}>
      <Text
        variant="bold"
        size="xs"
        color={Colors.white}
        testID={`${testID}-label`}
      >
        {tier}
      </Text>
    </View>
  );
};

export default ConservationBadge;
