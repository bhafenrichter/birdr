# Atomic Design System Pattern

This document describes the atomic design system architecture for building consistent, reusable, and maintainable UI components in React Native applications.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Theme System](#theme-system)
4. [Atomic Components](#atomic-components)
5. [Component Guidelines](#component-guidelines)
6. [Implementation Guide](#implementation-guide)
7. [Testing Requirements](#testing-requirements)
8. [Best Practices](#best-practices)

---

## Overview

### Atomic Design Principles

Atomic Design is a methodology for creating design systems with five distinct levels:

1. **Atoms** - Basic building blocks (Button, Text, Input, Icon)
2. **Molecules** - Simple groups of atoms (SearchBar = Input + Button)
3. **Organisms** - Complex groups of molecules (Header = Logo + Navigation + SearchBar)
4. **Templates** - Page layouts (Header + Sidebar + Content)
5. **Pages** - Specific instances of templates

**This documentation focuses on Atoms** - the foundation of the design system.

### Key Principles

- **Consistency** - All UI elements follow the same theme and design language
- **Reusability** - Atoms are used throughout the app, no ad-hoc styling
- **Type Safety** - TypeScript types ensure correct prop usage
- **Testability** - All components include testID for E2E testing
- **Theme-Driven** - All styling comes from centralized theme
- **Composability** - Atoms combine to form molecules and organisms
- **Accessibility** - Proper accessibility props on all components

### Integration with E2E Testing

**CRITICAL:** All atom components include `testID` props for reliable E2E testing:

- **Maestro Testing** - testIDs enable stable element selection → See `e2e-testing-pattern.md`
- **Required on ALL components** - Button, TextInput, Card, Icon, etc.
- **Auto-generated testIDs** - Text component auto-generates from children
- **Naming convention** - Use kebab-case (e.g., `submit-button`, `email-input`)

---

## Architecture

```
src/
├── theme/
│   └── index.tsx          ← Centralized theme (colors, fonts, spacing)
├── components/
│   ├── atoms/             ← Basic UI elements (36 components)
│   │   ├── button.tsx
│   │   ├── text.tsx
│   │   ├── textInput.tsx
│   │   ├── card.tsx
│   │   ├── icon.tsx
│   │   └── ...
│   ├── molecules/         ← Combinations of atoms
│   │   └── searchBar.tsx
│   └── organisms/         ← Complex UI sections
│       └── header.tsx
```

**Component Hierarchy:**
```
Pages (Screens)
    ↓
Templates (Layouts)
    ↓
Organisms (Sections)
    ↓
Molecules (Groups)
    ↓
Atoms (Primitives) ← This documentation
    ↓
Theme (Design Tokens)
```

---

## Theme System

All styling originates from a centralized theme file that defines design tokens.

**File: `src/theme/index.tsx`**

```typescript
export const Colors = {
  background: "#F8F8F8",
  foreground: "#FFFFFF",
  primaryText: "#000000",
  secondaryText: "#939191",
  primary: "#8659F1",
  primaryDark: "#6850a5",
  secondary: "#e8dff7",
  border: "#E8E8E8",
  subtle: "#B3F5FF",
  success: "#B3FFD3",
  successText: "#00AE48",
  danger: "#FFD3D3",
  dangerText: "#D33B3B",
  darkColor: "#2E2264",
  warning: "#FFF5B3",
  warningText: "#ffab45",
  google: "#0080FF",
};

// Faded colors (50% opacity) - automatically generated
export const ColorsFaded = Object.fromEntries(
  Object.entries(Colors).map(([key, value]) => [
    key,
    value.startsWith("#") ? `${value}80` : value,
  ])
) as { [K in keyof typeof Colors]: string };

export const Fonts = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export const FontSizes = {
  small: 14,
  medium: 18,
  large: 20,
  xLarge: 22,
  xxLarge: 30,
};

export const Spacing = {
  xSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  xLarge: 20,
  xxLarge: 24,
};

export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xLarge: 16,
  xxLarge: 20,
};

export const Shadows = {
  small: {
    shadowColor: Colors.darkColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.darkColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const Theme = {
  Colors,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
  ColorsFaded,
};
```

### Theme Usage

**Import theme constants in components:**

```typescript
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from "../../theme";
```

**Use theme values, never hardcode:**

```typescript
// ✅ GOOD - Using theme
backgroundColor: Colors.primary
fontSize: FontSizes.medium
padding: Spacing.large

// ❌ BAD - Hardcoded values
backgroundColor: "#8659F1"
fontSize: 18
padding: 16
```

---

## Atomic Components

### Core Atoms (Must Have)

Every project must implement these foundational atoms:

#### 1. Button

Primary interaction element for user actions.

**Variants:** `primary`, `secondary`, `success`, `danger`, `outline`, `text`, `iconButton`

**Props:**
- `title` - Button text
- `variant` - Visual style variant
- `size` - `small` | `medium` | `large`
- `isLoading` - Shows loading indicator
- `icon` - Optional icon element
- `disabled` - Disables interaction
- `testID` - **REQUIRED** for E2E testing

**File: `src/components/atoms/button.tsx`**

```typescript
import * as React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  PressableProps,
} from "react-native";
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from "../../theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline"
  | "text"
  | "iconButton";

export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends PressableProps {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  testID: string; // REQUIRED
}

const Button: React.FC<ButtonProps> = ({
  title = "",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  icon,
  iconPosition = "left",
  disabled = false,
  testID,
  ...rest
}) => {
  const getButtonStyles = () => {
    const baseStyle = {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: size === "small" ? Spacing.medium : size === "medium" ? Spacing.large : Spacing.xLarge,
      paddingHorizontal: size === "small" ? Spacing.large : size === "medium" ? Spacing.xLarge : Spacing.xxLarge,
      borderRadius: BorderRadius.xLarge,
      alignSelf: fullWidth ? "stretch" as const : "flex-start" as const,
    };

    switch (variant) {
      case "primary":
        return { ...baseStyle, backgroundColor: Colors.primary, ...Shadows.small };
      case "secondary":
        return { ...baseStyle, backgroundColor: Colors.secondary, ...Shadows.small };
      case "success":
        return { ...baseStyle, backgroundColor: Colors.success };
      case "danger":
        return { ...baseStyle, backgroundColor: Colors.danger };
      case "outline":
        return { ...baseStyle, backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.primary };
      case "text":
        return { ...baseStyle, backgroundColor: "transparent", paddingVertical: Spacing.small, paddingHorizontal: Spacing.small };
      case "iconButton":
        const iconSize = size === "small" ? 40 : size === "medium" ? 48 : 56;
        return {
          ...baseStyle,
          backgroundColor: Colors.primary,
          borderWidth: 2,
          borderColor: Colors.secondary,
          borderRadius: iconSize / 2,
          width: iconSize,
          height: iconSize,
          paddingVertical: 0,
          paddingHorizontal: 0,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary": return Colors.foreground;
      case "secondary": return Colors.darkColor;
      case "success": return Colors.successText;
      case "danger": return Colors.dangerText;
      case "outline":
      case "text": return Colors.primary;
      default: return Colors.primaryText;
    }
  };

  return (
    <Pressable
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title || "Button"}
      accessibilityState={{ disabled: disabled || isLoading }}
      testID={testID}
      style={({ pressed }) => [
        getButtonStyles(),
        pressed && !disabled && { opacity: 0.8 },
      ]}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : variant === "iconButton" ? (
        icon
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon && iconPosition === "left" && <View style={{ marginRight: Spacing.small }}>{icon}</View>}
          {title && (
            <Text
              style={{
                color: getTextColor(),
                fontFamily: Fonts.medium,
                fontSize: size === "small" ? FontSizes.small : size === "medium" ? FontSizes.medium : FontSizes.large,
              }}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === "right" && <View style={{ marginLeft: Spacing.small }}>{icon}</View>}
        </View>
      )}
    </Pressable>
  );
};

export default Button;

// Convenience exports
export const PrimaryButton = (props: Omit<ButtonProps, "variant">) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props: Omit<ButtonProps, "variant">) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props: Omit<ButtonProps, "variant">) => <Button variant="outline" {...props} />;
export const IconButton = (props: Omit<ButtonProps, "variant">) => <Button variant="iconButton" {...props} />;
```

**Usage:**

```typescript
import Button, { PrimaryButton, OutlineButton } from "../atoms/button";

<Button testID="submit-button" title="Submit" variant="primary" />
<PrimaryButton testID="save-btn" title="Save" icon={<SaveIcon />} />
<OutlineButton testID="cancel-btn" title="Cancel" size="small" />
```

---

#### 2. Text

Typography component for all text rendering.

**Variants:** `regular`, `medium`, `semiBold`, `bold`
**Sizes:** `small`, `medium`, `large`, `xLarge`, `xxLarge`
**Colors:** All theme colors

**Props:**
- `children` - **REQUIRED** Text content
- `variant` - Font weight variant
- `size` - Font size variant
- `color` - Theme color variant
- `align` - Text alignment
- `icon` - Optional icon before text
- `testID` - **Auto-generated from children**

**File: `src/components/atoms/text.tsx`**

```typescript
import * as React from "react";
import { Text as RNText, TextProps, View } from "react-native";
import { Colors, Fonts, FontSizes, Spacing } from "../../theme";

type FontVariant = keyof typeof Fonts;
type FontSizeVariant = keyof typeof FontSizes;
type ColorVariant = keyof typeof Colors;

interface TextComponentProps extends TextProps {
  variant?: FontVariant;
  size?: FontSizeVariant;
  color?: ColorVariant;
  align?: "auto" | "left" | "right" | "center" | "justify";
  children: string;
  icon?: React.ReactNode;
  iconSpacing?: keyof typeof Spacing;
}

export const Text: React.FC<TextComponentProps> = ({
  variant = "regular",
  size = "medium",
  color = "primaryText",
  align = "left",
  style,
  children,
  icon,
  iconSpacing = "small",
  ...props
}) => {
  const textStyles = [
    {
      fontFamily: Fonts[variant],
      fontSize: FontSizes[size],
      color: Colors[color],
      textAlign: align,
    },
    style,
  ];

  // Auto-generate testID from children
  const testID = children.toString().replace(/\s+/g, "-").toLowerCase();

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
        style={[textStyles, { marginLeft: Spacing[iconSpacing] }]}
        {...props}
      >
        {children}
      </RNText>
    </View>
  );
};

// Preset text variants
export const Heading = (props: Omit<TextComponentProps, "variant" | "size">) => (
  <Text variant="bold" size="xxLarge" {...props} />
);

export const Subheading = (props: Omit<TextComponentProps, "variant" | "size">) => (
  <Text variant="semiBold" size="xLarge" {...props} />
);

export const Body = (props: Omit<TextComponentProps, "variant" | "size">) => (
  <Text variant="regular" size="medium" {...props} />
);

export const Caption = (props: Omit<TextComponentProps, "variant" | "size">) => (
  <Text variant="regular" size="small" color="secondaryText" {...props} />
);

export default Text;
```

**Usage:**

```typescript
import Text, { Heading, Body, Caption } from "../atoms/text";

<Text>Default text</Text>
<Heading>Page Title</Heading>
<Body color="secondaryText">Description text</Body>
<Caption>Helper text</Caption>
<Text variant="bold" size="large" color="primary">Custom styled text</Text>
```

---

#### 3. TextInput

Input field for user text entry.

**Variants:** `default`, `success`, `error`, `subtle`

**Props:**
- `label` - Label text above input
- `placeholder` - Placeholder text
- `variant` - Visual state variant
- `errorText` - Error message (shown when variant="error")
- `helperText` - Helper text below input
- `leftIcon` - Icon on left side
- `rightIcon` - Icon on right side
- `currency` - Enable currency formatting
- `secureTextEntry` - Password mode
- `testID` - **Auto-generated from label**

**File: `src/components/atoms/textInput.tsx`**

```typescript
import React, { useState } from "react";
import {
  View,
  TextInput as RNTextInput,
  Text,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from "react-native";
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from "../../theme";

export type TextInputVariant = "default" | "success" | "error" | "subtle";

export interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: TextInputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  currency?: boolean;
  currencySymbol?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  helperText,
  errorText,
  variant = "default",
  leftIcon,
  rightIcon,
  onRightIconPress,
  fullWidth = false,
  placeholder,
  disabled = false,
  currency = false,
  currencySymbol = "$",
  value,
  onChangeText,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || "");

  React.useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  const getBorderColor = () => {
    if (disabled) return Colors.border;
    if (variant === "error") return Colors.dangerText;
    if (variant === "success") return Colors.successText;
    if (isFocused) return Colors.primary;
    return Colors.border;
  };

  const formatCurrency = (text: string): string => {
    if (!currency) return text;
    let numericValue = text.replace(/[^0-9.]/g, "");
    if (!numericValue) return "";
    
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    if (numericValue.includes(".")) {
      const [wholePart, decimalPart] = numericValue.split(".");
      const limitedDecimal = decimalPart ? decimalPart.slice(0, 2) : "";
      return wholePart + "." + limitedDecimal;
    }

    const numberPart = parseInt(numericValue, 10);
    if (isNaN(numberPart)) return "";
    return numberPart.toLocaleString("en-US");
  };

  const handleChangeText = (text: string) => {
    if (currency) {
      const formatted = formatCurrency(text);
      setInternalValue(formatted);
      const rawValue = formatted.replace(/,/g, "");
      onChangeText?.(rawValue);
    } else {
      setInternalValue(text);
      onChangeText?.(text);
    }
  };

  const getDisplayValue = () => {
    return currency && internalValue ? `${currencySymbol}${internalValue}` : internalValue;
  };

  // Auto-generate testID from label
  const testID = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;

  return (
    <View style={{ marginBottom: Spacing.medium, width: fullWidth ? "100%" : undefined }}>
      {label && (
        <Text
          accessible={true}
          accessibilityLabel={label}
          style={{
            fontFamily: Fonts.medium,
            fontSize: FontSizes.small,
            color: disabled ? Colors.secondaryText : Colors.primaryText,
            marginBottom: Spacing.small,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: BorderRadius.medium,
          paddingHorizontal: Spacing.medium,
          height: 64,
          borderColor: getBorderColor(),
          backgroundColor: disabled ? Colors.border : Colors.foreground,
        }}
      >
        {leftIcon && <View style={{ marginRight: Spacing.small }}>{leftIcon}</View>}

        <RNTextInput
          accessible={true}
          accessibilityLabel={label || placeholder}
          testID={testID}
          style={{
            flex: 1,
            fontFamily: Fonts.regular,
            fontSize: FontSizes.medium,
            paddingVertical: Spacing.medium,
            color: disabled ? Colors.secondaryText : Colors.primaryText,
          }}
          value={getDisplayValue()}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondaryText}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={handleChangeText}
          keyboardType={currency ? "numeric" : rest.keyboardType}
          {...rest}
        />

        {rightIcon && (
          <TouchableOpacity
            style={{ marginLeft: Spacing.small }}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(helperText || (variant === "error" && errorText)) && (
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: FontSizes.small,
            marginTop: Spacing.small,
            color: variant === "error" ? Colors.dangerText : variant === "success" ? Colors.successText : Colors.secondaryText,
          }}
        >
          {variant === "error" && errorText ? errorText : helperText}
        </Text>
      )}
    </View>
  );
};

export default TextInput;
```

**Usage:**

```typescript
import TextInput from "../atoms/textInput";

<TextInput label="Email" placeholder="Enter email" />
<TextInput 
  label="Password" 
  variant="error" 
  errorText="Password is required"
  secureTextEntry 
/>
<TextInput label="Amount" currency currencySymbol="$" />
```

---

#### 4. Card

Container component for grouping content.

**Variants:** `default`, `outlined`

**Props:**
- `variant` - Visual style variant
- `padding` - Internal padding (theme spacing or number)
- `borderRadius` - Border radius (theme value or number)
- `fullWidth` - Take full container width
- `noMargin` - Remove default margin
- `testID` - **REQUIRED**

**File: `src/components/atoms/card.tsx`**

```typescript
import * as React from "react";
import { View, ViewProps } from "react-native";
import { Colors, BorderRadius, Spacing } from "../../theme";

export type CardVariant = "default" | "outlined";

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  fullWidth?: boolean;
  padding?: keyof typeof Spacing | number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: keyof typeof BorderRadius | number;
  noMargin?: boolean;
  testID: string; // REQUIRED
}

const Card: React.FC<CardProps> = ({
  variant = "default",
  fullWidth = false,
  padding = "large",
  backgroundColor = Colors.foreground,
  borderColor = Colors.border,
  borderRadius = "medium",
  noMargin = false,
  children,
  testID,
  ...rest
}) => {
  const baseStyle = {
    backgroundColor,
    borderRadius: typeof borderRadius === "number" ? borderRadius : BorderRadius[borderRadius],
    padding: typeof padding === "number" ? padding : Spacing[padding],
    width: fullWidth ? "100%" : undefined,
    borderColor,
    borderWidth: variant === "outlined" ? 1 : 0,
    marginVertical: noMargin ? 0 : Spacing.small,
  };

  return (
    <View style={baseStyle} testID={testID} {...rest}>
      {children}
    </View>
  );
};

export default Card;
```

**Usage:**

```typescript
import Card from "../atoms/card";

<Card testID="profile-card">
  <Text>Card content</Text>
</Card>

<Card testID="stats-card" variant="outlined" borderColor={Colors.primary} padding="xLarge">
  <Text>Outlined card with custom padding</Text>
</Card>
```

---

#### 5. Icon

Unified icon component supporting multiple icon families.

**Icon Families:** `feather` (default), `ant`, `material`, `ion`, `awesome`, etc.

**Props:**
- `name` - **REQUIRED** Icon name
- `family` - Icon family (defaults to feather)
- `size` - Icon size (defaults to 24)
- `color` - Icon color (defaults to primaryText)
- `onPress` - Optional press handler
- `testID` - **REQUIRED**

**File: `src/components/atoms/icon.tsx`**

```typescript
import * as React from "react";
import { TouchableWithoutFeedback } from "react-native";
import { Colors } from "../../theme";
import { Feather, MaterialIcons, Ionicons, AntDesign, FontAwesome } from "@expo/vector-icons";

export type IconFamily = "feather" | "material" | "ion" | "ant" | "awesome";

export interface IconProps {
  family?: IconFamily;
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
  onPress?: () => void;
  testID: string; // REQUIRED
}

const Icon: React.FC<IconProps> = ({
  family = "feather",
  name,
  size = 24,
  color = Colors.primaryText,
  onPress,
  testID,
}) => {
  const renderIcon = () => {
    const iconProps = { name, size, color, testID };

    switch (family) {
      case "feather":
        return <Feather {...iconProps} name={name as React.ComponentProps<typeof Feather>["name"]} />;
      case "material":
        return <MaterialIcons {...iconProps} name={name as React.ComponentProps<typeof MaterialIcons>["name"]} />;
      case "ion":
        return <Ionicons {...iconProps} name={name as React.ComponentProps<typeof Ionicons>["name"]} />;
      case "ant":
        return <AntDesign {...iconProps} name={name as React.ComponentProps<typeof AntDesign>["name"]} />;
      case "awesome":
        return <FontAwesome {...iconProps} name={name as React.ComponentProps<typeof FontAwesome>["name"]} />;
      default:
        return <Feather {...iconProps} name="help-circle" />;
    }
  };

  if (onPress) {
    return (
      <TouchableWithoutFeedback onPress={onPress} testID={testID}>
        {renderIcon()}
      </TouchableWithoutFeedback>
    );
  }

  return renderIcon();
};

export default Icon;
```

**Usage:**

```typescript
import Icon from "../atoms/icon";

<Icon testID="home-icon" name="home" />
<Icon testID="user-icon" family="material" name="person" size={32} color={Colors.primary} />
<Icon testID="delete-icon" name="trash" onPress={handleDelete} />
```

---

### Additional Recommended Atoms

#### 6. Page (Container)

Root container for screen content with consistent padding and background.

#### 7. Divider

Horizontal or vertical line separator.

#### 8. Avatar

Circular image component for user profiles.

#### 9. Pill/Badge

Small label or tag component.

#### 10. Toggle/Switch

Boolean input component.

---

## Component Guidelines

### Required Props

**Every atom component MUST include:**

1. **testID** - Required for E2E testing (Maestro, Detox, etc.)
2. **Accessibility props** - `accessible`, `accessibilityRole`, `accessibilityLabel`
3. **TypeScript types** - Full type definitions for all props
4. **Theme integration** - All styling from theme, no hardcoded values

### Component Structure Template

```typescript
import * as React from "react";
import { View, ViewProps } from "react-native";
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from "../../theme";

// 1. Define prop types
export interface MyAtomProps extends ViewProps {
  variant?: "default" | "alternate";
  size?: "small" | "medium" | "large";
  testID: string; // REQUIRED
}

// 2. Component implementation
const MyAtom: React.FC<MyAtomProps> = ({
  variant = "default",
  size = "medium",
  testID,
  children,
  ...rest
}) => {
  // 3. Theme-based styling
  const getStyles = () => {
    return {
      backgroundColor: Colors.foreground,
      padding: Spacing[size],
      borderRadius: BorderRadius.medium,
    };
  };

  // 4. Render with accessibility
  return (
    <View
      accessible={true}
      accessibilityRole="..." 
      testID={testID}
      style={getStyles()}
      {...rest}
    >
      {children}
    </View>
  );
};

export default MyAtom;
```

---

## Implementation Guide

### Step 1: Set Up Theme

**File: `src/theme/index.tsx`**

Copy the complete theme system from the template above.

**Key exports:**
- `Colors` - Color palette
- `Fonts` - Font families
- `FontSizes` - Typography scale
- `Spacing` - Spacing scale
- `BorderRadius` - Border radius scale
- `Shadows` - Shadow presets

---

### Step 2: Create Atoms Directory

```bash
mkdir -p src/components/atoms
```

---

### Step 3: Implement Core Atoms

Start with the 5 essential atoms:

1. **Button** - Primary interaction
2. **Text** - Typography
3. **TextInput** - User input
4. **Card** - Content container
5. **Icon** - Visual symbols

Use the implementation examples provided above.

---

### Step 4: Add Project-Specific Atoms

Based on your app's needs, add:

- **Page** - Screen container
- **Avatar** - User profile images
- **Divider** - Content separators
- **Pill/Badge** - Labels and tags
- **Toggle** - Boolean inputs
- **Skeleton** - Loading placeholders
- **StatCard** - Metric displays
- **Charts** - Data visualizations

---

### Step 5: Build Molecules from Atoms

Combine atoms to create molecules:

```typescript
// Molecule: SearchBar (TextInput + Icon)
import TextInput from "../atoms/textInput";
import Icon from "../atoms/icon";

const SearchBar = () => (
  <TextInput
    testID="search-input"
    placeholder="Search..."
    leftIcon={<Icon testID="search-icon" name="search" />}
  />
);
```

---

## Testing Requirements

### TestID Requirements

**CRITICAL:** All atomic components MUST include `testID` prop.

**Why?**
- Enables E2E testing with Maestro, Detox, Appium
- Allows automated UI testing
- Required for CI/CD pipelines
- Improves debugging and element location

**TestID Conventions:**

```typescript
// Use kebab-case
testID="submit-button"
testID="email-input"
testID="profile-card"

// Include context when needed
testID="login-submit-button"
testID="signup-email-input"
testID="dashboard-profile-card"

// Auto-generate for text components
testID={children.toString().replace(/\s+/g, "-").toLowerCase()}
```

### E2E Testing Example (Maestro)

```yaml
# test-login.yaml
appId: com.yourapp
---
- tapOn:
    id: "email-input"
- inputText: "user@example.com"
- tapOn:
    id: "password-input"
- inputText: "password123"
- tapOn:
    id: "login-submit-button"
- assertVisible:
    id: "dashboard-title"
```

---

## Best Practices

### 1. Never Hardcode Styling

```typescript
// ❌ BAD - Hardcoded values
<View style={{ padding: 16, backgroundColor: "#8659F1" }}>

// ✅ GOOD - Using theme
<View style={{ padding: Spacing.large, backgroundColor: Colors.primary }}>
```

---

### 2. Always Use Type-Safe Props

```typescript
// ❌ BAD - Any type
interface ButtonProps {
  variant: any;
  size: any;
}

// ✅ GOOD - Specific types
interface ButtonProps {
  variant: "primary" | "secondary" | "outline";
  size: "small" | "medium" | "large";
}
```

---

### 3. Include Accessibility Props

```typescript
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the registration form"
  testID="submit-button"
>
```

---

### 4. Provide Convenience Exports

```typescript
// Export base component
export default Button;

// Export presets for common use cases
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
```

---

### 5. Use Consistent Naming

- Component files: `button.tsx`, `textInput.tsx`, `card.tsx`
- Component names: `Button`, `TextInput`, `Card` (PascalCase)
- Props interfaces: `ButtonProps`, `TextInputProps`, `CardProps`
- Variants: Lowercase strings - `"primary"`, `"outlined"`, `"small"`

---

### 6. Document with JSDoc

```typescript
/**
 * Button component that adapts its appearance based on variant prop
 *
 * @example
 * // Primary button
 * <Button testID="btn" title="Submit" variant="primary" />
 *
 * // Outline button with icon
 * <Button testID="btn" title="Delete" variant="outline" icon={<Icon />} />
 */
const Button: React.FC<ButtonProps> = ({ ... }) => { ... };
```

---

### 7. Support Dark Mode (Future)

Structure theme to support dark mode:

```typescript
const LightColors = { ... };
const DarkColors = { ... };

export const Colors = __DEV__ ? LightColors : LightColors; // Switch based on mode
```

---

### 8. Test Atoms in Isolation

Create a component library screen to preview all atoms:

```typescript
// ComponentLibrary.tsx
export const ComponentLibrary = () => (
  <ScrollView>
    <Heading>Buttons</Heading>
    <Button testID="primary-btn" title="Primary" variant="primary" />
    <Button testID="secondary-btn" title="Secondary" variant="secondary" />
    
    <Heading>Text</Heading>
    <Heading>Heading Example</Heading>
    <Body>Body text example</Body>
    <Caption>Caption text</Caption>
    
    {/* Preview all atoms... */}
  </ScrollView>
);
```

---

## Summary

This atomic design pattern provides:

✅ **Centralized theme** - all styling from one source  
✅ **Reusable components** - atoms used throughout app  
✅ **Type safety** - TypeScript types for all props  
✅ **Testability** - required testID on all components  
✅ **Accessibility** - proper a11y props on all elements  
✅ **Consistency** - uniform design language  
✅ **Scalability** - atoms combine to form complex UIs  
✅ **Maintainability** - centralized theme makes global changes easy  

**Next Steps:**
- Set up theme system with design tokens
- Implement 5 core atoms (Button, Text, TextInput, Card, Icon)
- Add testID to all atoms
- Build molecules by combining atoms
- Create component library screen for preview
- Write E2E tests using testIDs
- Expand atom library based on app needs
