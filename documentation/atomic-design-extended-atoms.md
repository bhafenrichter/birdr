# Atomic Design System - Extended Atom Components

This document extends the core atomic design pattern with additional specialized atoms for common UI patterns.

## Table of Contents

1. [User Interface Atoms](#user-interface-atoms)
2. [Input & Selection Atoms](#input--selection-atoms)
3. [Media Atoms](#media-atoms)
4. [Layout & Container Atoms](#layout--container-atoms)
5. [Data Display Atoms](#data-display-atoms)

---

## User Interface Atoms

### Avatar

Circular component for user profile pictures or initials.

**Variants:** icon, initials
**Sizes:** `small` (32px), `medium` (40px), `large` (56px), `xlarge` (72px)

**Props:**
- `icon` - Icon element to display
- `initials` - Text initials (max 2 characters, auto-capitalized)
- `size` - Size variant
- `backgroundColor` - Background color
- `textColor` - Text color for initials
- `onPress` - Optional press handler
- `testID` - **REQUIRED**

**File: `src/components/atoms/avatar.tsx`**

```typescript
import * as React from "react";
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Colors, Fonts, FontSizes } from "../../theme";

type AvatarSize = "small" | "medium" | "large" | "xlarge";

export interface AvatarProps {
  icon?: React.ReactNode;
  initials?: string;
  size?: AvatarSize;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  testID: string; // REQUIRED
}

const Avatar: React.FC<AvatarProps> = ({
  icon,
  initials,
  size = "medium",
  backgroundColor = Colors.primary,
  textColor = Colors.foreground,
  style,
  textStyle,
  onPress,
  testID,
}) => {
  // Size mappings
  const dimensions = {
    small: { container: 32, fontSize: FontSizes.small },
    medium: { container: 40, fontSize: FontSizes.medium },
    large: { container: 56, fontSize: FontSizes.large },
    xlarge: { container: 72, fontSize: FontSizes.xxLarge },
  };

  const { container: containerSize, fontSize } = dimensions[size];

  // Format initials (max 2 chars, uppercase)
  const formattedInitials = initials
    ? initials.substring(0, 2).toUpperCase()
    : "";

  const containerStyle: ViewStyle = {
    width: containerSize,
    height: containerSize,
    borderRadius: containerSize / 2,
    backgroundColor,
    alignItems: "center",
    justifyContent: "center",
  };

  const renderContent = () => {
    if (icon) {
      return <View style={{ paddingTop: 5 }}>{icon}</View>;
    }

    if (formattedInitials) {
      return (
        <Text
          style={[
            {
              color: textColor,
              fontSize,
              fontFamily: Fonts.semiBold,
              textAlign: "center",
            },
            textStyle,
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formattedInitials}
        </Text>
      );
    }

    return null;
  };

  const avatarComponent = (
    <View style={[containerStyle, style]} testID={testID}>
      {renderContent()}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} testID={`${testID}-touchable`}>
        {avatarComponent}
      </TouchableOpacity>
    );
  }

  return avatarComponent;
};

export default Avatar;
```

**Usage:**

```typescript
import Avatar from "../atoms/avatar";
import Icon from "../atoms/icon";

// Avatar with icon
<Avatar 
  testID="user-avatar"
  icon={<Icon testID="user-icon" name="user" color={Colors.foreground} />}
  size="medium"
  backgroundColor={Colors.primary}
/>

// Avatar with initials
<Avatar testID="profile-avatar" initials="JD" size="large" backgroundColor={Colors.secondary} />

// Touchable avatar
<Avatar testID="profile-btn" initials="AB" onPress={() => navigateToProfile()} />
```

---

### Skeleton

Loading placeholder component with shimmer animation.

**Variants:** `rect`, `circle`, `avatar`, `paragraph`

**Props:**
- `variant` - Shape variant
- `width` - Width (number or percentage)
- `height` - Height
- `lines` - Number of lines (for paragraph variant)
- `style` - Custom style
- `testID` - **REQUIRED**

**File: `src/components/atoms/skeleton.tsx`**

```typescript
import * as React from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

type SkeletonVariant = "paragraph" | "avatar" | "rect" | "circle";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  lines?: number;
  testID: string; // REQUIRED
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rect",
  width,
  height,
  style,
  lines = 3,
  testID,
}) => {
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle = {
    backgroundColor: "#E1E9EE",
    overflow: "hidden" as const,
  };

  if (variant === "avatar" || variant === "circle") {
    const size = (width as number) ?? 48;
    return (
      <Animated.View
        testID={testID}
        style={[
          baseStyle,
          animatedStyle,
          {
            width: size,
            height: height ?? size,
            borderRadius: size / 2,
          },
          style,
        ]}
      />
    );
  }

  if (variant === "paragraph") {
    return (
      <View style={style} testID={testID}>
        {Array.from({ length: lines }).map((_, idx) => (
          <Animated.View
            key={idx}
            testID={`${testID}-line-${idx}`}
            style={[
              baseStyle,
              animatedStyle,
              {
                width: idx === lines - 1 ? width ?? "60%" : width ?? "100%",
                height: height ?? 12,
                marginBottom: idx === lines - 1 ? 0 : 8,
                borderRadius: 4,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  // Default: rect
  return (
    <Animated.View
      testID={testID}
      style={[
        baseStyle,
        animatedStyle,
        {
          width: width ?? "100%",
          height: height ?? 16,
          borderRadius: 4,
        },
        style,
      ]}
    />
  );
};

export default Skeleton;
```

**Usage:**

```typescript
import Skeleton from "../atoms/skeleton";

// Loading state for user profile
<View>
  <Skeleton testID="avatar-skeleton" variant="avatar" width={56} />
  <Skeleton testID="name-skeleton" width="60%" height={20} style={{ marginTop: 8 }} />
  <Skeleton testID="bio-skeleton" variant="paragraph" lines={3} />
</View>

// Loading card
<Card testID="loading-card">
  <Skeleton testID="title-skeleton" width="80%" height={24} />
  <Skeleton testID="content-skeleton" variant="paragraph" lines={4} />
</Card>
```

---

## Input & Selection Atoms

### Dropdown

Native picker component for selecting from options.

**Props:**
- `label` - Label text above dropdown
- `placeholder` - Placeholder text
- `options` - Array of `{label, value, image}` objects
- `selectedValue` - Currently selected value
- `onSelect` - Selection callback
- `disabled` - Disable interaction
- `border` - Show/hide border
- `testID` - **REQUIRED**

**File: `src/components/atoms/dropdown.tsx`**

```typescript
import React, { useRef } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Text from "./text";
import Icon from "./icon";
import { Colors, Spacing, BorderRadius, FontSizes, Fonts } from "../../theme";

export interface DropdownOption {
  label: string;
  value: string;
  image?: React.ReactElement;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  border?: boolean;
  testID: string; // REQUIRED
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = "Select an option",
  options,
  selectedValue,
  onSelect,
  disabled = false,
  border = true,
  testID,
}) => {
  const pickerRef = useRef<RNPickerSelect>(null);

  const handlePress = () => {
    if (!disabled && pickerRef.current) {
      pickerRef.current.togglePicker();
    }
  };

  const pickerStyles = {
    inputIOS: {
      backgroundColor: disabled ? Colors.border : Colors.foreground,
      borderColor: Colors.border,
      borderWidth: border ? 1 : 0,
      borderRadius: BorderRadius.medium,
      paddingHorizontal: Spacing.medium,
      paddingVertical: Spacing.medium,
      paddingRight: 30,
      minHeight: 65,
      fontSize: FontSizes.medium,
      color: Colors.primaryText,
      fontFamily: Fonts.regular,
    },
    inputAndroid: {
      backgroundColor: disabled ? Colors.border : Colors.foreground,
      borderColor: Colors.border,
      borderWidth: border ? 1 : 0,
      borderRadius: BorderRadius.medium,
      paddingHorizontal: Spacing.medium,
      paddingVertical: Spacing.medium,
      paddingRight: 30,
      minHeight: 65,
      fontSize: FontSizes.medium,
      color: Colors.primaryText,
      fontFamily: Fonts.regular,
    },
    placeholder: {
      color: Colors.secondaryText,
      fontSize: FontSizes.medium,
      fontFamily: Fonts.regular,
    },
  };

  return (
    <View style={{ marginBottom: Spacing.medium }} testID={testID}>
      {label && (
        <Text size="medium" variant="bold" style={{ marginBottom: Spacing.small }}>
          {label}
        </Text>
      )}

      {Platform.OS === "ios" ? (
        <TouchableOpacity onPress={handlePress} disabled={disabled}>
          <RNPickerSelect
            ref={pickerRef}
            onValueChange={(value) => value && onSelect(value)}
            items={options}
            placeholder={{ label: placeholder, value: null }}
            value={selectedValue}
            style={pickerStyles}
            useNativeAndroidPickerStyle={false}
            disabled={disabled}
            touchableWrapperProps={{ style: { pointerEvents: "none" } }}
            Icon={() => (
              <Icon
                testID={`${testID}-icon`}
                family="feather"
                name="chevron-down"
                size={20}
                color={disabled ? Colors.secondaryText : Colors.primary}
                style={{ top: 22, right: 15 }}
              />
            )}
          />
        </TouchableOpacity>
      ) : (
        <RNPickerSelect
          ref={pickerRef}
          onValueChange={(value) => value && onSelect(value)}
          items={options}
          placeholder={{ label: placeholder, value: null }}
          value={selectedValue}
          style={pickerStyles}
          useNativeAndroidPickerStyle={false}
          disabled={disabled}
          Icon={() => (
            <Icon
              testID={`${testID}-icon`}
              family="feather"
              name="chevron-down"
              size={20}
              color={disabled ? Colors.secondaryText : Colors.primary}
              style={{ top: 22, right: 15 }}
            />
          )}
        />
      )}
    </View>
  );
};

export default Dropdown;
```

**Usage:**

```typescript
import Dropdown from "../atoms/dropdown";

const [selected, setSelected] = useState("");

<Dropdown
  testID="category-dropdown"
  label="Category"
  placeholder="Select category"
  options={[
    { label: "Food & Dining", value: "food" },
    { label: "Transportation", value: "transport" },
    { label: "Entertainment", value: "entertainment" },
  ]}
  selectedValue={selected}
  onSelect={setSelected}
/>
```

---

### Toggle

Two-option toggle switch component.

**Props:**
- `label` - Label text
- `option1` - First option label
- `option2` - Second option label
- `onToggle` - Callback with selected option
- `initialOption` - Initially selected option
- `testID` - **REQUIRED**

**File: `src/components/atoms/toggle.tsx`**

```typescript
import React, { useState } from "react";
import { View } from "react-native";
import Text from "./text";
import Toggle from "react-native-toggle-element";
import { Colors } from "../../theme";

interface CustomToggleProps {
  label: string;
  option1: string;
  option2: string;
  onToggle: (selectedOption: string) => void;
  initialOption?: string;
  testID: string; // REQUIRED
}

const CustomToggle: React.FC<CustomToggleProps> = ({
  label,
  option1,
  option2,
  onToggle,
  initialOption,
  testID,
}) => {
  const [switchOn, setSwitchOn] = useState(initialOption === option2);

  const handlePress = () => {
    const newValue = !switchOn;
    setSwitchOn(newValue);
    onToggle(newValue ? option2 : option1);
  };

  return (
    <View
      testID={testID}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        flex: 1,
        width: "100%",
      }}
    >
      <Text>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: switchOn ? Colors.secondaryText : Colors.primary }}>
          {option1}
        </Text>
        <Toggle
          trackBar={{ height: 32, width: 64, borderWidth: 2 }}
          value={switchOn}
          onPress={handlePress}
          trackBarStyle={{ zIndex: -1, backgroundColor: Colors.border }}
          thumbStyle={{ backgroundColor: Colors.primary }}
          thumbButton={{ width: 32, height: 32 }}
          containerStyle={{
            borderRadius: 32,
            backgroundColor: Colors.border,
            justifyContent: "center",
          }}
        />
        <Text style={{ color: switchOn ? Colors.primary : Colors.secondaryText }}>
          {option2}
        </Text>
      </View>
    </View>
  );
};

export default CustomToggle;
```

**Usage:**

```typescript
import Toggle from "../atoms/toggle";

<Toggle
  testID="view-toggle"
  label="View Mode"
  option1="List"
  option2="Grid"
  onToggle={(selected) => setViewMode(selected)}
  initialOption="List"
/>
```

---

### DatePicker

Calendar-based date selection component.

**Props:**
- `initialDate` - Starting selected date
- `onConfirm` - Callback with selected date
- `minDate` - Minimum selectable date
- `maxDate` - Maximum selectable date
- `showConfirmButton` - Show/hide confirm button
- `confirmButtonText` - Confirm button text
- `testID` - **REQUIRED**

**File: `src/components/atoms/datePicker.tsx`**

```typescript
import React, { useState } from "react";
import { View } from "react-native";
import RNDatePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { BorderRadius, Colors, Spacing } from "../../theme";
import Button from "./button";

export interface DatePickerProps {
  initialDate?: Date;
  onConfirm: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  testID: string; // REQUIRED
}

const DatePicker: React.FC<DatePickerProps> = ({
  initialDate,
  onConfirm,
  minDate,
  maxDate,
  showConfirmButton = true,
  confirmButtonText = "Confirm",
  testID,
}) => {
  const defaultStyles = useDefaultStyles();
  const [selectedDate, setSelectedDate] = useState<Dayjs | undefined>(
    initialDate ? dayjs(initialDate) : undefined
  );

  const handleConfirm = () => {
    if (selectedDate && selectedDate.isValid()) {
      onConfirm(selectedDate.toDate());
    }
  };

  return (
    <View testID={testID}>
      <RNDatePicker
        styles={{
          ...defaultStyles,
          selected: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
            borderWidth: 1,
            borderRadius: BorderRadius.medium,
          },
          header: {
            color: Colors.primaryText,
            fontFamily: "Inter_600SemiBold",
          },
          weekday: {
            color: Colors.secondaryText,
            fontFamily: "Inter_400Regular",
          },
          day: {
            color: Colors.primaryText,
            fontFamily: "Inter_400Regular",
          },
        }}
        style={{ padding: Spacing.medium }}
        mode="single"
        date={selectedDate}
        onChange={(params) => {
          const newDate = params.date ? dayjs(params.date) : undefined;
          setSelectedDate(newDate);

          if (!showConfirmButton && newDate?.isValid()) {
            onConfirm(newDate.toDate());
          }
        }}
        minDate={minDate ? dayjs(minDate) : undefined}
        maxDate={maxDate ? dayjs(maxDate) : undefined}
      />
      {showConfirmButton && (
        <View style={{ paddingHorizontal: Spacing.large, paddingBottom: Spacing.large }}>
          <Button
            testID={`${testID}-confirm-btn`}
            variant="primary"
            fullWidth
            onPress={handleConfirm}
            title={confirmButtonText}
            disabled={!selectedDate?.isValid()}
          />
        </View>
      )}
    </View>
  );
};

export default DatePicker;
```

**Usage:**

```typescript
import DatePicker from "../atoms/datePicker";

<DatePicker
  testID="birth-date-picker"
  initialDate={new Date()}
  onConfirm={(date) => setSelectedDate(date)}
  minDate={new Date(1900, 0, 1)}
  maxDate={new Date()}
/>
```

---

### FileUpload

File selection component with validation.

**Props:**
- `label` - Label text
- `placeholder` - Placeholder text
- `selectedFile` - Currently selected file object
- `onFileSelect` - Selection callback
- `acceptedTypes` - Allowed file extensions
- `maxFileSize` - Maximum file size in bytes
- `disabled` - Disable interaction
- `testID` - **REQUIRED**

**File: `src/components/atoms/fileUpload.tsx`**

```typescript
import * as React from "react";
import { View, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Text from "./text";
import { Colors, Spacing, BorderRadius, FontSizes, Fonts } from "../../theme";
import Button from "./button";
import Icon from "./icon";

export interface SelectedFile {
  name: string;
  uri: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  label?: string;
  placeholder?: string;
  selectedFile?: SelectedFile | null;
  onFileSelect: (file: SelectedFile | null) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  disabled?: boolean;
  testID: string; // REQUIRED
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  placeholder = "Select file",
  selectedFile,
  onFileSelect,
  acceptedTypes = [".csv"],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  testID,
}) => {
  const handleFileSelection = async () => {
    if (disabled) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/csv"],
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Validate file size
      if (file.size && file.size > maxFileSize) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        alert(`File too large. Max size: ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      const isValidType = acceptedTypes.some((type) =>
        file.name?.toLowerCase().endsWith(type)
      );
      if (!isValidType) {
        alert(`Invalid file type. Accepted: ${acceptedTypes.join(", ")}`);
        return;
      }

      onFileSelect({
        name: file.name,
        uri: file.uri,
        size: file.size || 0,
        type: file.mimeType || "text/csv",
      });
    } catch (error) {
      console.error("File selection error:", error);
      alert("Failed to select file. Please try again.");
    }
  };

  const handleClearFile = () => {
    onFileSelect(null);
  };

  return (
    <View style={{ marginBottom: Spacing.medium }} testID={testID}>
      {label && (
        <Text size="medium" variant="bold" style={{ marginBottom: Spacing.small }}>
          {label}
        </Text>
      )}

      {selectedFile ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: BorderRadius.medium,
            paddingHorizontal: Spacing.medium,
            paddingVertical: Spacing.medium,
            backgroundColor: Colors.foreground,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="medium" size="medium">
              {selectedFile.name}
            </Text>
            <Text color="secondaryText" size="small">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </Text>
          </View>
          <TouchableOpacity onPress={handleClearFile} testID={`${testID}-clear-btn`}>
            <Icon testID={`${testID}-clear-icon`} name="x" color={Colors.dangerText} />
          </TouchableOpacity>
        </View>
      ) : (
        <Button
          testID={`${testID}-select-btn`}
          title={placeholder}
          variant="outline"
          onPress={handleFileSelection}
          disabled={disabled}
          icon={<Icon testID={`${testID}-upload-icon`} name="upload" />}
          fullWidth
        />
      )}
    </View>
  );
};

export default FileUpload;
```

**Usage:**

```typescript
import FileUpload from "../atoms/fileUpload";

const [file, setFile] = useState<SelectedFile | null>(null);

<FileUpload
  testID="csv-upload"
  label="Import Transactions"
  placeholder="Select CSV file"
  selectedFile={file}
  onFileSelect={setFile}
  acceptedTypes={[".csv"]}
  maxFileSize={5 * 1024 * 1024} // 5MB
/>
```

---

## Media Atoms

### Image

Enhanced image component with variants and border support.

**Variants:** `default`, `rounded`, `circle`, `thumbnail`

**Props:**
- `source` - Image source (required)
- `variant` - Visual style variant
- `fullWidth` - Take full container width
- `width` - Fixed width
- `aspectRatio` - Width/height ratio
- `borderWidth` - Border thickness
- `borderColor` - Border color
- `borderRadius` - Custom border radius
- `testID` - **REQUIRED**

**File: `src/components/atoms/image.tsx`**

```typescript
import * as React from "react";
import {
  Image as RNImage,
  ImageProps as RNImageProps,
  View,
  ImageStyle,
  ViewStyle,
} from "react-native";
import { Colors, BorderRadius } from "../../theme";

export type ImageVariant = "default" | "rounded" | "circle" | "thumbnail";

export interface CustomImageProps extends Omit<RNImageProps, "style"> {
  variant?: ImageVariant;
  containerStyle?: ViewStyle;
  style?: ImageStyle;
  fullWidth?: boolean;
  width?: number;
  aspectRatio?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  testID: string; // REQUIRED
}

const Image: React.FC<CustomImageProps> = ({
  source,
  variant = "default",
  containerStyle,
  style,
  fullWidth,
  width,
  aspectRatio,
  borderWidth = 1,
  borderColor = Colors.border,
  borderRadius,
  resizeMode = "cover",
  testID,
  ...rest
}) => {
  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderWidth,
      borderColor,
      overflow: "hidden",
      width: fullWidth ? "100%" : width,
      aspectRatio: aspectRatio,
    };

    switch (variant) {
      case "rounded":
        return { ...baseStyle, borderRadius: borderRadius ?? BorderRadius.medium };
      case "circle":
        return {
          ...baseStyle,
          borderRadius: borderRadius ?? 999,
          aspectRatio: aspectRatio ?? 1,
        };
      case "thumbnail":
        return {
          ...baseStyle,
          borderRadius: borderRadius ?? BorderRadius.small,
          width: 60,
          height: 60,
        };
      case "default":
      default:
        return { ...baseStyle, borderRadius: borderRadius ?? BorderRadius.small };
    }
  };

  return (
    <View style={[getContainerStyles(), containerStyle]} testID={testID}>
      <RNImage
        source={source}
        style={[{ width: "100%", height: "100%" }, style]}
        resizeMode={resizeMode}
        {...rest}
      />
    </View>
  );
};

export default Image;
```

**Usage:**

```typescript
import Image from "../atoms/image";

// Profile picture
<Image
  testID="profile-pic"
  source={{ uri: "https://example.com/profile.jpg" }}
  variant="circle"
  width={80}
/>

// Banner image
<Image
  testID="banner"
  source={require("./banner.jpg")}
  fullWidth
  aspectRatio={16/9}
  variant="rounded"
/>

// Thumbnail
<Image testID="thumb" source={productImage} variant="thumbnail" />
```

---

## Layout & Container Atoms

### Page

Root container for screen content with standardized padding, optional header, footer, and pull-to-refresh.

**Props:**
- `backgroundColor` - Page background color
- `title` - Optional page title (renders as Heading)
- `subtitle` - Optional subtitle below title
- `footer` - Optional footer component (absolute positioned)
- `verticalPadding` - Custom vertical padding
- `isInSheet` - Remove horizontal padding (for bottom sheets)
- `onRefresh` - Enable pull-to-refresh functionality
- `testID` - **REQUIRED**

**File: `src/components/atoms/page.tsx`**

```typescript
import React, { useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  Platform,
  ViewProps,
} from "react-native";
import { Colors, Spacing } from "../../theme";
import { Heading, Text } from "./text";

type PageProps = ViewProps & {
  backgroundColor?: string;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  verticalPadding?: number;
  isInSheet?: boolean;
  onRefresh?: () => Promise<void> | void;
  testID: string; // REQUIRED
};

const Page: React.FC<PageProps> = ({
  backgroundColor = Colors.background,
  style,
  children,
  title,
  subtitle,
  footer,
  verticalPadding,
  isInSheet,
  onRefresh,
  testID,
  ...rest
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const paddingTopValue =
    verticalPadding !== undefined ? verticalPadding : Spacing.xxLarge * 2;
  const containerPaddingBottomValue =
    verticalPadding !== undefined ? verticalPadding : Spacing.large;

  const footerBottomOffset = verticalPadding !== undefined ? 120 : 140;
  const footerInternalPaddingBottom =
    verticalPadding !== undefined
      ? verticalPadding
      : Platform.OS === "android"
      ? Spacing.xxLarge * 3
      : Spacing.xxLarge * 2;

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const renderHeader = () => {
    if (!title && !subtitle) return null;
    return (
      <View style={{ marginTop: Spacing.xxLarge, marginBottom: Spacing.large, gap: Spacing.medium }}>
        {title && <Heading>{title}</Heading>}
        {subtitle && <Text color="secondaryText">{subtitle}</Text>}
      </View>
    );
  };

  return (
    <View
      testID={testID}
      style={[
        {
          flex: 1,
          paddingHorizontal: Spacing.large,
          backgroundColor,
          paddingTop: paddingTopValue,
        },
        style,
      ]}
      {...rest}
    >
      {onRefresh ? (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 0 }}
          contentContainerStyle={[
            { flexGrow: 1 },
            footer != null && { paddingBottom: footerBottomOffset },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            { flex: 1, paddingHorizontal: 0 },
            footer != null && { paddingBottom: footerBottomOffset },
          ]}
        >
          {renderHeader()}
          {children}
        </View>
      )}

      {footer && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: isInSheet ? 0 : Spacing.large,
            right: isInSheet ? 0 : Spacing.large,
            paddingBottom: footerInternalPaddingBottom,
            paddingTop: Spacing.large,
            backgroundColor: backgroundColor,
            width: isInSheet ? "100%" : undefined,
            padding: isInSheet ? 0 : 8,
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
};

export default Page;
```

**Usage:**

```typescript
import Page from "../atoms/page";
import Button from "../atoms/button";

// Basic page
<Page testID="home-page" title="Dashboard" subtitle="Welcome back!">
  <Text>Page content</Text>
</Page>

// Page with footer
<Page
  testID="form-page"
  title="Profile Settings"
  footer={
    <Button testID="save-btn" title="Save Changes" variant="primary" fullWidth />
  }
>
  <FormFields />
</Page>

// Pull-to-refresh
<Page
  testID="data-page"
  title="Transactions"
  onRefresh={async () => await refetchData()}
>
  <TransactionList />
</Page>
```

---

## Data Display Atoms

### StatCard

Displays a statistic value with a label in a card.

**Props:**
- `value` - Statistic value (string or number)
- `label` - Description label
- `valueColor` - Theme color for value text
- `labelColor` - Theme color for label text
- `testID` - **REQUIRED**

**File: `src/components/atoms/statCard.tsx`**

```typescript
import * as React from "react";
import { View } from "react-native";
import Card from "./card";
import { Text } from "./text";
import { Colors } from "../../theme";

export interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: keyof typeof Colors;
  labelColor?: keyof typeof Colors;
  testID: string; // REQUIRED
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  valueColor = "primaryText",
  labelColor = "secondaryText",
  testID,
}) => {
  return (
    <Card testID={testID} padding="small" style={{ alignItems: "center", justifyContent: "center", height: 80 }}>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text variant="bold" size="xLarge" color={valueColor} align="center" style={{ marginBottom: 4 }}>
          {value.toString()}
        </Text>
        <Text variant="regular" size="small" color={labelColor} align="center">
          {label}
        </Text>
      </View>
    </Card>
  );
};

export default StatCard;
```

**Usage:**

```typescript
import StatCard from "../atoms/statCard";

<View style={{ flexDirection: "row", gap: 8 }}>
  <StatCard testID="transactions-stat" value={127} label="Transactions" />
  <StatCard testID="balance-stat" value="$1,234" label="Balance" valueColor="successText" />
  <StatCard testID="pending-stat" value={3} label="Pending" valueColor="warningText" />
</View>
```

---

### Table

Displays key-value pairs in a table format with dividers.

**Props:**
- `data` - Array of `{label, value}` objects
- `style` - Container style
- `rowStyle` - Row style
- `labelStyle` - Label text style
- `valueStyle` - Value text style
- `testID` - **REQUIRED**

**File: `src/components/atoms/table.tsx`**

```typescript
import * as React from "react";
import { View, ViewStyle, TextStyle } from "react-native";
import Text from "./text";
import { Colors, Spacing } from "../../theme";

export interface TableRowData {
  label: string;
  value: string | number | React.ReactNode;
}

export interface TableProps {
  data: TableRowData[];
  style?: ViewStyle;
  rowStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  testID: string; // REQUIRED
}

const Table: React.FC<TableProps> = ({
  data,
  style,
  rowStyle,
  labelStyle,
  valueStyle,
  testID,
}) => {
  if (!data || data.length === 0) return null;

  return (
    <View
      testID={testID}
      style={[
        {
          marginHorizontal: Spacing.small,
          backgroundColor: Colors.foreground,
        },
        style,
      ]}
    >
      {data.map((item, index) => (
        <View key={item.label + index} testID={`${testID}-row-${index}`}>
          <View
            style={[
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: Spacing.large,
                paddingHorizontal: Spacing.medium,
              },
              rowStyle,
            ]}
          >
            <Text variant="bold" style={[{ width: "30%" }, labelStyle]}>
              {item.label}
            </Text>
            {typeof item.value === "string" || typeof item.value === "number" ? (
              <Text
                color="primary"
                size="medium"
                style={[{ textAlign: "right", width: "70%" }, valueStyle]}
              >
                {item.value}
              </Text>
            ) : (
              item.value
            )}
          </View>
          {index < data.length - 1 && (
            <View
              style={{
                height: 1,
                backgroundColor: Colors.border,
                marginHorizontal: Spacing.small,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
};

export default Table;
```

**Usage:**

```typescript
import Table from "../atoms/table";

<Card testID="details-card">
  <Table
    testID="account-table"
    data={[
      { label: "Account", value: "Checking" },
      { label: "Balance", value: "$1,234.56" },
      { label: "Status", value: "Active" },
      { label: "Last Updated", value: "Today" },
    ]}
  />
</Card>
```

---

## Summary

This extended atom library provides:

✅ **User Interface** - Avatar, Skeleton for loading states  
✅ **Input & Selection** - Dropdown, Toggle, DatePicker, FileUpload  
✅ **Media** - Enhanced Image with variants  
✅ **Layout** - Page container with header, footer, pull-to-refresh  
✅ **Data Display** - StatCard, Table for structured data  

**All components include:**
- **Required testID prop** for E2E testing
- **Theme integration** - no hardcoded values
- **Type safety** - full TypeScript definitions
- **Accessibility** - proper a11y props
- **Consistent API** - similar prop patterns across atoms

**Next Steps:**
- Implement these atoms in your project
- Use them to build molecules and organisms
- Add project-specific atoms as needed
- Maintain consistency with theme and naming conventions
