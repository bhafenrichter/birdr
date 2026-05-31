import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Dimensions, TextInput as RNTextInput, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Search } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import {
  Text,
  SegmentedControl,
  Pill,
  LocationCard,
  CardSkeletonGrid,
} from "../components/atoms";
import { BirdCardThumb } from "../components/molecules/BirdCard";
import { useExploreSpecies, useCards, useAllSpecies, useAllSpeciesPaginated } from "../hooks/useApi";
import { isAllCardsUnlocked } from "../services/devSettings";
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
          segments={["Near me", "All North America"]}
          selectedIndex={segmentIndex}
          onSelect={setSegmentIndex}
          testID="explore-segment"
        />
      </View>

      {segmentIndex === 0 ? (
        <NearMeView navigation={navigation} routeParams={route.params} />
      ) : (
        <AllNAView navigation={navigation} />
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
  const { data: allSpecies } = useAllSpecies();
  const { data: cards } = useCards();
  const spottedIds = useMemo(
    () => new Set((cards ?? []).map((c) => c.species_id)),
    [cards],
  );
  const list = useMemo(() => {
    const species = exploreData?.species ?? [];
    return [...species].sort((a, b) => {
      const aSpotted = a.spotted || spottedIds.has(a.species_id);
      const bSpotted = b.spotted || spottedIds.has(b.species_id);
      if (aSpotted && !bSpotted) return -1;
      if (!aSpotted && bSpotted) return 1;
      return 0;
    });
  }, [exploreData?.species, spottedIds]);

  const illustrationMap = useMemo(() => {
    const map = new Map<string, { url: string; attribution: string | null }>();
    for (const sp of allSpecies ?? []) {
      const url = (sp as any).illustration_url;
      if (url) map.set(sp.id, { url, attribution: (sp as any).illustration_attribution ?? null });
    }
    return map;
  }, [allSpecies]);

  // Prefetch illustration URLs for the first batch of species
  useEffect(() => {
    const urls = list.slice(0, 20)
      .map((item) => illustrationMap.get(item.species_id)?.url)
      .filter(Boolean) as string[];
    if (urls.length > 0) Image.prefetch(urls);
  }, [list, illustrationMap]);

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
          renderItem={({ item, index }) => (
            <Animated.View
              style={styles.gridCell}
              entering={FadeIn.delay(Math.min(index, 7) * 120).duration(600)}
            >
              <Pressable
                onPress={() => {
                  const sp = allSpecies?.find((s) => s.id === item.species_id);
                  navigation.navigate("CardDetail" as any, {
                    speciesId: item.species_id,
                    showAsLocked: true,
                    speciesSnapshot: sp,
                  });
                }}
                testID={`explore-card-${item.species_id}`}
              >
                <BirdCardThumb
                  data={{
                    speciesName: item.common_name,
                    familyName: item.scientific_name,
                    speciesType: item.species_type,
                    habitat: item.habitat,
                    conservationTier: item.conservation_status as any,
                    photoUri: (item.spotted || spottedIds.has(item.species_id) || isAllCardsUnlocked())
                      ? (illustrationMap.get(item.species_id)?.url ?? null)
                      : null,
                    sightingCount: item.sighting_count,
                    locked: isAllCardsUnlocked() ? false : !(item.spotted || spottedIds.has(item.species_id)),
                    rarity: item.rarity as any,
                    about: item.about_text,
                    illustrationUrl: illustrationMap.get(item.species_id)?.url ?? null,
                    illustrationAttribution: illustrationMap.get(item.species_id)?.attribution ?? null,
                  }}
                  testID={`explore-thumb-${item.species_id}`}
                />
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
};

// ── All NA view (paginated grid) ─────────────────────────────────────────

const AllNAView: React.FC<{ navigation: Nav }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allSpecies } = useAllSpecies();
  const { data: cards } = useCards();
  const spottedIds = useMemo(
    () => new Set((cards ?? []).map((c) => c.species_id)),
    [cards],
  );
  const { data, isLoading, isLoadingMore, hasMore, loadMore } =
    useAllSpeciesPaginated(searchQuery);

  return (
    <View style={{ flex: 1 }} testID="explore-all-na">
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={Colors.inkFaint} />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Search species..."
          placeholderTextColor={Colors.inkFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="explore-all-na-search"
        />
      </View>

      {isLoading ? (
        <CardSkeletonGrid count={6} testID="explore-all-loading" />
      ) : data.length === 0 ? (
        <View style={styles.emptyState} testID="explore-all-empty">
          <Text
            variant="semiBold"
            size="lg"
            color={Colors.ink}
            align="center"
          >
            No species match "{searchQuery}"
          </Text>
        </View>
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: Spacing.xl, alignItems: "center" }}>
                <ActivityIndicator size="small" color={Colors.sage} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const spotted = spottedIds.has(item.id);
            return (
              <View style={styles.gridCell}>
                <Pressable
                  onPress={() => {
                    navigation.navigate("CardDetail" as any, {
                      speciesId: item.id,
                      showAsLocked: true,
                      speciesSnapshot: item,
                    });
                  }}
                  testID={`explore-all-card-${item.id}`}
                >
                  <BirdCardThumb
                    data={{
                      speciesName: item.common_name,
                      familyName: item.family,
                      speciesType: item.species_type_name,
                      habitat: item.habitat_name,
                      conservationTier: item.conservation_status as any,
                      photoUri: (spotted || isAllCardsUnlocked())
                        ? ((item as any).illustration_url ?? null)
                        : null,
                      sightingCount: spotted ? 1 : 0,
                      locked: isAllCardsUnlocked() ? false : !spotted,
                      rarity: item.rarity as any,
                      about: item.about_text,
                      illustrationUrl: (item as any).illustration_url,
                      illustrationAttribution:
                        (item as any).illustration_attribution,
                    }}
                    testID={`explore-all-thumb-${item.id}`}
                  />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
});

export default ExploreScreen;
