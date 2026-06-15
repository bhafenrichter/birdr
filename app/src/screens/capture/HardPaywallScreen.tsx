import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { X, Check } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, PrimaryButton, CircleBtn } from "../../components/atoms";
import { usePostHog } from "../../contexts/PostHogProvider";

type Plan = "weekly" | "yearly";

export const HardPaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const posthog = usePostHog();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");

  const handleClose = () => {
    posthog.capture("paywall_dismissed", { selected_plan: selectedPlan });
    navigation.getParent()?.goBack();
  };

  return (
    <View style={styles.container} testID="hard-paywall-screen">
      {/* Close button */}
      <View style={styles.topBar}>
        <CircleBtn
          icon={X}
          size={36}
          backgroundColor="rgba(0,0,0,0.08)"
          color={Colors.ink}
          onPress={handleClose}
          testID="hard-paywall-close"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Text
          variant="bold"
          size="3xl"
          color={Colors.ink}
          align="center"
          testID="hard-paywall-title"
        >
          You've used all 3 captures today
        </Text>
        <Text
          variant="regular"
          size="base"
          color={Colors.inkSoft}
          align="center"
          testID="hard-paywall-subtitle"
          style={{ marginTop: Spacing.md }}
        >
          Upgrade to capture every bird you see, no limits
        </Text>

        {/* Plan cards */}
        <View style={styles.plans}>
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === "yearly" && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan("yearly")}
            testID="hard-paywall-plan-yearly"
          >
            <View style={styles.bestValueBadge}>
              <Text variant="bold" size="xs" color={Colors.white} testID="hard-paywall-best-value">
                Best value
              </Text>
            </View>
            <Text variant="semiBold" size="lg" color={Colors.ink} testID="hard-paywall-yearly-price">
              $24.99/year
            </Text>
            <Text variant="regular" size="xs" color={Colors.inkSoft} testID="hard-paywall-yearly-detail">
              ~$2.08/month
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.planCard,
              selectedPlan === "weekly" && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan("weekly")}
            testID="hard-paywall-plan-weekly"
          >
            <Text variant="semiBold" size="lg" color={Colors.ink} testID="hard-paywall-weekly-price">
              $1.99/week
            </Text>
          </Pressable>
        </View>

        {/* Feature list */}
        <View style={styles.features}>
          {[
            "Unlimited daily captures",
            "Full collection access",
            "All achievements & streaks",
            "Supports a small team building birdr",
          ].map((feat, i) => (
            <View key={i} style={styles.featureRow} testID={`hard-paywall-feature-${i}`}>
              <Check size={18} color={Colors.sage} strokeWidth={2.5} />
              <Text variant="regular" size="sm" color={Colors.ink} testID={`hard-paywall-feature-${i}-text`}>
                {feat}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <PrimaryButton
          title={`Subscribe · ${selectedPlan === "yearly" ? "$24.99/yr" : "$1.99/wk"}`}
          size="lg"
          fullWidth
          testID="hard-paywall-cta"
        />

        <Text
          variant="regular"
          size="xs"
          color={Colors.inkFaint}
          align="center"
          testID="hard-paywall-legal"
          style={{ marginTop: Spacing.md }}
        >
          Cancel anytime. Your captures reset tomorrow at midnight.
        </Text>

        <Pressable style={styles.restoreLink} testID="hard-paywall-restore">
          <Text variant="regular" size="sm" color={Colors.sage} testID="hard-paywall-restore-label">
            Restore purchases
          </Text>
        </Pressable>

        <View style={styles.legalLinks} testID="hard-paywall-legal-links">
          <Pressable onPress={() => Linking.openURL("https://hoftware.gitbook.io/birdr/legal/terms-of-service")} testID="hard-paywall-tos">
            <Text variant="regular" size="xs" color={Colors.inkSoft}>Terms of Use</Text>
          </Pressable>
          <Text variant="regular" size="xs" color={Colors.inkFaint}>·</Text>
          <Pressable onPress={() => Linking.openURL("https://hoftware.gitbook.io/birdr/legal/privacy-policy")} testID="hard-paywall-privacy">
            <Text variant="regular" size="xs" color={Colors.inkSoft}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["5xl"],
  },
  plans: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.xl,
  },
  planCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: "transparent",
    ...Shadows.sm,
  },
  planCardSelected: {
    borderColor: Colors.sage,
    backgroundColor: Colors.sageTint,
  },
  bestValueBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: Colors.saffron,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing["3xl"],
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  restoreLink: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
});

export default HardPaywallScreen;
