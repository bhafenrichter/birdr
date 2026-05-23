import React from "react";
import { Text as RNText, TextProps as RNTextProps, View } from "react-native";
import { Colors, Fonts, FontSizes, Spacing } from "../../theme";

type FontVariant = keyof typeof Fonts;
type SizeVariant = keyof typeof FontSizes;

export interface TextProps extends RNTextProps {
  variant?: FontVariant;
  size?: SizeVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  children: React.ReactNode;
  icon?: React.ReactNode;
  testID?: string;
}

export const Text: React.FC<TextProps> = ({
  variant = "regular",
  size = "base",
  color = Colors.ink,
  align = "left",
  style,
  children,
  icon,
  testID,
  ...props
}) => {
  const textStyles = [
    {
      fontFamily: Fonts[variant],
      fontSize: FontSizes[size],
      color,
      textAlign: align,
    },
    style,
  ];

  if (!icon) {
    return (
      <RNText style={textStyles} testID={testID} {...props}>
        {children}
      </RNText>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View>{icon}</View>
      <RNText
        testID={testID}
        style={[textStyles, { marginLeft: Spacing.sm }]}
        {...props}
      >
        {children}
      </RNText>
    </View>
  );
};

// Presets
export const Heading: React.FC<Omit<TextProps, "variant" | "size">> = (
  props
) => <Text variant="bold" size="2xl" {...props} />;

export const Subheading: React.FC<Omit<TextProps, "variant" | "size">> = (
  props
) => <Text variant="semiBold" size="xl" {...props} />;

export const Body: React.FC<Omit<TextProps, "variant" | "size">> = (props) => (
  <Text variant="regular" size="base" {...props} />
);

export const Caption: React.FC<Omit<TextProps, "variant" | "size">> = (
  props
) => <Text variant="regular" size="sm" color={Colors.inkSoft} {...props} />;

export default Text;
