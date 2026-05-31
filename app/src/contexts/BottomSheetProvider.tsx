import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { View, StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius } from "../theme";

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
  const sheetRef = useRef<TrueSheet>(null);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const open = useCallback((node: React.ReactNode) => {
    setContent(node);
    setTimeout(() => {
      sheetRef.current?.present();
    }, 0);
  }, []);

  const close = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleDismiss = useCallback(() => {
    setContent(null);
  }, []);

  const ctx = useMemo(() => ({ open, close }), [open, close]);

  return (
    <BottomSheetContext.Provider value={ctx}>
      {children}
      <TrueSheet
        ref={sheetRef}
        detents={["auto"]}
        cornerRadius={BorderRadius.xl}
        grabber
        backgroundColor={Colors.white}
        onDidDismiss={handleDismiss}
      >
        <View style={styles.sheetContent}>
          {content}
        </View>
      </TrueSheet>
    </BottomSheetContext.Provider>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    backgroundColor: Colors.white,
    paddingBottom: Spacing["4xl"],
  },
});
