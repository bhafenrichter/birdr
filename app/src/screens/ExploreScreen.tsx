import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import * as Location from "expo-location";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Region } from "react-native-maps";
import { MapPin, Binoculars } from "lucide-react-native";
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
import { useExploreSpecies, useProfile, useCards, useMapSightings } from "../hooks/useApi";
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
                    rarity: item.rarity as any,
                    about: item.about_text,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const US_CENTER: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

const MyMapView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { data: cards, isLoading: cardsLoading } = useCards();
  const { data: mapSightings, isLoading: sightingsLoading } = useMapSightings();
  const mapRef = useRef<MapView>(null);

  const allCards = cards ?? [];
  const sightings = mapSightings ?? [];
  const totalCaptures = allCards.reduce((sum, c) => sum + c.sighting_count, 0);
  const totalSpecies = allCards.length;

  // Unique states from sighting locations
  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    for (const s of sightings) {
      if (s.named_location) {
        const parts = s.named_location.split(", ");
        if (parts.length >= 2) states.add(parts[parts.length - 1]);
      }
    }
    return states.size;
  }, [sightings]);

  // Fit map to sighting markers on first load
  useEffect(() => {
    if (sightings.length > 0 && mapRef.current) {
      const coords = sightings.map((s) => ({
        latitude: s.lat!,
        longitude: s.lon!,
      }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [sightings.length > 0]);

  const handleMarkerPress = useCallback(
    (speciesId: string) => {
      navigation.navigate("CardDetail", { speciesId });
    },
    [navigation],
  );

  return (
    <View style={styles.myMapContainer} testID="explore-my-map">
      {/* Stats trio */}
      <View style={styles.statsTrio}>
        <StatBlock
          value={String(totalCaptures)}
          label="Captures"
          isLoading={cardsLoading}
          testID="explore-stat-captures"
        />
        <StatBlock
          value={String(totalSpecies)}
          label="Species"
          isLoading={cardsLoading}
          testID="explore-stat-species"
        />
        <StatBlock
          value={uniqueStates > 0 ? String(uniqueStates) : "—"}
          label="States"
          isLoading={sightingsLoading}
          testID="explore-stat-states"
        />
      </View>

      {/* Map */}
      <View style={styles.mapContainer} testID="explore-map">
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={US_CENTER}
          showsUserLocation
          showsMyLocationButton={false}
          testID="explore-map-view"
        >
          {sightings.map((sighting) => (
            <Marker
              key={sighting.id}
              coordinate={{
                latitude: sighting.lat!,
                longitude: sighting.lon!,
              }}
              tracksViewChanges={false}
              onPress={() =>
                handleMarkerPress((sighting as any).species?.id ?? sighting.species_id)
              }
            >
              <View style={styles.mapMarker}>
                <Binoculars size={16} color={Colors.white} strokeWidth={2} />
              </View>
              <View style={styles.mapMarkerTail} />
            </Marker>
          ))}
        </MapView>

        {sightings.length === 0 && (
          <View style={styles.mapEmptyOverlay} pointerEvents="none">
            <MapPin size={32} color={Colors.inkFaint} strokeWidth={1.5} />
            <Text
              variant="regular"
              size="sm"
              color={Colors.inkFaint}
              align="center"
              style={{ marginTop: Spacing.sm }}
            >
              Your sightings will appear here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const StatBlock: React.FC<{
  value: string;
  label: string;
  isLoading?: boolean;
  testID: string;
}> = ({ value, label, isLoading, testID }) => (
  <View style={styles.statBlock} testID={testID}>
    {isLoading ? (
      <View style={styles.statBone} />
    ) : (
      <Text
        variant="bold"
        size="xl"
        color={Colors.ink}
        testID={`${testID}-value`}
      >
        {value}
      </Text>
    )}
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

const SEASON_LABELS: Record<string, string> = {
  year_round: "Year-round resident",
  summer: "Summer breeder",
  winter: "Winter visitor",
  migratory: "Migratory",
  rare: "Rare visitor",
};

function formatSeason(season?: string): string {
  if (!season) return "";
  return SEASON_LABELS[season] ?? season;
}

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
    marginBottom: Spacing.lg,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statBone: {
    width: 32,
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.paper,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  mapContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  map: {
    flex: 1,
  },
  mapEmptyOverlay: {
    ...StyleSheet.absoluteFill,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245, 241, 232, 0.7)",
  },
  mapMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.sage,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  mapMarkerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.sage,
    alignSelf: "center",
    marginTop: -1,
  },
});

export default ExploreScreen;
