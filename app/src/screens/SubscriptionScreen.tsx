import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Check, X } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text, CircleBtn, PrimaryButton, GhostButton } from "../components/atoms";
import { useProfile } from "../hooks/useApi";

type Plan = "free" | "weekly" | "yearly";

const PLANS: {
  id: Plan;
  name: string;
  price: string;
  priceDetail: string;
  badge?: string;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceDetail: "3 captures/day",
  },
  {
    id: "weekly",
    name: "Weekly",
    price: "$3.99",
    priceDetail: "per week",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$29.99",
    priceDetail: "per year · ~$2.50/mo",
    badge: "Best value",
  },
];

const FEATURES = [
  { label: "Photo identification", free: true },
  { label: "Collection & cards", free: true },
  { label: "Streaks & achievements", free: true },
  { label: "Explore nearby species", free: true },
  { label: "Unlimited daily captures", free: false },
];

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: profile } = useProfile();
  const isSubscribed = profile?.subscription_tier !== "free";
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="subscription-screen">
      {/* Top bar */}
      <View style={styles.topBar}>
        <CircleBtn
          icon={ArrowLeft}
          size={36}
          backgroundColor={Colors.white}
          color={Colors.ink}
          onPress={() => navigation.goBack()}
          testID="subscription-back"
        />
        <Text
          variant="semiBold"
          size="md"
          color={Colors.ink}
          testID="subscription-title"
        >
          {isSubscribed ? "Your plan" : "Upgrade"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Text
          variant="bold"
          size="2xl"
          color={Colors.ink}
          align="center"
          testID="subscription-hero-title"
        >
          Unlimited captures
        </Text>
        <Text
          variant="regular"
          size="sm"
          color={Colors.inkSoft}
          align="center"
          testID="subscription-hero-subtitle"
          style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}
        >
          Remove the daily limit and capture every bird you see
        </Text>

        {/* Plan picker */}
        <View style={styles.planRow} testID="subscription-plans">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isCurrent =
              (isSubscribed && plan.id === "yearly") ||
              (!isSubscribed && plan.id === "free");

            return (
              <Pressable
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                testID={`subscription-plan-${plan.id}`}
              >
                {plan.badge && (
                  <View style={styles.planBadge}>
                    <Text variant="bold" size="xs" color={Colors.white} testID={`plan-badge-${plan.id}`}>
                      {plan.badge}
                    </Text>
                  </View>
                )}
                <Text
                  variant="semiBold"
                  size="base"
                  color={isSelected ? Colors.sage : Colors.ink}
                  testID={`plan-name-${plan.id}`}
                >
                  {plan.name}
                </Text>
                <Text
                  variant="bold"
                  size="xl"
                  color={isSelected ? Colors.sage : Colors.ink}
                  testID={`plan-price-${plan.id}`}
                >
                  {plan.price}
                </Text>
                <Text
                  variant="regular"
                  size="xs"
                  color={Colors.inkSoft}
                  testID={`plan-detail-${plan.id}`}
                >
                  {plan.priceDetail}
                </Text>
                {isCurrent && (
                  <Text
                    variant="medium"
                    size="xs"
                    color={Colors.sage}
                    testID={`plan-current-${plan.id}`}
                    style={{ marginTop: Spacing.xs }}
                  >
                    Current
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Features comparison */}
        <View style={styles.featuresCard} testID="subscription-features">
          {FEATURES.map((feat, i) => (
            <View
              key={feat.label}
              style={[
                styles.featureRow,
                i < FEATURES.length - 1 && styles.featureRowBorder,
              ]}
              testID={`subscription-feature-${i}`}
            >
              <Text variant="regular" size="sm" color={Colors.ink} style={{ flex: 1 }} testID={`feature-label-${i}`}>
                {feat.label}
              </Text>
              {/* Free column */}
              <View style={styles.featureCheck}>
                {feat.free ? (
                  <Check size={16} color={Colors.sage} strokeWidth={2.5} />
                ) : (
                  <X size={16} color={Colors.inkFaint} strokeWidth={1.5} />
                )}
              </View>
              {/* Pro column */}
              <View style={styles.featureCheck}>
                <Check size={16} color={Colors.sage} strokeWidth={2.5} />
              </View>
            </View>
          ))}
          {/* Column headers */}
          <View style={styles.featureHeader}>
            <View style={{ flex: 1 }} />
            <Text
              variant="medium"
              size="xs"
              color={Colors.inkFaint}
              style={styles.featureCheck}
              testID="feature-header-free"
            >
              Free
            </Text>
            <Text
              variant="medium"
              size="xs"
              color={Colors.sage}
              style={styles.featureCheck}
              testID="feature-header-pro"
            >
              Pro
            </Text>
          </View>
        </View>

        {/* CTA */}
        {selectedPlan !== "free" && (
          <View style={styles.ctaSection}>
            <PrimaryButton
              title={`Subscribe · ${PLANS.find((p) => p.id === selectedPlan)?.price ?? ""}`}
              size="lg"
              fullWidth
              testID="subscription-cta"
            />
            <Text
              variant="regular"
              size="xs"
              color={Colors.inkFaint}
              align="center"
              testID="subscription-legal"
              style={{ marginTop: Spacing.md }}
            >
              Cancel anytime. Supports a small team building birdr.
            </Text>
          </View>
        )}

        {/* Restore */}
        <Pressable
          style={styles.restoreLink}
          testID="subscription-restore"
        >
          <Text
            variant="regular"
            size="sm"
            color={Colors.sage}
            testID="subscription-restore-label"
          >
            Restore purchases
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["5xl"],
  },
  planRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  planCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.sm,
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
  planBadge: {
    position: "absolute",
    top: -10,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.saffron,
    borderRadius: BorderRadius.full,
  },
  featuresCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
    marginBottom: Spacing.sm,
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  featureRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
  featureCheck: {
    width: 48,
    alignItems: "center",
  },
  ctaSection: {
    marginBottom: Spacing.lg,
  },
  restoreLink: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});

export default SubscriptionScreen;
