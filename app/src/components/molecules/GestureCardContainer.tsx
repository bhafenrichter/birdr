/**
 * GestureCardContainer — Adds 3D tilt on touch/drag to any card.
 *
 * When the user touches and drags on the card, it tilts in 3D perspective
 * following their finger. Releases spring back to flat.
 */

import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedReaction,
} from "react-native-reanimated";

interface GestureCardContainerProps {
  children: React.ReactNode;
  width: number;
  height: number;
  maxAngle?: number;
  onRotationChange?: (rx: number, ry: number) => void;
}

export const GestureCardContainer: React.FC<GestureCardContainerProps> = ({
  children,
  width,
  height,
  maxAngle = 8,
  onRotationChange,
}) => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const interpolateRotation = React.useCallback(
    (value: number, size: number, isReverse = false) => {
      "worklet";
      return interpolate(
        value,
        [0, size],
        isReverse ? [maxAngle, -maxAngle] : [-maxAngle, maxAngle],
        Extrapolation.CLAMP
      );
    },
    [maxAngle]
  );

  useAnimatedReaction(
    () => ({ x: rotateX.value, y: rotateY.value }),
    (current, previous) => {
      if (current !== previous && onRotationChange) {
        onRotationChange(current.x, current.y);
      }
    }
  );

  // Use LongPress to start tilt — avoids competing with horizontal swipe gestures
  const pressGesture = Gesture.LongPress()
    .minDuration(0)
    .maxDistance(999)
    .onStart((event) => {
      rotateX.value = withTiming(
        interpolateRotation(event.y, height, true),
        { duration: 150 }
      );
      rotateY.value = withTiming(
        interpolateRotation(event.x, width),
        { duration: 150 }
      );
    })
    .onEnd(() => {
      rotateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
    });

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-20, 20])
    .onUpdate((event) => {
      rotateX.value = interpolateRotation(event.y, height, true);
      rotateY.value = interpolateRotation(event.x, width);
    })
    .onFinalize(() => {
      rotateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
    });

  const gesture = Gesture.Simultaneous(pressGesture, panGesture);

  const rStyle = useAnimatedStyle(
    () => ({
      transform: [
        { perspective: 800 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    }),
    []
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ height, width }, rStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export default GestureCardContainer;
