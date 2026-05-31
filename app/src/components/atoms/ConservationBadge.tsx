import React from "react";
import { View, ViewStyle } from "react-native";
import { ConservationTierColors, Colors } from "../../theme";
import type { ConservationTier } from "../../theme";
import { Text } from "./Text";

const TIER_LABELS: Record<ConservationTier, string> = {
  LC: "Least Concern",
  NT: "Near Threatened",
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
};

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
    <View style={containerStyle} testID={testID} accessible accessibilityLabel={`Conservation status: ${TIER_LABELS[tier]}`}>
      <Text
        variant="bold"
        size="sm"
        color={Colors.white}
        style={{
          textShadowColor: "rgba(0,0,0,0.4)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
        testID={`${testID}-label`}
      >
        {tier}
      </Text>
    </View>
  );
};

export default ConservationBadge;
