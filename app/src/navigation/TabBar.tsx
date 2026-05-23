import React from "react";
import { View, Pressable, Text as RNText, StyleSheet, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Binoculars, BookOpen, Compass, User } from "lucide-react-native";
import { Colors, Fonts, FontSizes, Spacing } from "../theme";
import type { LucideIcon } from "lucide-react-native";

const TAB_ICONS: Record<string, LucideIcon> = {
  Capture: Binoculars,
  Collection: BookOpen,
  Explore: Compass,
  Profile: User,
};

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <>
      {/* Sage top border */}
      <View style={styles.topBorder} />

      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const IconComponent = TAB_ICONS[route.name] ?? User;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              testID={`tab-${route.name.toLowerCase()}`}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={String(label)}
            >
              {/* Active dot indicator */}
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isFocused ? Colors.sage : "transparent" },
                ]}
              />

              <IconComponent
                size={22}
                color={isFocused ? Colors.sage : Colors.inkFaint}
                strokeWidth={isFocused ? 2 : 1.5}
              />

              <RNText
                style={[
                  styles.label,
                  {
                    color: isFocused ? Colors.sage : Colors.inkFaint,
                    fontFamily: isFocused ? Fonts.semiBold : Fonts.regular,
                  },
                ]}
              >
                {String(label)}
              </RNText>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <View
      style={[
        styles.outerContainer,
        { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
      ]}
      testID="tab-bar"
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={80}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {/* Semi-transparent mint tint over the blur */}
      <View style={styles.tintOverlay} />
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    overflow: "hidden",
  },
  tintOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Platform.OS === "ios" ? "rgba(234,245,229,0.75)" : Colors.cream,
  },
  topBorder: {
    height: 2,
    backgroundColor: Colors.sage,
  },
  tabRow: {
    flexDirection: "row",
    paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  label: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
});

export default TabBar;
