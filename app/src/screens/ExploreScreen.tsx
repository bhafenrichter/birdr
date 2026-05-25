import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Location from "expo-location";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius, Shadows } from "../theme";
import {
  Text,
  SegmentedControl,
  Pill,
  LocationCard,
  CardSkeletonGrid,
} from "../components/atoms";
import { BirdCardThumb } from "../components/molecules/BirdCard";
import { useExploreSpecies, useProfile, useCards } from "../hooks/useApi";
import type { ExploreStackParamList } from "../navigation/stacks/ExploreStack";

type Nav = NativeStackNavigationProp<ExploreStackParamList>;

export const ExploreScreen: React.FC = () => {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const navigation = useNavigation<Nav>();
  const route =
    useRoute<
      NativeStackScreenProps<ExploreStackParamList, "ExploreHome">["route"]
    >();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="explore-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text
          variant="bold"
          size="xl"
          color={Colors.ink}
          testID="explore-title"
        >
          Explore
        </Text>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          segments={["Near me", "My map"]}
          selectedIndex={segmentIndex}
          onSelect={setSegmentIndex}
          testID="explore-segment"
        />
      </View>

      {segmentIndex === 0 ? (
        <NearMeView navigation={navigation} routeParams={route.params} />
      ) : (
        <MyMapView />
      )}
    </SafeAreaView>
  );
};

// ── Near Me ────────────────────────────────────────────────────────────────

const NearMeView: React.FC<{
  navigation: Nav;
  routeParams?: { lat?: number; lon?: number; name?: string };
}> = ({ navigation, routeParams }) => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [locationName, setLocationName] = useState<string>(
    "Finding location...",
  );
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (routeParams?.lat && routeParams?.lon) {
      setLocation({ lat: routeParams.lat, lon: routeParams.lon });
      setLocationName(routeParams.name ?? "Selected location");
      return;
    }

    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(true);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({});
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        const [place] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (place) {
          setLocationName(
            [place.city, place.region].filter(Boolean).join(", ") ||
              "Current location",
          );
        }
      } catch {
        setLocationError(true);
      }
    })();
  }, [routeParams?.lat, routeParams?.lon]);

  const params = location
    ? { lat: location.lat, lon: location.lon, mode: "near_me" as const }
    : null;
  const { data: exploreData, isLoading } = useExploreSpecies(params);
  const list = exploreData?.species ?? [];

  if (locationError && !location) {
    return (
      <View style={{ flex: 1 }} testID="explore-no-location">
        <View style={styles.locationWrapper}>
          <LocationCard
            locationName="Select a state"
            subtitle="Tap to browse birds by state"
            onPress={() => navigation.navigate("LocationPicker")}
            testID="explore-location"
          />
        </View>
        <View style={styles.emptyState}>
          <MapPin size={40} color={Colors.inkFaint} strokeWidth={1} />
          <Text
            variant="semiBold"
            size="lg"
            color={Colors.ink}
            align="center"
            testID="explore-no-location-title"
            style={{ marginTop: Spacing.lg }}
          >
            Pick a state to explore
          </Text>
          <Text
            variant="regular"
            size="sm"
            color={Colors.inkSoft}
            align="center"
            testID="explore-no-location-body"
            style={{ marginTop: Spacing.sm }}
          >
            Choose a state above or enable location access
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} testID="explore-near-me">
      {/* Location card — always visible */}
      <View style={styles.locationWrapper}>
        <LocationCard
          locationName={locationName}
          subtitle={
            exploreData?.header
              ? `${exploreData.header.season} · ${exploreData.header.total_species} species expected`
              : undefined
          }
          onPress={() => navigation.navigate("LocationPicker")}
          testID="explore-location"
        />
      </View>

      {/* Loading skeleton */}
      {isLoading || !location ? (
        <CardSkeletonGrid count={6} testID="explore-loading" />
      ) : list.length === 0 ? (
        <View style={styles.emptyState} testID="explore-empty">
          <Text
            variant="semiBold"
            size="lg"
            color={Colors.ink}
            align="center"
            testID="explore-empty-title"
          >
            No birds found
          </Text>
          <Text
            variant="regular"
            size="sm"
            color={Colors.inkSoft}
            align="center"
            testID="explore-empty-body"
            style={{ marginTop: Spacing.sm }}
          >
            We don't have species data for this area yet
          </Text>
        </View>
      ) : (
        <FlashList
          data={list}
          keyExtractor={(item) => item.species_id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.gridCell}>
              <Pressable
                onPress={() =>
                  navigation.navigate("CardDetail" as any, {
                    speciesId: item.species_id,
                  })
                }
                testID={`explore-card-${item.species_id}`}
              >
                <BirdCardThumb
                  data={{
                    speciesName: item.common_name,
                    familyName: item.scientific_name,
                    speciesType: item.species_type,
                    habitat: item.habitat,
                    conservationTier: item.conservation_status as any,
                    photoUri: null,
                    sightingCount: item.sighting_count,
                    locked: !item.spotted,
                  }}
                  testID={`explore-thumb-${item.species_id}`}
                />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
};

// ── My Map ─────────────────────────────────────────────────────────────────

const MyMapView: React.FC = () => {
  const { data: cards } = useCards();
  const allCards = cards ?? [];
  const totalCaptures = allCards.reduce((sum, c) => sum + c.sighting_count, 0);
  const totalSpecies = allCards.length;

  return (
    <View style={styles.myMapContainer} testID="explore-my-map">
      {/* Stats trio */}
      <View style={styles.statsTrio}>
        <StatBlock
          value={String(totalCaptures)}
          label="Captures"
          testID="explore-stat-captures"
        />
        <StatBlock
          value={String(totalSpecies)}
          label="Species"
          testID="explore-stat-species"
        />
        <StatBlock value="—" label="States" testID="explore-stat-states" />
      </View>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder} testID="explore-map-placeholder">
        <MapPin size={40} color={Colors.inkFaint} strokeWidth={1} />
        <Text
          variant="regular"
          size="sm"
          color={Colors.inkFaint}
          align="center"
          testID="explore-map-placeholder-text"
          style={{ marginTop: Spacing.md }}
        >
          Interactive map coming soon
        </Text>
        <Text
          variant="regular"
          size="xs"
          color={Colors.inkFaint}
          align="center"
          testID="explore-map-placeholder-sub"
          style={{ marginTop: Spacing.xs }}
        >
          {`${totalCaptures} sightings`}
        </Text>
      </View>
    </View>
  );
};

const StatBlock: React.FC<{
  value: string;
  label: string;
  testID: string;
}> = ({ value, label, testID }) => (
  <View style={styles.statBlock} testID={testID}>
    <Text
      variant="bold"
      size="xl"
      color={Colors.ink}
      testID={`${testID}-value`}
    >
      {value}
    </Text>
    <Text
      variant="regular"
      size="xs"
      color={Colors.inkSoft}
      testID={`${testID}-label`}
    >
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  segmentWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  locationWrapper: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  gridContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing["4xl"],
  },
  gridCell: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  myMapContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  statsTrio: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
});

export default ExploreScreen;
