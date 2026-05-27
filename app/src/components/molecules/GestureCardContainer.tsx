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

  // Track the finger's position on the card (0 to width/height)
  const fingerX = useSharedValue(width / 2);
  const fingerY = useSharedValue(height / 2);

  // Start position of the touch within the card
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const tiltFromPosition = React.useCallback(
    (fx: number, fy: number) => {
      "worklet";
      // Map finger position on card to rotation angle
      // Left edge → negative rotateY (tilt left), Right edge → positive rotateY
      // Top edge → positive rotateX (tilt toward user), Bottom → negative
      const ry = interpolate(
        fx,
        [0, width],
        [-maxAngle, maxAngle],
        Extrapolation.CLAMP
      );
      const rx = interpolate(
        fy,
        [0, height],
        [maxAngle, -maxAngle],
        Extrapolation.CLAMP
      );
      return { rx, ry };
    },
    [maxAngle, width, height]
  );

  useAnimatedReaction(
    () => ({ x: rotateX.value, y: rotateY.value }),
    (current, previous) => {
      if (current !== previous && onRotationChange) {
        onRotationChange(current.x, current.y);
      }
    }
  );

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      // event.x/y is the touch point relative to the view
      startX.value = event.x;
      startY.value = event.y;
      fingerX.value = event.x;
      fingerY.value = event.y;

      const { rx, ry } = tiltFromPosition(event.x, event.y);
      rotateX.value = withTiming(rx, { duration: 150 });
      rotateY.value = withTiming(ry, { duration: 150 });
    })
    .onUpdate((event) => {
      // event.translationX/Y is the delta from start,
      // so absolute position = start + translation
      const fx = Math.max(0, Math.min(width, startX.value + event.translationX));
      const fy = Math.max(0, Math.min(height, startY.value + event.translationY));
      fingerX.value = fx;
      fingerY.value = fy;

      const { rx, ry } = tiltFromPosition(fx, fy);
      rotateX.value = rx;
      rotateY.value = ry;
    })
    .onFinalize(() => {
      rotateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
      fingerX.value = withTiming(width / 2, { duration: 300 });
      fingerY.value = withTiming(height / 2, { duration: 300 });
    });

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
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ height, width }, rStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export default GestureCardContainer;
