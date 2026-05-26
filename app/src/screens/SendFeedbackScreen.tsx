import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  Keyboard,
} from "react-native";
import { MessageSquare } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Fonts,
  FontSizes,
} from "../theme";
import { Text, PrimaryButton, GhostButton } from "../components/atoms";
import { useAuth } from "../contexts/AuthProvider";
import { usePostHog } from "../contexts/PostHogProvider";
import { supabase } from "../services/supabase";
import { logger } from "../services/logger";

export const SendFeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const posthog = usePostHog();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = title.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !profile) return;

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: profile.id,
        title: title.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      posthog.capture("feedback_submitted");
      setSubmitted(true);
    } catch (err) {
      logger.error("Failed to submit feedback", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.content} testID="feedback-success-screen">
        <View style={styles.iconCircle}>
          <MessageSquare size={28} color={Colors.sage} strokeWidth={2} />
        </View>
        <Text
          variant="bold"
          size="xl"
          color={Colors.ink}
          align="center"
          testID="feedback-success-title"
          style={{ marginTop: Spacing.lg }}
        >
          Thanks for your feedback!
        </Text>
        <Text
          variant="regular"
          size="base"
          color={Colors.inkSoft}
          align="center"
          testID="feedback-success-body"
          style={{ marginTop: Spacing.sm }}
        >
          We read every message and appreciate you helping us improve birdr.
        </Text>
        <View style={styles.buttons}>
          <PrimaryButton
            title="Done"
            size="lg"
            fullWidth
            onPress={() => navigation.goBack()}
            testID="feedback-done"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.content} testID="feedback-screen">
      <View style={styles.iconCircle}>
        <MessageSquare size={28} color={Colors.sage} strokeWidth={2} />
      </View>
      <Text
        variant="bold"
        size="xl"
        color={Colors.ink}
        align="center"
        testID="feedback-title"
        style={{ marginTop: Spacing.lg }}
      >
        Send feedback
      </Text>
      <Text
        variant="regular"
        size="base"
        color={Colors.inkSoft}
        align="center"
        testID="feedback-subtitle"
        style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}
      >
        Let us know what's on your mind.
      </Text>

      {/* Title input */}
      <View style={styles.inputGroup}>
        <Text
          variant="medium"
          size="sm"
          color={Colors.inkSoft}
          testID="feedback-title-label"
        >
          Title
        </Text>
        <RNTextInput
          style={styles.textInput}
          placeholder="What's this about?"
          placeholderTextColor={Colors.inkFaint}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          returnKeyType="next"
          testID="feedback-title-input"
        />
      </View>

      {/* Message input */}
      <View style={styles.inputGroup}>
        <Text
          variant="medium"
          size="sm"
          color={Colors.inkSoft}
          testID="feedback-message-label"
        >
          Message
        </Text>
        <RNTextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Tell us more..."
          placeholderTextColor={Colors.inkFaint}
          value={message}
          onChangeText={setMessage}
          maxLength={2000}
          multiline
          textAlignVertical="top"
          testID="feedback-message-input"
        />
      </View>

      <View style={styles.buttons}>
        <PrimaryButton
          title="Submit"
          size="lg"
          fullWidth
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!canSubmit}
          testID="feedback-submit"
        />
        <GhostButton
          title="Cancel"
          size="lg"
          fullWidth
          onPress={() => navigation.goBack()}
          testID="feedback-cancel"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  textInput: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
    color: Colors.ink,
    ...Shadows.sm,
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  buttons: {
    width: "100%",
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
});

export default SendFeedbackScreen;
