/**
 * ShinyCardOverlay — Holographic sheen effect for bird cards.
 *
 * Uses @shopify/react-native-skia to render a radial + linear gradient
 * overlay that follows the user's finger (via GestureContainer) to create
 * a shiny, holographic card effect.
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
}

export const ShinyCardOverlay: React.FC<ShinyCardOverlayProps> = ({
  width,
  height,
  borderRadius = 17,
  gradientCenter,
}) => {
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
              "rgba(255, 255, 255, 0.04)",
              "rgba(0, 0, 0, 0.08)",
              "rgba(255, 255, 255, 0.02)",
              "rgba(0, 0, 0, 0.06)",
              "rgba(255, 255, 255, 0.03)",
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
              "hsla(0, 0%, 100%, 0.15)",
              "hsla(0, 0%, 100%, 0.05)",
              "hsla(0, 0%, 0%, 0.05)",
            ]}
            positions={[0.1, 0.3, 0.9]}
          />
        </RoundedRect>
      </Group>
    </Canvas>
  );
};

export default ShinyCardOverlay;
