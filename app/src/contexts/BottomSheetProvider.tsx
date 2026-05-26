import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Colors, Spacing, BorderRadius, Shadows } from "../theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const OFF_SCREEN = SCREEN_HEIGHT;

interface BottomSheetContextType {
  open: (content: React.ReactNode) => void;
  close: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType>({
  open: () => {},
  close: () => {},
});

export const useGlobalSheet = () => useContext(BottomSheetContext);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const [visible, setVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(OFF_SCREEN);

  const cleanup = useCallback(() => {
    setVisible(false);
    setContent(null);
  }, []);

  const open = useCallback((node: React.ReactNode) => {
    setContent(node);
    setVisible(true);
    backdropOpacity.value = withTiming(1, { duration: 250 });
    translateY.value = withTiming(0, { duration: 300 });
  }, []);

  const close = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(OFF_SCREEN, { duration: 250 }, (finished) => {
      if (finished) runOnJS(cleanup)();
    });
  }, [cleanup]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100) {
        runOnJS(close)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const ctx = useMemo(() => ({ open, close }), [open, close]);

  return (
    <BottomSheetContext.Provider value={ctx}>
      {children}
      {visible && (
        <>
          <TouchableWithoutFeedback onPress={close}>
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          </TouchableWithoutFeedback>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.sheet, sheetStyle]}>
              <View style={styles.handleBar} />
              {content}
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </BottomSheetContext.Provider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.lg,
    overflow: "hidden",
  },
  handleBar: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.paper,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
