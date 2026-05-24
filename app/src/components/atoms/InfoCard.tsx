import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text } from "./Text";

export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  testID: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  description,
  badge,
  testID,
}) => (
  <View style={styles.card} testID={testID}>
    <View style={styles.row}>
      <View style={styles.iconWrapper}>{icon}</View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text variant="semiBold" size="base" color={Colors.ink} testID={`${testID}-title`}>
            {title}
          </Text>
          {badge && (
            <View style={styles.badge}>
              <Text variant="regular" size="xs" color={Colors.inkFaint} testID={`${testID}-badge`}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Text variant="regular" size="sm" color={Colors.inkSoft} testID={`${testID}-desc`}>
          {description}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.paper,
    ...Shadows.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.paper,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
});

export default InfoCard;
