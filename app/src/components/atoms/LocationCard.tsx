import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { MapPin, ChevronDown } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text } from "./Text";

export interface LocationCardProps {
  locationName: string;
  subtitle?: string;
  onPress: () => void;
  testID: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  locationName,
  subtitle,
  onPress,
  testID,
}) => (
  <Pressable
    style={styles.card}
    onPress={onPress}
    testID={testID}
    accessible
    accessibilityRole="button"
    accessibilityLabel={`Location: ${locationName}. Tap to change.`}
  >
    <View style={styles.outer}>
      <View style={styles.content}>
        <View style={styles.row}>
          <MapPin size={18} color={Colors.sage} strokeWidth={2} />
          <Text
            variant="semiBold"
            size="base"
            color={Colors.ink}
            testID={`${testID}-name`}
          >
            {locationName}
          </Text>
        </View>
        {subtitle && (
          <Text
            variant="regular"
            size="sm"
            color={Colors.inkSoft}
            testID={`${testID}-subtitle`}
            style={{ marginTop: Spacing.xs }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronDown size={22} color={Colors.inkFaint} strokeWidth={2} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  outer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});

export default LocationCard;
