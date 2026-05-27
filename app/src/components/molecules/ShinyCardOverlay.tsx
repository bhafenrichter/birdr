/**
 * ShinyCardOverlay — Holographic sheen effect for bird cards.
 * Intensity scales with rarity tier (0.3 common → 1.0 legendary).
 * Glare hue tinted to match rarity color.
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
  /** Hue for the glare tint (degrees 0-360). Defaults to 0 (white/neutral). */
  hue?: number;
  /** When true, skip the colored radial light — just use the white overlay. */
  noColor?: boolean;
}

// Rarity hue presets (used via theme config)
// common=45 (warm gold), uncommon=130 (green), rare=210 (blue),
// epic=280 (purple), legendary=30 (orange-gold)

export const ShinyCardOverlay: React.FC<ShinyCardOverlayProps> = ({
  width,
  height,
  borderRadius = 17,
  gradientCenter,
  intensity = 0.3,
  hue = 0,
  noColor = false,
}) => {
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
      {/* Linear shine sweep — overlay blend for depth */}
      <Group blendMode="overlay">
        <RoundedRect x={0} y={0} r={borderRadius} width={width} height={height}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: width, y: height }}
            colors={[
              `hsla(${hue}, 80%, 85%, ${0.06 * s})`,
              `hsla(${hue}, 60%, 10%, ${0.12 * s})`,
              `hsla(${hue}, 80%, 85%, ${0.04 * s})`,
              `hsla(${hue}, 60%, 10%, ${0.10 * s})`,
              `hsla(${hue}, 80%, 85%, ${0.06 * s})`,
            ]}
          />
        </RoundedRect>
      </Group>

      {/* Colored radial light — screen blend so it adds colored light */}
      {!noColor && (
        <Group blendMode="screen">
          <RoundedRect
            x={0}
            y={0}
            width={width}
            r={borderRadius}
            height={height}
          >
            <RadialGradient
              c={vec(gradientCenter.x, gradientCenter.y)}
              r={Math.max(width, height) * 0.8}
              colors={[
                `hsla(${hue}, 100%, 75%, ${0.35 * s})`,
                `hsla(${hue}, 80%, 60%, ${0.1 * s})`,
                `hsla(${hue}, 0%, 0%, 0)`,
              ]}
              positions={[0, 0.35, 0.8]}
            />
          </RoundedRect>
        </Group>
      )}
    </Canvas>
  );
};

export default ShinyCardOverlay;
