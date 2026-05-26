/**
 * ShinyCardOverlay — Holographic sheen effect for bird cards.
 * Intensity scales with rarity tier (0.3 common → 1.0 legendary).
 */

import React from "react";
import {
  Canvas,
  RadialGradient,
  vec,
  LinearGradient,
  Group,
  RoundedRect,
} from "@shopify/react-native-skia";

interface ShinyCardOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  gradientCenter: { x: number; y: number };
  /** 0-1 shimmer strength. 0.3 = subtle, 1.0 = maximum holographic */
  intensity?: number;
}

export const ShinyCardOverlay: React.FC<ShinyCardOverlayProps> = ({
  width,
  height,
  borderRadius = 17,
  gradientCenter,
  intensity = 0.3,
}) => {
  // Scale opacity values by intensity
  const s = intensity;

  return (
    <Canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        borderRadius,
      }}
      pointerEvents="none"
    >
      <Group blendMode="overlay">
        {/* Linear shine sweep */}
        <RoundedRect x={0} y={0} r={borderRadius} width={width} height={height}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: width, y: height }}
            colors={[
              `rgba(255, 255, 255, ${0.04 * s})`,
              `rgba(0, 0, 0, ${0.1 * s})`,
              `rgba(255, 255, 255, ${0.03 * s})`,
              `rgba(0, 0, 0, ${0.08 * s})`,
              `rgba(255, 255, 255, ${0.04 * s})`,
            ]}
          />
        </RoundedRect>

        {/* Radial glare that follows touch */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          r={borderRadius}
          height={height}
          color="white"
        >
          <RadialGradient
            c={vec(gradientCenter.x, gradientCenter.y)}
            r={Math.max(width, height)}
            colors={[
              `hsla(0, 0%, 100%, ${0.5 * s})`,
              `hsla(0, 0%, 100%, ${0.15 * s})`,
              `hsla(0, 0%, 0%, ${0.1 * s})`,
            ]}
            positions={[0.1, 0.3, 0.9]}
          />
        </RoundedRect>
      </Group>
    </Canvas>
  );
};

export default ShinyCardOverlay;
