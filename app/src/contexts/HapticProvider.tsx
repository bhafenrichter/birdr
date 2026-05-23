import React, { createContext, useContext, useCallback } from "react";
import * as Haptics from "expo-haptics";

type HapticContextType = {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  selection: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
};

const HapticContext = createContext<HapticContextType>({
  light: () => {},
  medium: () => {},
  heavy: () => {},
  selection: () => {},
  success: () => {},
  warning: () => {},
  error: () => {},
});

export const HapticProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const light = useCallback(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    []
  );
  const medium = useCallback(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    []
  );
  const heavy = useCallback(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    []
  );
  const selection = useCallback(() => Haptics.selectionAsync(), []);
  const success = useCallback(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    []
  );
  const warning = useCallback(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    []
  );
  const error = useCallback(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    []
  );

  return (
    <HapticContext.Provider
      value={{ light, medium, heavy, selection, success, warning, error }}
    >
      {children}
    </HapticContext.Provider>
  );
};

export const useHaptic = () => useContext(HapticContext);
