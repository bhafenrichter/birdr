import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Spacing, BorderRadius } from "../../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_ASPECT = (SCREEN_WIDTH * 0.85) / (SCREEN_HEIGHT * 0.6);

const BONE_COLOR = Colors.paper;
const HIGHLIGHT_COLOR = "#E8F0E2";

const SkeletonCard: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.cellWrapper}>
      <Animated.View style={[styles.card, animStyle]}>
        <LinearGradient
          colors={[BONE_COLOR, HIGHLIGHT_COLOR]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Name area */}
          <View style={styles.nameArea}>
            <View style={styles.typeBone} />
            <View style={styles.nameBone} />
          </View>

          {/* Photo area */}
          <View style={styles.photoArea}>
            <View style={styles.photoBone} />
          </View>

          {/* Bottom area */}
          <View style={styles.bottomArea} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export const CardSkeletonGrid: React.FC<{
  count?: number;
  testID?: string;
}> = ({ count = 6, testID }) => {
  return (
    <View style={styles.grid} testID={testID}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} delay={i * 100} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
  },
  cellWrapper: {
    width: "50%",
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  card: {
    aspectRatio: CARD_ASPECT,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: 8,
  },
  nameArea: {
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    gap: 4,
  },
  typeBone: {
    width: "50%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  nameBone: {
    width: "75%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  photoArea: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  photoBone: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  bottomArea: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
});

export default CardSkeletonGrid;
