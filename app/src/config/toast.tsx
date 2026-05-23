import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../components/atoms/Text";
import { Colors, Spacing, BorderRadius, Shadows, Fonts } from "../theme";
import type { BaseToastProps } from "react-native-toast-message";

const BirdrToast: React.FC<BaseToastProps> = ({ text1, text2 }) => (
  <View style={styles.container}>
    {text1 ? (
      <Text variant="semiBold" size="sm" color={Colors.white} testID="toast-title">
        {text1}
      </Text>
    ) : null}
    {text2 ? (
      <Text variant="regular" size="xs" color="rgba(255,255,255,0.8)" testID="toast-message">
        {text2}
      </Text>
    ) : null}
  </View>
);

const BirdrSuccessToast: React.FC<BaseToastProps> = ({ text1, text2 }) => (
  <View style={[styles.container, { backgroundColor: Colors.sage }]}>
    {text1 ? (
      <Text variant="semiBold" size="sm" color={Colors.white} testID="toast-success-title">
        {text1}
      </Text>
    ) : null}
    {text2 ? (
      <Text variant="regular" size="xs" color="rgba(255,255,255,0.8)" testID="toast-success-message">
        {text2}
      </Text>
    ) : null}
  </View>
);

const BirdrErrorToast: React.FC<BaseToastProps> = ({ text1, text2 }) => (
  <View style={[styles.container, { backgroundColor: Colors.coral }]}>
    {text1 ? (
      <Text variant="semiBold" size="sm" color={Colors.white} testID="toast-error-title">
        {text1}
      </Text>
    ) : null}
    {text2 ? (
      <Text variant="regular" size="xs" color="rgba(255,255,255,0.8)" testID="toast-error-message">
        {text2}
      </Text>
    ) : null}
  </View>
);

export const toastConfig = {
  info: (props: BaseToastProps) => <BirdrToast {...props} />,
  success: (props: BaseToastProps) => <BirdrSuccessToast {...props} />,
  error: (props: BaseToastProps) => <BirdrErrorToast {...props} />,
  // Custom type for repeat sightings: "Spotted again!" toast
  sighting: (props: BaseToastProps) => (
    <View style={[styles.container, { backgroundColor: Colors.saffron }]}>
      {props.text1 ? (
        <Text variant="semiBold" size="sm" color={Colors.white} testID="toast-sighting-title">
          {props.text1}
        </Text>
      ) : null}
      {props.text2 ? (
        <Text variant="regular" size="xs" color="rgba(255,255,255,0.8)" testID="toast-sighting-message">
          {props.text2}
        </Text>
      ) : null}
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ink,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.xl,
    ...Shadows.md,
  },
});
