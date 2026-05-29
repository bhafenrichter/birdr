import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
} from "react-native";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Video, ResizeMode } from "expo-av";
import LottieView from "lottie-react-native";
import { Colors, Spacing, BorderRadius, RarityConfig } from "../../theme";
import { Text, PrimaryButton } from "../../components/atoms";
import { BirdCardThumb } from "../../components/molecules/BirdCard";
import { usePostHog } from "../../contexts/PostHogProvider";
import type { OnboardingStackParamList } from "../../navigation/stacks/OnboardingStack";

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── Slide 1: Video demo of identifying a bird ───────────────────────────

const IdentifySlideVisual: React.FC<{ visible?: boolean }> = () => {
  const videoRef = useRef<Video>(null);

  return (
    <View style={visualStyles.videoContainer} testID="welcome-visual-identify">
      <View style={visualStyles.phoneFrame}>
        <View style={visualStyles.phoneScreen}>
          {/* Replace source with your .mp4 asset */}
          {/* e.g. require("../../../assets/onboarding/identify-demo.mp4") */}
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.paper,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="regular" size="sm" color={Colors.inkFaint}>
              Add identify-demo.mp4
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ── Slide 2: Fanned card stack (common → rare → epic) ────────────────────

const CARD_STACK = [
  {
    name: "American Robin",
    type: "Songbird",
    habitat: "Forests",
    rarity: "common" as const,
    photoUri: "https://enctbzysromgremkqykc.supabase.co/storage/v1/object/public/species-assets/illustrations/turdus-migratorius.jpg",
    delay: 0,
    rotation: -12,
    offsetX: -50,
  },
  {
    name: "Painted Bunting",
    type: "Songbird",
    habitat: "Grasslands & Farmland",
    rarity: "rare" as const,
    photoUri: "https://enctbzysromgremkqykc.supabase.co/storage/v1/object/public/species-assets/illustrations/passerina-ciris.jpg",
    delay: 2000,
    rotation: 2,
    offsetX: 0,
  },
  {
    name: "Whooping Crane",
    type: "Wading bird",
    habitat: "Coasts & Ocean",
    rarity: "legendary" as const,
    photoUri: "https://enctbzysromgremkqykc.supabase.co/storage/v1/object/public/species-assets/illustrations/grus-americana.jpg",
    contentPosition: "top",
    delay: 4000,
    rotation: -4,
    offsetX: 50,
  },
];

const CARD_THUMB_W = 170;

const FannedCard: React.FC<{
  card: (typeof CARD_STACK)[number];
  index: number;
  visible: boolean;
}> = ({ card, index, visible }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (visible && !hasAnimated.current) {
      hasAnimated.current = true;
      scale.value = withDelay(
        card.delay,
        withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.4)) }),
      );
      opacity.value = withDelay(
        card.delay,
        withTiming(1, { duration: 400 }),
      );
      translateY.value = withDelay(
        card.delay,
        withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { rotate: `${card.rotation}deg` },
      { translateX: card.offsetX },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: CARD_THUMB_W,
          zIndex: index,
        },
        animStyle,
      ]}
    >
      <BirdCardThumb
        data={{
          speciesName: card.name,
          familyName: "",
          speciesType: card.type,
          habitat: card.habitat,
          conservationTier: "LC",
          photoUri: card.photoUri,
          sightingCount: 0,
          locked: false,
          rarity: card.rarity,
          contentPosition: (card as any).contentPosition,
        }}
        testID={`welcome-card-${index}`}
      />
    </Animated.View>
  );
};

const CollectSlideVisual: React.FC<{ visible?: boolean }> = ({ visible = false }) => (
  <View style={visualStyles.cardStackContainer} testID="welcome-visual-collect">
    {CARD_STACK.map((card, i) => (
      <FannedCard key={card.name} card={card} index={i} visible={visible} />
    ))}
  </View>
);

// ── Slide 3: Lottie animation placeholder ────────────────────────────────

const HabitSlideVisual: React.FC<{ visible?: boolean }> = () => (
  <View style={visualStyles.lottieContainer} testID="welcome-visual-habit">
    <LottieView
      source={require("../../../assets/animations/streak_flame.json")}
      autoPlay
      loop
      style={{ width: 280, height: 280 }}
    />
  </View>
);

// ── Slide visuals map ────────────────────────────────────────────────────

const SLIDE_VISUALS = [IdentifySlideVisual, CollectSlideVisual, HabitSlideVisual];

const SLIDES = [
  {
    title: "Identify any bird you spot",
    body: "Take a photo and birdr tells you the species — plus habitat, size, range, conservation status, and what its call sounds like.",
  },
  {
    title: "Unlock a card for every species",
    body: "Each species becomes a collectible card with your photo as the hero. Build your personal aviary.",
  },
  {
    title: "Birding becomes a habit",
    body: "Daily streaks, milestones, and achievements turn every walk into an adventure.",
  },
];

// ── Main screen ──────────────────────────────────────────────────────────

export const WelcomeCarouselScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const posthog = usePostHog();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = () => {
    posthog.capture("onboarding_step_completed", {
      step: "welcome_carousel",
      action: "skipped",
      slide_index: currentIndex,
    });
    navigation.navigate("SignIn");
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      posthog.capture("onboarding_step_completed", {
        step: "welcome_carousel",
        action: "completed",
      });
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
        <Text
          variant="medium"
          size="sm"
          color={Colors.inkSoft}
          testID="welcome-skip-label"
        >
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
        renderItem={({ item, index }) => {
          const Visual = SLIDE_VISUALS[index];
          return (
            <View style={styles.slide} testID={`welcome-slide-${index}`}>
              {/* Visual area — top portion */}
              <View style={styles.visualArea}>
                <Visual visible={currentIndex === index} />
              </View>

              {/* Text area — bottom portion */}
              <View style={styles.textArea}>
                <Text
                  variant="bold"
                  size="2xl"
                  color={Colors.ink}
                  align="center"
                  testID={`welcome-title-${index}`}
                >
                  {item.title}
                </Text>
                <Text
                  variant="regular"
                  size="base"
                  color={Colors.inkSoft}
                  align="center"
                  testID={`welcome-body-${index}`}
                  style={{ marginTop: Spacing.md, paddingHorizontal: Spacing.md }}
                >
                  {item.body}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Pagination dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
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

// ── Styles ───────────────────────────────────────────────────────────────

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
    paddingHorizontal: Spacing.xl,
  },
  visualArea: {
    flex: 3,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  textArea: {
    flex: 2,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing.md,
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

// ── Visual styles ────────────────────────────────────────────────────────

const visualStyles = StyleSheet.create({
  // Slide 1: Video
  videoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  phoneFrame: {
    width: 160,
    height: 300,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: Colors.ink,
    backgroundColor: Colors.ink,
    overflow: "hidden",
    padding: 3,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.paper,
  },

  // Slide 2: Card stack
  cardStackContainer: {
    width: CARD_THUMB_W * 2,
    height: CARD_THUMB_W * 2.2,
    alignItems: "center",
    justifyContent: "center",
  },

  // Slide 3: Lottie
  lottieContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  lottiePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.sageTint,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WelcomeCarouselScreen;
