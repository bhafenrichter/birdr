# Haptic Feedback Pattern

## Overview

This document describes the haptic feedback architecture for enhancing user experience through tactile responses to interactions in React Native applications. The pattern provides platform-optimized haptic feedback using native APIs for iOS and vibration patterns for Android.

**Key Benefits:**
- ✅ **Enhanced UX** - Tactile confirmation of user actions
- ✅ **Platform-optimized** - Native haptics on iOS, vibration on Android
- ✅ **Semantic feedback** - 9 pre-defined feedback types for common interactions
- ✅ **Easy integration** - Simple hook-based API
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Customizable** - Support for custom vibration patterns

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│           HapticFeedbackProvider                       │
│         (Context wrapping entire app)                  │
└────────────────┬───────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │                         │
┌───▼──────────┐    ┌────────▼──────────┐
│ useVibration │    │ useHapticFeedback │
│   (Hook)     │    │      (Hook)       │
└───┬──────────┘    └────────┬──────────┘
    │                        │
    │ Basic Vibrations       │ Semantic Methods
    │ - vibrateLight()       │ - navigationFeedback()
    │ - vibrateMedium()      │ - buttonPressFeedback()
    │ - vibrateHeavy()       │ - successFeedback()
    │ - vibrateCustom()      │ - errorFeedback()
    │ - stopVibration()      │ - warningFeedback()
    │                        │ - selectionFeedback()
    │                        │ - destructiveFeedback()
    │                        │ - notificationFeedback()
    │                        │ - refreshFeedback()
    │                        │
    └────────────┬───────────┘
                 │
    ┌────────────▼────────────────┐
    │   Platform-Specific APIs    │
    │                             │
    │ iOS: Expo Haptics           │
    │ - ImpactFeedbackStyle       │
    │ - NotificationFeedbackType  │
    │                             │
    │ Android: Vibration API      │
    │ - Duration-based patterns   │
    └─────────────────────────────┘
```

**Provider Hierarchy:**

```tsx
<HapticFeedbackProvider>    {/* Provides haptic methods app-wide */}
  <NavigationProvider>      {/* Can use haptic on tab press */}
    <YourApp />
  </NavigationProvider>
</HapticFeedbackProvider>
```

---

## Core Dependencies

### Required NPM Packages

```json
{
  "expo-haptics": "~13.0.1"
}
```

**Note:** React Native's built-in `Vibration` API is used (no installation needed).

### Installation

```bash
# For Expo projects
npx expo install expo-haptics

# For bare React Native projects
npm install expo-haptics
```

---

## Implementation Guide

### Step 1: Create Base Vibration Hook

Create `src/hooks/useVibration.ts`:

```typescript
import { useCallback } from "react";
import { Vibration, Platform } from "react-native";
import * as Haptics from "expo-haptics";

export interface VibrationOptions {
  /** Duration in milliseconds for Android, ignored on iOS */
  duration?: number;
  /** Vibration pattern (array of durations) for more complex vibrations */
  pattern?: number[];
  /** Whether to repeat the pattern (Android only) */
  repeat?: boolean;
}

export interface UseVibrationReturn {
  /** Trigger a very subtle light haptic feedback (iOS) / short vibration (Android) */
  vibrateLight: () => void;
  /** Trigger a medium intensity haptic feedback (iOS) / medium vibration (Android) */
  vibrateMedium: () => void;
  /** Trigger a strong haptic feedback (iOS) / heavy vibration (Android) */
  vibrateHeavy: () => void;
  /** Trigger a custom vibration with specific options */
  vibrateCustom: (options: VibrationOptions) => void;
  /** Stop any ongoing vibration */
  stopVibration: () => void;
  /** Check if vibration is supported on this device */
  isVibrationSupported: boolean;
}

/**
 * Custom hook for handling device vibration with different intensity levels
 * Uses Expo Haptics for subtle iOS feedback and Vibration API for Android
 */
export const useVibration = (): UseVibrationReturn => {
  // Check if vibration is supported
  const isVibrationSupported =
    Platform.OS === "ios" || Platform.OS === "android";

  const vibrateLight = useCallback(() => {
    if (!isVibrationSupported) return;

    if (Platform.OS === "ios") {
      // Use very subtle iOS haptic feedback - lightest possible
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Android: very short vibration (25ms)
      Vibration.vibrate(25);
    }
  }, [isVibrationSupported]);

  const vibrateMedium = useCallback(() => {
    if (!isVibrationSupported) return;

    if (Platform.OS === "ios") {
      // Medium intensity iOS haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      // Android: medium duration (100ms)
      Vibration.vibrate(100);
    }
  }, [isVibrationSupported]);

  const vibrateHeavy = useCallback(() => {
    if (!isVibrationSupported) return;

    if (Platform.OS === "ios") {
      // Heavy intensity iOS haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      // Android: longer duration (200ms)
      Vibration.vibrate(200);
    }
  }, [isVibrationSupported]);

  const vibrateCustom = useCallback(
    (options: VibrationOptions) => {
      if (!isVibrationSupported) return;

      const { duration = 100, pattern, repeat = false } = options;

      if (pattern) {
        // Use pattern if provided
        if (Platform.OS === "android" && repeat) {
          Vibration.vibrate(pattern, repeat);
        } else {
          Vibration.vibrate(pattern);
        }
      } else {
        // Use simple duration
        if (Platform.OS === "ios") {
          // For custom durations on iOS, use appropriate haptic based on duration
          if (duration <= 50) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else if (duration <= 150) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        } else {
          Vibration.vibrate(duration);
        }
      }
    },
    [isVibrationSupported]
  );

  const stopVibration = useCallback(() => {
    if (!isVibrationSupported) return;
    Vibration.cancel();
  }, [isVibrationSupported]);

  return {
    vibrateLight,
    vibrateMedium,
    vibrateHeavy,
    vibrateCustom,
    stopVibration,
    isVibrationSupported,
  };
};

export default useVibration;
```

**Key Features:**
- ✅ Platform detection (iOS vs Android)
- ✅ Three intensity levels (light, medium, heavy)
- ✅ Custom vibration patterns
- ✅ Stop ongoing vibrations
- ✅ Type-safe with TypeScript

---

### Step 2: Create Semantic Haptic Feedback Hook

Create `src/hooks/useHapticFeedback.ts`:

```typescript
import { useCallback } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useVibration } from "./useVibration";

/**
 * Higher-level hook that provides semantic vibration patterns for common UI interactions
 * Built on top of useVibration hook with platform-optimized feedback:
 * - iOS: Uses native haptic feedback APIs (Expo Haptics) for subtle, refined feedback
 * - Android: Uses Vibration API with duration-based patterns
 */
export const useHapticFeedback = () => {
  const { vibrateLight, vibrateMedium, vibrateHeavy, vibrateCustom } =
    useVibration();

  // Navigation feedback (tab switches, screen changes)
  const navigationFeedback = useCallback(() => {
    vibrateLight();
  }, [vibrateLight]);

  // Button press feedback
  const buttonPressFeedback = useCallback(() => {
    vibrateLight();
  }, [vibrateLight]);

  // Success feedback (successful form submission, action completed)
  const successFeedback = useCallback(() => {
    if (Platform.OS === "ios") {
      // Use iOS success notification haptic - specifically designed for success states
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Android: Two quick pulses
      vibrateCustom({
        pattern: [0, 50, 30, 50],
      });
    }
  }, [vibrateCustom]);

  // Error feedback (form validation errors, failed actions)
  const errorFeedback = useCallback(() => {
    if (Platform.OS === "ios") {
      // Use iOS error notification haptic - specifically designed for error states
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      // Android: Three medium pulses
      vibrateCustom({
        pattern: [0, 100, 50, 100, 50, 100],
      });
    }
  }, [vibrateCustom]);

  // Warning feedback (caution messages, confirmations needed)
  const warningFeedback = useCallback(() => {
    if (Platform.OS === "ios") {
      // Use iOS warning notification haptic - specifically designed for warning states
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      // Android: Long then short pulse
      vibrateCustom({
        pattern: [0, 200, 100, 100],
      });
    }
  }, [vibrateCustom]);

  // Selection feedback (selecting item from list, picker changes)
  const selectionFeedback = useCallback(() => {
    vibrateLight();
  }, [vibrateLight]);

  // Delete/destructive action feedback
  const destructiveFeedback = useCallback(() => {
    vibrateHeavy();
  }, [vibrateHeavy]);

  // Notification feedback (new message, alert received)
  const notificationFeedback = useCallback(() => {
    vibrateMedium();
  }, [vibrateMedium]);

  // Pull to refresh feedback
  const refreshFeedback = useCallback(() => {
    vibrateCustom({
      pattern: [0, 30, 20, 30, 20, 30], // Three quick light pulses
    });
  }, [vibrateCustom]);

  return {
    navigationFeedback,
    buttonPressFeedback,
    successFeedback,
    errorFeedback,
    warningFeedback,
    selectionFeedback,
    destructiveFeedback,
    notificationFeedback,
    refreshFeedback,
  };
};

export default useHapticFeedback;
```

**Semantic Feedback Types:**

| Method | Use Case | iOS Haptic | Android Pattern |
|--------|----------|------------|-----------------|
| `navigationFeedback()` | Tab switches, screen navigation | Light impact | 25ms |
| `buttonPressFeedback()` | Button taps | Light impact | 25ms |
| `successFeedback()` | Form submission, action success | Success notification | Two 50ms pulses |
| `errorFeedback()` | Validation errors, failures | Error notification | Three 100ms pulses |
| `warningFeedback()` | Warnings, confirmations | Warning notification | 200ms + 100ms |
| `selectionFeedback()` | List selection, picker changes | Light impact | 25ms |
| `destructiveFeedback()` | Delete actions | Heavy impact | 200ms |
| `notificationFeedback()` | New messages, alerts | Medium impact | 100ms |
| `refreshFeedback()` | Pull to refresh | Custom pattern | Three 30ms pulses |

---

### Step 3: Create HapticFeedbackProvider

Create `src/contexts/hapticFeedback.tsx`:

```typescript
import React, { createContext, useContext, ReactNode } from "react";
import { useVibration, useHapticFeedback } from "../hooks";
import type { UseVibrationReturn } from "../hooks/useVibration";

interface HapticFeedbackContextType {
  // Core vibration methods
  vibration: UseVibrationReturn;
  // Semantic haptic feedback methods
  haptic: {
    navigationFeedback: () => void;
    buttonPressFeedback: () => void;
    successFeedback: () => void;
    errorFeedback: () => void;
    warningFeedback: () => void;
    selectionFeedback: () => void;
    destructiveFeedback: () => void;
    notificationFeedback: () => void;
    refreshFeedback: () => void;
  };
}

const HapticFeedbackContext = createContext<
  HapticFeedbackContextType | undefined
>(undefined);

interface HapticFeedbackProviderProps {
  children: ReactNode;
}

export const HapticFeedbackProvider: React.FC<HapticFeedbackProviderProps> = ({
  children,
}) => {
  const vibration = useVibration();
  const hapticFeedback = useHapticFeedback();

  const haptic = {
    navigationFeedback: hapticFeedback.navigationFeedback,
    buttonPressFeedback: hapticFeedback.buttonPressFeedback,
    successFeedback: hapticFeedback.successFeedback,
    errorFeedback: hapticFeedback.errorFeedback,
    warningFeedback: hapticFeedback.warningFeedback,
    selectionFeedback: hapticFeedback.selectionFeedback,
    destructiveFeedback: hapticFeedback.destructiveFeedback,
    notificationFeedback: hapticFeedback.notificationFeedback,
    refreshFeedback: hapticFeedback.refreshFeedback,
  };

  const value: HapticFeedbackContextType = {
    vibration,
    haptic,
  };

  return (
    <HapticFeedbackContext.Provider value={value}>
      {children}
    </HapticFeedbackContext.Provider>
  );
};

/**
 * Hook to access vibration and haptic feedback throughout the app
 *
 * @example
 * // In any component:
 * const { vibration, haptic } = useHapticFeedbackContext();
 *
 * // Use basic vibration
 * vibration.vibrateLight();
 * vibration.vibrateMedium();
 * vibration.vibrateHeavy();
 *
 * // Use semantic haptic feedback
 * haptic.navigationFeedback();
 * haptic.buttonPressFeedback();
 * haptic.successFeedback();
 */
export const useHapticFeedbackContext = (): HapticFeedbackContextType => {
  const context = useContext(HapticFeedbackContext);
  if (context === undefined) {
    throw new Error(
      "useHapticFeedbackContext must be used within a HapticFeedbackProvider"
    );
  }
  return context;
};
```

---

### Step 4: Integrate in App

Add `HapticFeedbackProvider` to your app:

```typescript
import { HapticFeedbackProvider } from "./src/contexts/hapticFeedback";

export default function App() {
  return (
    <HapticFeedbackProvider>
      <NavigationProvider>
        <YourApp />
      </NavigationProvider>
    </HapticFeedbackProvider>
  );
}
```

---

## Usage Examples

### Example 1: Button Press Feedback

```typescript
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";
import { Button } from "../components/atoms/Button";

function MyScreen() {
  const { haptic } = useHapticFeedbackContext();

  const handlePress = () => {
    haptic.buttonPressFeedback(); // Tactile feedback
    // Handle button action
    console.log("Button pressed!");
  };

  return (
    <Button title="Press Me" onPress={handlePress} />
  );
}
```

---

### Example 2: Form Submission Feedback

```typescript
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";
import { useState } from "react";

function FormScreen() {
  const { haptic } = useHapticFeedbackContext();
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await submitForm(email);
      haptic.successFeedback(); // Success vibration
      showToast("Form submitted successfully!");
    } catch (error) {
      haptic.errorFeedback(); // Error vibration
      showToast("Submission failed");
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
```

---

### Example 3: Navigation Feedback

```typescript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { haptic } = useHapticFeedbackContext();

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        listeners={{
          tabPress: () => {
            haptic.navigationFeedback(); // Subtle feedback on tab press
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={{
          tabPress: () => {
            haptic.navigationFeedback();
          },
        }}
      />
    </Tab.Navigator>
  );
}
```

---

### Example 4: Delete Confirmation

```typescript
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";

function ItemListScreen() {
  const { haptic } = useHapticFeedbackContext();

  const handleDelete = (itemId: string) => {
    haptic.destructiveFeedback(); // Heavy vibration for destructive action
    
    Alert.alert(
      "Delete Item",
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => haptic.selectionFeedback(),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteItem(itemId);
            haptic.successFeedback();
          },
        },
      ]
    );
  };

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Swipeable
          renderRightActions={() => (
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text>Delete</Text>
            </TouchableOpacity>
          )}
        >
          <Text>{item.name}</Text>
        </Swipeable>
      )}
    />
  );
}
```

---

### Example 5: Pull to Refresh

```typescript
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";
import { RefreshControl } from "react-native";

function DataListScreen() {
  const { haptic } = useHapticFeedbackContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    haptic.refreshFeedback(); // Three quick pulses
    
    await fetchData();
    
    setRefreshing(false);
    haptic.successFeedback(); // Confirm refresh complete
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Content */}
    </ScrollView>
  );
}
```

---

### Example 6: Picker Selection

```typescript
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";
import { Picker } from "@react-native-picker/picker";

function SettingsScreen() {
  const { haptic } = useHapticFeedbackContext();
  const [selectedValue, setSelectedValue] = useState("option1");

  const handleValueChange = (value: string) => {
    haptic.selectionFeedback(); // Light feedback on selection
    setSelectedValue(value);
  };

  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={handleValueChange}
    >
      <Picker.Item label="Option 1" value="option1" />
      <Picker.Item label="Option 2" value="option2" />
      <Picker.Item label="Option 3" value="option3" />
    </Picker>
  );
}
```

---

### Example 7: Custom Vibration Pattern

```typescript
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";

function NotificationScreen() {
  const { vibration } = useHapticFeedbackContext();

  const handleCustomAlert = () => {
    // Custom SOS pattern: ... --- ...
    vibration.vibrateCustom({
      pattern: [
        0, 100, 50, 100, 50, 100, // Three short (dots)
        200, 
        200, 50, 200, 50, 200, // Three long (dashes)
        200,
        100, 50, 100, 50, 100, // Three short (dots)
      ],
    });
  };

  return (
    <Button title="Custom Alert" onPress={handleCustomAlert} />
  );
}
```

---

### Example 8: Warning Before Action

```typescript
import { useHapticFeedbackContext } from "../contexts/hapticFeedback";

function AccountScreen() {
  const { haptic } = useHapticFeedbackContext();

  const handleDeleteAccount = () => {
    haptic.warningFeedback(); // Warning vibration
    
    Alert.alert(
      "Warning",
      "This action cannot be undone",
      [
        {
          text: "Cancel",
          onPress: () => haptic.selectionFeedback(),
        },
        {
          text: "Proceed",
          style: "destructive",
          onPress: () => {
            haptic.destructiveFeedback();
            deleteAccount();
          },
        },
      ]
    );
  };

  return (
    <Button title="Delete Account" onPress={handleDeleteAccount} />
  );
}
```

---

## Best Practices

### 1. Use Semantic Methods Over Raw Vibration

**✅ Good: Semantic method**
```typescript
haptic.successFeedback(); // Clear intent
```

**❌ Bad: Raw vibration**
```typescript
vibration.vibrateCustom({ pattern: [0, 50, 30, 50] }); // Unclear intent
```

---

### 2. Match Feedback to Action Importance

| Action Importance | Feedback Type |
|-------------------|---------------|
| **Subtle** (tab press, selection) | Light (`navigationFeedback`, `selectionFeedback`) |
| **Medium** (button press, notification) | Medium (`buttonPressFeedback`, `notificationFeedback`) |
| **Strong** (delete, error) | Heavy (`destructiveFeedback`, `errorFeedback`) |

---

### 3. Don't Overuse Haptic Feedback

**✅ Good: Strategic use**
```typescript
// Only on important actions
<Button onPress={() => {
  haptic.buttonPressFeedback();
  submitForm();
}} />
```

**❌ Bad: Every interaction**
```typescript
// Too frequent - annoying
<View onTouchStart={() => haptic.buttonPressFeedback()}>
  <Text>Don't add haptic to every touch!</Text>
</View>
```

**Guidelines:**
- Use for confirmations of user actions
- Use for state changes (success, error, warning)
- Avoid for passive interactions (scrolling, reading)

---

### 4. Platform Considerations

**iOS:**
- Haptics are subtle and refined
- Users expect minimal vibration
- Overuse is more noticeable

**Android:**
- Vibration is more pronounced
- Users may have different sensitivity settings
- Patterns can be longer

```typescript
// Good: Platform-aware implementation
const handleAction = () => {
  if (Platform.OS === 'ios') {
    haptic.buttonPressFeedback(); // Subtle
  } else {
    haptic.buttonPressFeedback(); // Still appropriate for Android
  }
};
```

---

### 5. Accessibility Consideration

Some users may have vibration disabled or find it disorienting:

```typescript
// Respect user preferences
import { AccessibilityInfo } from 'react-native';

const handlePress = async () => {
  const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
  
  if (!isReduceMotionEnabled) {
    haptic.buttonPressFeedback();
  }
  
  // Perform action
};
```

---

### 6. Battery Awareness

Excessive vibration drains battery:

```typescript
// ✅ Good: Once per action
const handleSubmit = () => {
  haptic.successFeedback(); // Single feedback
  submitForm();
};

// ❌ Bad: Repeated vibrations
const handleAnimation = () => {
  // Don't vibrate on every frame!
  animate(() => {
    haptic.selectionFeedback(); // Battery drain!
  });
};
```

---

### 7. Testing Haptic Feedback

Always test on real devices:

```typescript
// Development helper
const testAllFeedback = () => {
  const feedbackTypes = [
    'navigationFeedback',
    'buttonPressFeedback',
    'successFeedback',
    'errorFeedback',
    'warningFeedback',
    'selectionFeedback',
    'destructiveFeedback',
    'notificationFeedback',
    'refreshFeedback',
  ];

  feedbackTypes.forEach((type, index) => {
    setTimeout(() => {
      haptic[type]();
      console.log(`Testing: ${type}`);
    }, index * 1000);
  });
};
```

**Testing Checklist:**
- [ ] Test on iOS device (haptics feel different than simulator)
- [ ] Test on Android device (vibration intensity)
- [ ] Test with device on silent mode
- [ ] Test with vibration disabled in settings
- [ ] Test battery impact during long sessions

---

## Integration with Other Patterns

### Navigation Pattern

Add haptic feedback to tab navigation:

```typescript
// See navigation-pattern.md
<Tab.Screen
  name="Home"
  component={HomeScreen}
  listeners={{
    tabPress: () => {
      haptic.navigationFeedback();
    },
  }}
/>
```

### Toast Notifications Pattern

Combine haptic with visual feedback:

```typescript
// See toast-pattern.md (if documented)
const showSuccessToast = (message: string) => {
  haptic.successFeedback(); // Haptic
  toast.success(message);   // Visual
};
```

### E2E Testing Pattern

Haptic feedback doesn't interfere with E2E tests:

```typescript
// Maestro tests ignore haptic feedback
// No special handling needed
```

---

## Troubleshooting

### Haptic Feedback Not Working on iOS Simulator

**Problem:** Haptics don't work in iOS simulator

**Solution:** Test on a real iOS device. Simulators don't support haptic feedback.

---

### Vibration Not Working on Android

**Problem:** Vibration doesn't trigger on Android

**Solution:** Ensure vibration permission is added to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

---

### Haptics Feel Too Strong/Weak

**Problem:** Feedback intensity doesn't match expectation

**Solution:** Adjust intensity levels or use custom patterns:

```typescript
// Customize intensity
const vibrateVeryLight = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else {
    Vibration.vibrate(10); // Very short
  }
};
```

---

### Battery Drain from Excessive Vibration

**Problem:** App drains battery quickly

**Solution:** Reduce frequency of haptic feedback or remove from high-frequency events.

---

## Summary

Haptic feedback enhances user experience through tactile confirmation of actions:

✅ **Platform-Optimized** - Native haptics on iOS, vibration patterns on Android
✅ **Semantic Methods** - 9 pre-defined feedback types for common interactions
✅ **Type-Safe** - Full TypeScript support with clear interfaces
✅ **Easy Integration** - Simple hook-based API via context
✅ **Customizable** - Support for custom vibration patterns
✅ **Lightweight** - Minimal dependencies (expo-haptics only)
✅ **Performant** - useCallback optimizations, no re-renders

**Usage Hierarchy:**
```
HapticFeedbackProvider (App-wide)
  ↓
useHapticFeedbackContext() (In components)
  ↓
haptic.successFeedback() (Semantic methods - PREFERRED)
vibration.vibrateLight() (Basic methods - when needed)
```

**When to Use Haptic Feedback:**
- ✅ Button presses
- ✅ Form submissions (success/error)
- ✅ Navigation (tab switches)
- ✅ Selection changes (pickers, lists)
- ✅ Destructive actions (delete confirmations)
- ✅ Notifications and alerts
- ❌ Passive scrolling
- ❌ Every touch event
- ❌ Background animations

This haptic feedback pattern provides a polished, native-feeling experience that enhances usability without being intrusive.
