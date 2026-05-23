import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Award,
  Flame,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Info,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text, PrimaryButton } from "../components/atoms";
import { DUMMY_USER, DUMMY_STREAK, DUMMY_ACHIEVEMENTS } from "../data/dummy";
import type { ProfileStackParamList } from "../navigation/stacks/ProfileStack";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const user = DUMMY_USER;
  const streak = DUMMY_STREAK;
  const unlockedCount = DUMMY_ACHIEVEMENTS.filter((a) => a.unlockedAt).length;
  const totalCount = DUMMY_ACHIEVEMENTS.length;

  return (
    <SafeAreaView style={styles.container} testID="profile-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.avatarSection} testID="profile-avatar-section">
          <View style={styles.avatar}>
            <Text variant="bold" size="xl" color={Colors.white} testID="profile-avatar-initial">
              {user.initial}
            </Text>
          </View>
          <Text
            variant="semiBold"
            size="lg"
            color={Colors.ink}
            testID="profile-display-name"
          >
            {user.displayName}
          </Text>
          <Text
            variant="regular"
            size="xs"
            color={Colors.inkSoft}
            testID="profile-member-since"
          >
            {`Member since ${formatDate(user.memberSince)}`}
          </Text>
        </View>

        {/* Stats trio */}
        <View style={styles.statsTrio} testID="profile-stats">
          <StatBlock
            value={String(user.totalCaptures)}
            label="Captures"
            testID="profile-stat-captures"
          />
          <StatBlock
            value={String(user.totalSpecies)}
            label="Species"
            testID="profile-stat-species"
          />
          <StatBlock
            value={String(streak.currentStreak)}
            label="Streak"
            testID="profile-stat-streak"
          />
        </View>

        {/* Subscription banner (free users) */}
        {!user.isSubscribed && (
          <Pressable
            style={styles.upgradeBanner}
            testID="profile-upgrade-banner"
            onPress={() => navigation.navigate("Subscription")}
          >
            <View style={styles.upgradeBannerContent}>
              <Text variant="semiBold" size="base" color={Colors.white} testID="profile-upgrade-title">
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
            label={`Streak · ${streak.currentStreak} days`}
            onPress={() => navigation.navigate("StreakDetail")}
            testID="profile-row-streak"
          />
          {user.isSubscribed ? (
            <ProfileRow
              icon={CreditCard}
              label="Manage subscription"
              onPress={() => navigation.navigate("Subscription")}
              testID="profile-row-subscription"
            />
          ) : null}
        </View>

        {/* Support links */}
        <View style={styles.section} testID="profile-support-section">
          <ProfileRow
            icon={HelpCircle}
            label="Help & FAQ"
            onPress={() => {}}
            testID="profile-row-help"
          />
          <ProfileRow
            icon={MessageSquare}
            label="Send feedback"
            onPress={() => {}}
            testID="profile-row-feedback"
          />
          <ProfileRow
            icon={Info}
            label="About · Privacy · Terms"
            onPress={() => {}}
            testID="profile-row-about"
          />
        </View>

        {/* Sign out */}
        <View style={styles.section} testID="profile-account-section">
          <ProfileRow
            icon={LogOut}
            label="Sign out"
            onPress={() => {}}
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
    <Text variant="bold" size="xl" color={Colors.ink} testID={`${testID}-value`}>
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
  <Pressable
    style={styles.profileRow}
    onPress={onPress}
    testID={testID}
  >
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
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.sage,
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
    backgroundColor: Colors.saffron,
    borderRadius: BorderRadius.xl,
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
