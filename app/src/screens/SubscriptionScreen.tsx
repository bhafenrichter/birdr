import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/stacks/ProfileStack";
import {
  ArrowLeft,
  Crown,
  MessageSquare,
  ExternalLink,
  Copy,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { Colors, Spacing, BorderRadius, Shadows } from "../theme";
import { Text, CircleBtn } from "../components/atoms";
import { useProfile } from "../hooks/useApi";
import { useRevenueCat } from "../contexts/RevenueCatProvider";
import { toastConfig } from "../config/toast";

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { data: profile } = useProfile();
  const { isSubscribed, customerInfo } = useRevenueCat();

  const customerId = profile?.customer_id ?? "—";

  // Get active subscription details from RevenueCat
  const activeEntitlements = customerInfo?.entitlements.active ?? {};
  const entitlement = Object.values(activeEntitlements)[0];
  const expirationDate = entitlement?.expirationDate
    ? new Date(entitlement.expirationDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const willRenew = entitlement?.willRenew ?? false;

  const handleManageSubscription = () => {
    // Deep link to App Store / Play Store subscription management
    if (Platform.OS === "ios") {
      Linking.openURL("https://apps.apple.com/account/subscriptions");
    } else {
      Linking.openURL(
        "https://play.google.com/store/account/subscriptions",
      );
    }
  };

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(customerId);
    Toast.show({
      type: "success",
      text1: "Copied",
      text2: "Your user ID has been copied to clipboard.",
    });
  };

  const handleContactUs = () => {
    navigation.navigate("SendFeedback");
  };


  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
      testID="subscription-screen"
    >
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
          Subscription
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan status card */}
        <View style={styles.planCard} testID="subscription-plan-card">
          <View style={styles.planHeader}>
            <View style={styles.proBadge}>
              <Crown size={16} color={Colors.white} strokeWidth={2} />
              <Text variant="bold" size="sm" color={Colors.white}>
                Pro
              </Text>
            </View>
          </View>

          {isSubscribed ? (
            <View style={styles.planDetails}>
              <Text
                variant="bold"
                size="xl"
                color={Colors.ink}
                testID="subscription-plan-name"
              >
                birdr Pro
              </Text>
              <Text
                variant="regular"
                size="sm"
                color={Colors.inkSoft}
                testID="subscription-plan-status"
                style={{ marginTop: Spacing.xs }}
              >
                {willRenew
                  ? `Renews ${expirationDate ?? "soon"}`
                  : `Expires ${expirationDate ?? "soon"}`}
              </Text>
            </View>
          ) : (
            <View style={styles.planDetails}>
              <Text
                variant="bold"
                size="xl"
                color={Colors.ink}
                testID="subscription-plan-name"
              >
                Free Plan
              </Text>
              <Text
                variant="regular"
                size="sm"
                color={Colors.inkSoft}
                style={{ marginTop: Spacing.xs }}
              >
                3 captures per day
              </Text>
            </View>
          )}
        </View>

        {/* User ID */}
        <View style={styles.section}>
          <Text
            variant="medium"
            size="xs"
            color={Colors.inkFaint}
            style={styles.sectionLabel}
          >
            YOUR USER ID
          </Text>
          <Pressable
            style={styles.row}
            onPress={handleCopyId}
            testID="subscription-user-id"
          >
            <View style={{ flex: 1 }}>
              <Text
                variant="regular"
                size="sm"
                color={Colors.ink}
                testID="subscription-user-id-value"
              >
                {customerId}
              </Text>
              <Text
                variant="regular"
                size="xs"
                color={Colors.inkFaint}
                style={{ marginTop: 2 }}
              >
                Tap to copy — include this in support requests
              </Text>
            </View>
            <Copy size={18} color={Colors.inkFaint} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text
            variant="medium"
            size="xs"
            color={Colors.inkFaint}
            style={styles.sectionLabel}
          >
            MANAGE
          </Text>

          {isSubscribed && (
            <Pressable
              style={styles.row}
              onPress={handleManageSubscription}
              testID="subscription-manage"
            >
              <ExternalLink
                size={20}
                color={Colors.ink}
                strokeWidth={1.5}
              />
              <Text
                variant="regular"
                size="base"
                color={Colors.ink}
                style={{ flex: 1, marginLeft: Spacing.md }}
              >
                Manage or cancel subscription
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.row}
            onPress={handleContactUs}
            testID="subscription-contact"
          >
            <MessageSquare
              size={20}
              color={Colors.ink}
              strokeWidth={1.5}
            />
            <Text
              variant="regular"
              size="base"
              color={Colors.ink}
              style={{ flex: 1, marginLeft: Spacing.md }}
            >
              Contact us
            </Text>
          </Pressable>

        </View>

        {/* Info note */}
        <Text
          variant="regular"
          size="xs"
          color={Colors.inkFaint}
          align="center"
          style={{ marginTop: Spacing.xl, paddingHorizontal: Spacing.xl }}
          testID="subscription-info"
        >
          {Platform.OS === "ios"
            ? "Subscriptions are managed through the App Store. To cancel, open Settings → Apple ID → Subscriptions."
            : "Subscriptions are managed through Google Play. To cancel, open Play Store → Payments & subscriptions."}
        </Text>
      </ScrollView>

      <Toast config={toastConfig} topOffset={60} />
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
    paddingBottom: Spacing["4xl"],
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  planHeader: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.sage,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  planDetails: {},
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    ...Shadows.sm,
  },
  sectionLabel: {
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
});

export default SubscriptionScreen;
