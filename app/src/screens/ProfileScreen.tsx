import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Award,
  Flame,
  CreditCard,
  MessageSquare,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Fonts,
  FontSizes,
} from "../theme";
import { Text, PrimaryButton } from "../components/atoms";
import Svg, { Path } from "react-native-svg";
import Skeleton from "react-native-reanimated-skeleton";
import { useAuth } from "../contexts/AuthProvider";
import {
  useStreak,
  useAchievements,
  useCards,
} from "../hooks/useApi";
import { useRevenueCat } from "../contexts/RevenueCatProvider";
import type { ProfileStackParamList } from "../navigation/stacks/ProfileStack";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const { data: streakData, isLoading: streakLoading } = useStreak();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: cards, isLoading: cardsLoading } = useCards();

  const isLoading = !profile || streakLoading || cardsLoading;

  const displayName = profile?.display_name ?? "Birder";
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = profile?.created_at ?? new Date().toISOString();
  const { isSubscribed, presentPaywall, presentCustomerCenter } = useRevenueCat();
  const currentStreak = streakData?.current_streak ?? 0;
  const totalCaptures =
    cards?.reduce((sum, c) => sum + c.sighting_count, 0) ?? 0;
  const totalSpecies = cards?.length ?? 0;
  const unlockedCount = achievements?.filter((a) => a.unlocked_at).length ?? 0;
  const totalCount = 105; // Fixed: 9 collection + 6 streak + 45 family + 45 habitat

  if (isLoading) {
    const rowSkeleton = (i: number) => ({
      key: `row-${i}`,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
      children: [
        { key: `icon-${i}`, width: 20, height: 20, borderRadius: 10 },
        { key: `label-${i}`, width: "55%" as any, height: 15, borderRadius: 7 },
      ],
    });

    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="profile-screen-loading">
        <Skeleton
          isLoading
          boneColor={Colors.paper}
          highlightColor={Colors.cream}
          duration={1200}
          containerStyle={styles.scrollContent}
          layout={[
            // Avatar section
            { key: "avatar-wrap", alignItems: "center" as const, marginBottom: Spacing.xl, children: [
              { key: "avatar", width: 64, height: 76, borderRadius: 32, marginBottom: Spacing.md },
              { key: "name", width: 120, height: 20, borderRadius: 10 },
              { key: "since", width: 160, height: 11, borderRadius: 6, marginTop: Spacing.sm },
            ]},
            // Stats trio
            { key: "stats", flexDirection: "row" as const, gap: Spacing.sm, marginBottom: Spacing.xl, children: [
              { key: "stat-0", flex: 1, height: 72, borderRadius: BorderRadius.lg },
              { key: "stat-1", flex: 1, height: 72, borderRadius: BorderRadius.lg },
              { key: "stat-2", flex: 1, height: 72, borderRadius: BorderRadius.lg },
            ]},
            // Upgrade banner
            { key: "banner", width: "100%" as any, height: 60, borderRadius: BorderRadius.xl, marginBottom: Spacing.xl },
            // Activity section (2 rows)
            { key: "section-1", borderRadius: BorderRadius.xl, overflow: "hidden" as const, marginBottom: Spacing.lg, children: [
              rowSkeleton(0),
              rowSkeleton(1),
            ]},
            // Support section (3 rows)
            { key: "section-2", borderRadius: BorderRadius.xl, overflow: "hidden" as const, marginBottom: Spacing.lg, children: [
              rowSkeleton(2),
              rowSkeleton(3),
              rowSkeleton(4),
            ]},
            // Account section (2 rows)
            { key: "section-3", borderRadius: BorderRadius.xl, overflow: "hidden" as const, marginBottom: Spacing.lg, children: [
              rowSkeleton(5),
              rowSkeleton(6),
            ]},
          ]}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="profile-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.avatarSection} testID="profile-avatar-section">
          <View style={styles.avatar} testID="profile-avatar">
            <Svg
              width={64}
              height={76}
              viewBox="0 0 64 76"
              style={StyleSheet.absoluteFill}
            >
              <Path
                d="M32 2 C18 2, 4 20, 4 42 C4 60, 16 74, 32 74 C48 74, 60 60, 60 42 C60 20, 46 2, 32 2 Z"
                fill={Colors.white}
                stroke={Colors.sageTint}
                strokeWidth={2}
              />
            </Svg>
            <Text
              variant="bold"
              size="xl"
              color={Colors.sage}
              testID="profile-avatar-initial"
            >
              {initial}
            </Text>
          </View>
          <Text
            variant="semiBold"
            size="lg"
            color={Colors.ink}
            testID="profile-display-name"
          >
            {displayName}
          </Text>
          <Text
            variant="regular"
            size="xs"
            color={Colors.inkSoft}
            testID="profile-member-since"
          >
            {`Birdr since ${formatDate(memberSince)}`}
          </Text>
        </View>

        {/* Stats trio */}
        <View style={styles.statsTrio} testID="profile-stats">
          <StatBlock
            value={String(totalCaptures)}
            label="Captures"
            testID="profile-stat-captures"
          />
          <StatBlock
            value={String(totalSpecies)}
            label="Species"
            testID="profile-stat-species"
          />
          <StatBlock
            value={String(currentStreak)}
            label="Streak"
            testID="profile-stat-streak"
          />
        </View>

        {/* Subscription banner (free users) */}
        {!isSubscribed && (
          <Pressable testID="profile-upgrade-banner" onPress={presentPaywall}>
            <LinearGradient
              colors={[Colors.sage, Colors.sageLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeBanner}
            >
              <View style={styles.upgradeBannerContent}>
                <Text
                  variant="semiBold"
                  size="base"
                  color={Colors.white}
                  testID="profile-upgrade-title"
                >
                  Unlock unlimited captures
                </Text>
                <Text
                  variant="regular"
                  size="xs"
                  color="rgba(255,255,255,0.8)"
                  testID="profile-upgrade-subtitle"
                >
                  From $2.50/month with the yearly plan
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.white} />
            </LinearGradient>
          </Pressable>
        )}

        {/* Activity links */}
        <View style={styles.section} testID="profile-activity-section">
          <ProfileRow
            icon={Award}
            label={`Achievements · ${unlockedCount} of ${totalCount}`}
            onPress={() => navigation.navigate("Achievements")}
            testID="profile-row-achievements"
          />
          <ProfileRow
            icon={Flame}
            label={`Streak · ${currentStreak} days`}
            onPress={() => navigation.navigate("StreakDetail")}
            testID="profile-row-streak"
          />
          {isSubscribed ? (
            <ProfileRow
              icon={CreditCard}
              label="Manage subscription"
              onPress={presentCustomerCenter}
              testID="profile-row-subscription"
            />
          ) : null}
        </View>

        {/* Support links */}
        <View style={styles.section} testID="profile-support-section">
          <ProfileRow
            icon={MessageSquare}
            label="Send feedback"
            onPress={() => navigation.navigate("SendFeedback")}
            testID="profile-row-feedback"
          />
        </View>

        {/* Sign out */}
        <View style={styles.section} testID="profile-account-section">
          <ProfileRow
            icon={LogOut}
            label="Sign out"
            onPress={() => navigation.navigate("SignOutConfirm")}
            testID="profile-row-signout"
          />
          <ProfileRow
            icon={Trash2}
            label="Delete account"
            onPress={() => {}}
            destructive
            testID="profile-row-delete"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer} testID="profile-footer">
          <View style={styles.footerLinks}>
            <Pressable
              onPress={() => Linking.openURL("https://hoftware.io/privacy")}
              testID="profile-privacy"
            >
              <Text variant="regular" size="xs" color={Colors.sage}>
                Privacy Policy
              </Text>
            </Pressable>
            <Text variant="regular" size="xs" color={Colors.inkFaint}>
              ·
            </Text>
            <Pressable
              onPress={() => Linking.openURL("https://hoftware.io/terms")}
              testID="profile-terms"
            >
              <Text variant="regular" size="xs" color={Colors.sage}>
                Terms of Service
              </Text>
            </Pressable>
          </View>
          <Text
            variant="regular"
            size="xs"
            color={Colors.inkFaint}
            testID="profile-version"
          >
            v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Subcomponents ──────────────────────────────────────────────────────────

const StatBlock: React.FC<{
  value: string;
  label: string;
  testID: string;
}> = ({ value, label, testID }) => (
  <View style={styles.statBlock} testID={testID}>
    <Text
      variant="bold"
      size="xl"
      color={Colors.ink}
      testID={`${testID}-value`}
    >
      {value}
    </Text>
    <Text
      variant="regular"
      size="xs"
      color={Colors.inkSoft}
      testID={`${testID}-label`}
    >
      {label}
    </Text>
  </View>
);

const ProfileRow: React.FC<{
  icon: React.FC<any>;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  testID: string;
}> = ({ icon: IconComp, label, onPress, destructive, testID }) => (
  <Pressable style={styles.profileRow} onPress={onPress} testID={testID}>
    <IconComp
      size={20}
      color={destructive ? Colors.coral : Colors.inkSoft}
      strokeWidth={1.5}
    />
    <Text
      variant="regular"
      size="base"
      color={destructive ? Colors.coral : Colors.ink}
      style={{ flex: 1 }}
      testID={`${testID}-label`}
    >
      {label}
    </Text>
    <ChevronRight size={16} color={Colors.inkFaint} />
  </Pressable>
);

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statsTrio: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  upgradeBannerContent: {
    flex: 1,
    gap: 2,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
});

export default ProfileScreen;
