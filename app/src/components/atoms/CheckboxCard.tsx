import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text } from "./Text";

export interface CheckboxCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onPress: () => void;
  badge?: string;
  testID: string;
}

export const CheckboxCard: React.FC<CheckboxCardProps> = ({
  icon,
  title,
  description,
  checked,
  onPress,
  badge,
  testID,
}) => (
  <Pressable
    style={[styles.card, checked && styles.cardChecked]}
    onPress={onPress}
    testID={testID}
    accessible
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    accessibilityLabel={`${title}: ${description}`}
  >
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
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Check size={14} color={Colors.white} strokeWidth={3} />}
      </View>
    </View>
  </Pressable>
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
  cardChecked: {
    borderColor: Colors.sage,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage,
  },
});

export default CheckboxCard;
