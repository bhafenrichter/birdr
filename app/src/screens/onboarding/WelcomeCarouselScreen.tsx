import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Binoculars, BookOpen, Flame } from "lucide-react-native";
import { Colors, Spacing, BorderRadius } from "../../theme";
import { Text, PrimaryButton } from "../../components/atoms";
import { usePostHog } from "../../contexts/PostHogProvider";
import type { OnboardingStackParamList } from "../../navigation/stacks/OnboardingStack";

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: Binoculars,
    title: "Identify any bird you spot",
    body: "Take a photo and birdr tells you the species — plus habitat, size, range, conservation status, and what its call sounds like.",
  },
  {
    icon: BookOpen,
    title: "Unlock a card for every species",
    body: "Each species becomes a collectible card with your photo as the hero. Build your personal aviary.",
  },
  {
    icon: Flame,
    title: "Birding becomes a habit",
    body: "Daily streaks, milestones, and achievements turn every walk into an adventure.",
  },
];

export const WelcomeCarouselScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const posthog = usePostHog();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = () => {
    posthog.capture("onboarding_step_completed", { step: "welcome_carousel", action: "skipped", slide_index: currentIndex });
    navigation.navigate("SignIn");
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      posthog.capture("onboarding_step_completed", { step: "welcome_carousel", action: "completed" });
      navigation.navigate("SignIn");
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="welcome-carousel-screen">
      {/* Skip */}
      <Pressable
        style={styles.skipButton}
        onPress={handleSkip}
        testID="welcome-skip"
      >
        <Text variant="medium" size="sm" color={Colors.inkSoft} testID="welcome-skip-label">
          Skip
        </Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => (
          <View style={styles.slide} testID={`welcome-slide-${index}`}>
            <View style={styles.iconCircle}>
              <item.icon
                size={48}
                color={Colors.sage}
                strokeWidth={1.5}
              />
            </View>
            <Text
              variant="bold"
              size="2xl"
              color={Colors.ink}
              align="center"
              testID={`welcome-title-${index}`}
              style={{ marginTop: Spacing["2xl"] }}
            >
              {item.title}
            </Text>
            <Text
              variant="regular"
              size="base"
              color={Colors.inkSoft}
              align="center"
              testID={`welcome-body-${index}`}
              style={{ marginTop: Spacing.md, paddingHorizontal: Spacing.xl }}
            >
              {item.body}
            </Text>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive,
            ]}
            testID={`welcome-dot-${i}`}
          />
        ))}
      </View>

      {/* Next / Get started */}
      <View style={styles.ctaWrapper}>
        <PrimaryButton
          title={currentIndex === SLIDES.length - 1 ? "Get started" : "Next"}
          size="lg"
          fullWidth
          onPress={handleNext}
          testID="welcome-next"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.sageTint,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.paper,
  },
  dotActive: {
    backgroundColor: Colors.sage,
    width: 24,
  },
  ctaWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});

export default WelcomeCarouselScreen;
