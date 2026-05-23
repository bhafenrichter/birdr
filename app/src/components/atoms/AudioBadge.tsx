import React from "react";
import { Pressable, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Shadows } from "../../theme";
import { Volume2 } from "lucide-react-native";

export interface AudioBadgeProps {
  size?: number;
  onPress?: () => void;
  testID: string;
}

export const AudioBadge: React.FC<AudioBadgeProps> = ({
  size = 28,
  onPress,
  testID,
}) => {
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: "hidden",
    ...Shadows.sm,
  };

  const gradientStyle: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Play bird call"
    >
      <LinearGradient
        colors={[Colors.sage, Colors.sageLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={gradientStyle}
      >
        <Volume2 size={size * 0.5} color={Colors.white} strokeWidth={2} />
      </LinearGradient>
    </Pressable>
  );
};

export default AudioBadge;
