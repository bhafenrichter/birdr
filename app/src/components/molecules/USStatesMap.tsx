/**
 * USStatesMap — SVG map with pulsing highlighted states.
 *
 * Layers:
 * 1. State fills (uniform green)
 * 2. State borders
 * 3. Animated pulsing fill on highlighted states
 */

import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { US_STATE_PATHS } from "../../data/usStatePaths";
import { Colors } from "../../theme";

const AnimatedG = Animated.createAnimatedComponent(G);

const STATE_COLOR = "#5dab1e";

interface USStatesMapProps {
  highlightedStates?: string[];
  highlightColor?: string;
  width?: number | string;
  height?: number | string;
  testID?: string;
}

export const USStatesMap: React.FC<USStatesMapProps> = ({
  highlightedStates = [],
  highlightColor = "#fd4778",
  width = "100%",
  height,
  testID,
}) => {
  const highlightSet = useMemo(
    () => new Set(highlightedStates),
    [highlightedStates],
  );
  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const pulseProps = useAnimatedProps(() => ({
    opacity: pulseOpacity.value,
  }));

  const { basePaths, highlightPaths } = useMemo(() => {
    const base: [string, string][] = [];
    const highlight: [string, string][] = [];
    for (const [code, d] of Object.entries(US_STATE_PATHS)) {
      base.push([code, d]);
      if (highlightSet.has(code)) {
        highlight.push([code, d]);
      }
    }
    return { basePaths: base, highlightPaths: highlight };
  }, [highlightSet]);

  return (
    <View style={[styles.container, { width, height }]} testID={testID}>
      <Svg
        viewBox="0 0 959 593"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
      >
        {/* All states — green fill */}
        <G>
          {basePaths.map(([code, d]) => (
            <Path
              key={code}
              d={d}
              fill={STATE_COLOR}
              stroke={Colors.sageTint}
              strokeWidth={0.6}
              strokeLinejoin="round"
            />
          ))}
        </G>

        {/* Highlighted states — pulsing */}
        <AnimatedG animatedProps={pulseProps}>
          {highlightPaths.map(([code, d]) => (
            <Path
              key={code}
              d={d}
              fill={highlightColor}
              stroke={Colors.sageTint}
              strokeWidth={1}
              strokeLinejoin="round"
            />
          ))}
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default USStatesMap;
