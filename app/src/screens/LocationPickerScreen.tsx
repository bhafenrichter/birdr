import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, TextInput as RNTextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Search as SearchIcon, Navigation, MapPin, X } from "lucide-react-native";
import * as Location from "expo-location";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text } from "../components/atoms";

const US_STATES = [
  { code: "US-AL", name: "Alabama", lat: 32.806671, lon: -86.791130 },
  { code: "US-AK", name: "Alaska", lat: 61.370716, lon: -152.404419 },
  { code: "US-AZ", name: "Arizona", lat: 33.729759, lon: -111.431221 },
  { code: "US-AR", name: "Arkansas", lat: 34.969704, lon: -92.373123 },
  { code: "US-CA", name: "California", lat: 36.116203, lon: -119.681564 },
  { code: "US-CO", name: "Colorado", lat: 39.059811, lon: -105.311104 },
  { code: "US-CT", name: "Connecticut", lat: 41.597782, lon: -72.755371 },
  { code: "US-DE", name: "Delaware", lat: 39.318523, lon: -75.507141 },
  { code: "US-FL", name: "Florida", lat: 27.766279, lon: -81.686783 },
  { code: "US-GA", name: "Georgia", lat: 33.040619, lon: -83.643074 },
  { code: "US-HI", name: "Hawaii", lat: 21.094318, lon: -157.498337 },
  { code: "US-ID", name: "Idaho", lat: 44.240459, lon: -114.478828 },
  { code: "US-IL", name: "Illinois", lat: 40.349457, lon: -88.986137 },
  { code: "US-IN", name: "Indiana", lat: 39.849426, lon: -86.258278 },
  { code: "US-IA", name: "Iowa", lat: 42.011539, lon: -93.210526 },
  { code: "US-KS", name: "Kansas", lat: 38.526600, lon: -96.726486 },
  { code: "US-KY", name: "Kentucky", lat: 37.668140, lon: -84.670067 },
  { code: "US-LA", name: "Louisiana", lat: 31.169546, lon: -91.867805 },
  { code: "US-ME", name: "Maine", lat: 44.693947, lon: -69.381927 },
  { code: "US-MD", name: "Maryland", lat: 39.063946, lon: -76.802101 },
  { code: "US-MA", name: "Massachusetts", lat: 42.230171, lon: -71.530106 },
  { code: "US-MI", name: "Michigan", lat: 43.326618, lon: -84.536095 },
  { code: "US-MN", name: "Minnesota", lat: 45.694454, lon: -93.900192 },
  { code: "US-MS", name: "Mississippi", lat: 32.741646, lon: -89.678696 },
  { code: "US-MO", name: "Missouri", lat: 38.456085, lon: -92.288368 },
  { code: "US-MT", name: "Montana", lat: 46.921925, lon: -110.454353 },
  { code: "US-NE", name: "Nebraska", lat: 41.125370, lon: -98.268082 },
  { code: "US-NV", name: "Nevada", lat: 38.313515, lon: -117.055374 },
  { code: "US-NH", name: "New Hampshire", lat: 43.452492, lon: -71.563896 },
  { code: "US-NJ", name: "New Jersey", lat: 40.298904, lon: -74.521011 },
  { code: "US-NM", name: "New Mexico", lat: 34.840515, lon: -106.248482 },
  { code: "US-NY", name: "New York", lat: 42.165726, lon: -74.948051 },
  { code: "US-NC", name: "North Carolina", lat: 35.630066, lon: -79.806419 },
  { code: "US-ND", name: "North Dakota", lat: 47.528912, lon: -99.784012 },
  { code: "US-OH", name: "Ohio", lat: 40.388783, lon: -82.764915 },
  { code: "US-OK", name: "Oklahoma", lat: 35.565342, lon: -96.928917 },
  { code: "US-OR", name: "Oregon", lat: 44.572021, lon: -122.070938 },
  { code: "US-PA", name: "Pennsylvania", lat: 40.590752, lon: -77.209755 },
  { code: "US-RI", name: "Rhode Island", lat: 41.680893, lon: -71.511780 },
  { code: "US-SC", name: "South Carolina", lat: 33.856892, lon: -80.945007 },
  { code: "US-SD", name: "South Dakota", lat: 44.299782, lon: -99.438828 },
  { code: "US-TN", name: "Tennessee", lat: 35.747845, lon: -86.692345 },
  { code: "US-TX", name: "Texas", lat: 31.054487, lon: -97.563461 },
  { code: "US-UT", name: "Utah", lat: 40.150032, lon: -111.862434 },
  { code: "US-VT", name: "Vermont", lat: 44.045876, lon: -72.710686 },
  { code: "US-VA", name: "Virginia", lat: 37.769337, lon: -78.169968 },
  { code: "US-WA", name: "Washington", lat: 47.400902, lon: -121.490494 },
  { code: "US-WV", name: "West Virginia", lat: 38.491226, lon: -80.954453 },
  { code: "US-WI", name: "Wisconsin", lat: 44.268543, lon: -89.616508 },
  { code: "US-WY", name: "Wyoming", lat: 42.755966, lon: -107.302490 },
];

export const LocationPickerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return US_STATES;
    const q = searchQuery.toLowerCase();
    return US_STATES.filter((s) => s.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const selectLocation = (lat: number, lon: number, name: string) => {
    navigation.goBack();
    navigation.navigate({
      name: "ExploreHome",
      params: { lat, lon, name },
      merge: true,
    });
  };

  const handleSelectState = (state: (typeof US_STATES)[number]) => {
    selectLocation(state.lat, state.lon, state.name);
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
      selectLocation(pos.coords.latitude, pos.coords.longitude, name);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="location-picker-screen">
      {/* Top bar with close button */}
      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text variant="semiBold" size="lg" color={Colors.ink} testID="picker-title">
          Change location
        </Text>
        <Pressable onPress={() => navigation.goBack()} testID="picker-close">
          <X size={24} color={Colors.ink} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <SearchIcon size={18} color={Colors.inkFaint} />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Search states..."
          placeholderTextColor={Colors.inkFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
          testID="picker-search-input"
        />
      </View>

      {/* Current location */}
      <Pressable
        style={styles.currentLocationRow}
        onPress={handleCurrentLocation}
        testID="picker-current-location"
      >
        <Navigation size={18} color={Colors.sage} strokeWidth={2} />
        <Text variant="medium" size="base" color={Colors.sage} testID="picker-current-label">
          Use current location
        </Text>
      </Pressable>

      <View style={styles.divider} />

      {/* Scrollable state list */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        testID="picker-state-list"
      >
        {filteredStates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="regular" size="sm" color={Colors.inkFaint} align="center">
              No states match "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredStates.map((item) => (
            <Pressable
              key={item.code}
              style={styles.stateRow}
              onPress={() => handleSelectState(item)}
              testID={`picker-state-${item.code}`}
            >
              <MapPin size={16} color={Colors.inkSoft} strokeWidth={1.5} />
              <Text variant="regular" size="base" color={Colors.ink}>
                {item.name}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
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
  currentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.paper,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
  },
});

export default LocationPickerScreen;
