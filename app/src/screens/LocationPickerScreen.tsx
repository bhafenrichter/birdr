import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput as RNTextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Search as SearchIcon, Navigation } from "lucide-react-native";
import * as Location from "expo-location";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text } from "../components/atoms";

export const LocationPickerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        navigation.navigate("ExploreHome" as any, {
          lat: results[0].latitude,
          lon: results[0].longitude,
          name: searchQuery,
        });
      }
    } catch {}
  };

  const handleCurrentLocation = async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const name = place
        ? [place.city, place.region].filter(Boolean).join(", ") || "Current location"
        : "Current location";
      navigation.navigate("ExploreHome" as any, {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        name,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container} testID="location-picker-screen">
      <View style={styles.header}>
        <Text variant="semiBold" size="lg" color={Colors.ink} testID="picker-title">
          Change location
        </Text>
      </View>

      <View style={styles.searchBar}>
        <SearchIcon size={18} color={Colors.inkFaint} />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Search city or region..."
          placeholderTextColor={Colors.inkFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
          testID="picker-search-input"
        />
      </View>

      <Pressable
        style={styles.row}
        onPress={handleCurrentLocation}
        testID="picker-current-location"
      >
        <Navigation size={18} color={Colors.sage} strokeWidth={2} />
        <Text variant="medium" size="base" color={Colors.sage} testID="picker-current-label">
          Use current location
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
    color: Colors.ink,
    paddingVertical: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
});

export default LocationPickerScreen;
