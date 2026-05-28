import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput as RNTextInput,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Colors,
  Spacing,
  BorderRadius,
  Fonts,
  FontSizes,
  Shadows,
} from "../theme";
import { Text, SegmentedControl, CardSkeletonGrid } from "../components/atoms";
import { BirdCardThumb } from "../components/molecules/BirdCard";
import {
  useCards,
  useAllSpecies,
  useAllSpeciesPaginated,
} from "../hooks/useApi";
import type { CollectionStackParamList } from "../navigation/stacks/CollectionStack";

type Nav = NativeStackNavigationProp<CollectionStackParamList>;

export const CollectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cards, isLoading: cardsLoading } = useCards();
  const { data: allSpecies, isLoading: speciesLoading } = useAllSpecies();
  const spottedCards = cards ?? [];
  const species = allSpecies ?? [];
  const spottedIds = new Set(spottedCards.map((c) => c.species_id));

  const filteredSpotted = useMemo(
    () =>
      spottedCards.filter((c) => {
        const sp = species.find((s) => s.id === c.species_id);
        return sp?.common_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }),
    [searchQuery, spottedCards, species],
  );

  const segments = [
    `Spotted · ${spottedCards.length}`,
    `All NA · ${species.length}`,
  ];

  const handleCardPress = (speciesId: string) => {
    const sp = species.find((s) => s.id === speciesId);
    navigation.navigate("CardDetail", { speciesId, speciesSnapshot: sp });
  };

  const handleAllNACardPress = (speciesId: string) => {
    const sp = species.find((s) => s.id === speciesId);
    navigation.navigate("CardDetail", { speciesId, showAsLocked: true, speciesSnapshot: sp });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="collection-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text
          variant="bold"
          size="xl"
          color={Colors.ink}
          testID="collection-title"
        >
          Collection
        </Text>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          segments={segments}
          selectedIndex={segmentIndex}
          onSelect={setSegmentIndex}
          testID="collection-segment"
        />
      </View>

      {/* Search bar */}
      <View style={styles.searchBar} testID="collection-search">
        <Search size={18} color={Colors.inkFaint} />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Search species..."
          placeholderTextColor={Colors.inkFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="collection-search-input"
        />
      </View>

      {/* Grid */}
      {segmentIndex === 0 ? (
        <SpottedView
          cards={filteredSpotted}
          species={species}
          searchQuery={searchQuery}
          isLoading={cardsLoading || speciesLoading}
          onCardPress={handleCardPress}
        />
      ) : (
        <AllNAView
          searchQuery={searchQuery}
          spottedIds={spottedIds}
          onCardPress={handleAllNACardPress}
        />
      )}
    </SafeAreaView>
  );
};

// ── Spotted view ──────────────────────────────────────────────────────────

const SpottedView: React.FC<{
  cards: any[];
  species: any[];
  searchQuery: string;
  isLoading: boolean;
  onCardPress: (id: string) => void;
}> = ({ cards, species, searchQuery, isLoading, onCardPress }) => {
  if (isLoading) {
    return <CardSkeletonGrid count={6} testID="collection-spotted-skeleton" />;
  }

  if (cards.length === 0) {
    return (
      <View style={styles.emptyState} testID="collection-empty">
        <Text
          variant="semiBold"
          size="lg"
          color={Colors.ink}
          align="center"
          testID="collection-empty-title"
        >
          {searchQuery ? "No species match your search" : "No captures yet"}
        </Text>
        {!searchQuery && (
          <Text
            variant="regular"
            size="sm"
            color={Colors.inkSoft}
            align="center"
            testID="collection-empty-subtitle"
            style={{ marginTop: Spacing.sm }}
          >
            Photograph your first bird to start your collection
          </Text>
        )}
      </View>
    );
  }

  return (
    <FlashList
      data={cards}
      keyExtractor={(item) => item.species_id}
      numColumns={2}
      contentContainerStyle={styles.gridContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const sp = species.find((s: any) => s.id === item.species_id);
        const delay = Math.min(index, 7) * 80;
        return (
          <Animated.View
            style={styles.gridCell}
            entering={FadeIn.delay(delay).duration(400)}
          >
            <Pressable
              onPress={() => onCardPress(item.species_id)}
              testID={`collection-card-${item.species_id}`}
            >
              <Animated.View sharedTransitionTag={`card-${item.species_id}`}>
                <BirdCardThumb
                  data={{
                    speciesName: sp?.common_name ?? "Unknown",
                    familyName: sp?.family ?? "",
                    speciesType: sp?.species_type_name ?? "",
                    habitat: sp?.habitat_name ?? "",
                    conservationTier: (sp?.conservation_status ?? "LC") as any,
                    photoUri: item.hero_photo_url,
                    sightingCount: item.sighting_count,
                    rarity: sp?.rarity as any,
                    about: sp?.about_text,
                  }}
                  testID={`collection-thumb-${item.species_id}`}
                />
              </Animated.View>
            </Pressable>
          </Animated.View>
        );
      }}
    />
  );
};

// ── All NA view (paginated 3-col grid) ────────────────────────────────────

const AllNAView: React.FC<{
  searchQuery: string;
  spottedIds: Set<string>;
  onCardPress: (id: string) => void;
}> = ({ searchQuery, spottedIds, onCardPress }) => {
  const { data, isLoading, isLoadingMore, hasMore, loadMore } =
    useAllSpeciesPaginated(searchQuery);

  if (isLoading) {
    return <CardSkeletonGrid count={6} testID="collection-all-loading" />;
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyState} testID="collection-all-empty">
        <Text
          variant="semiBold"
          size="lg"
          color={Colors.ink}
          align="center"
          testID="collection-all-empty-title"
        >
          No species match "{searchQuery}"
        </Text>
      </View>
    );
  }

  return (
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
          <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" color={Colors.sage} />
          </View>
        ) : null
      }
      renderItem={({ item, index }) => {
        const spotted = spottedIds.has(item.id);
        const delay = Math.min(index, 7) * 80;
        return (
          <Animated.View
            style={styles.gridCell}
            entering={FadeIn.delay(delay).duration(400)}
          >
            <Pressable
              onPress={() => onCardPress(item.id)}
              testID={`collection-card-${item.id}`}
            >
              <Animated.View sharedTransitionTag={`card-${item.id}`}>
                <BirdCardThumb
                  data={{
                    speciesName: item.common_name,
                    familyName: item.family,
                    speciesType: item.species_type_name,
                    habitat: item.habitat_name,
                    conservationTier: item.conservation_status as any,
                    photoUri: spotted ? ((item as any).illustration_url ?? null) : null,
                    sightingCount: spotted ? 1 : 0,
                    locked: !spotted,
                    rarity: item.rarity as any,
                    about: item.about_text,
                    illustrationUrl: (item as any).illustration_url,
                    illustrationAttribution: (item as any).illustration_attribution,
                  }}
                  testID={`collection-thumb-${item.id}`}
                />
              </Animated.View>
            </Pressable>
          </Animated.View>
        );
      }}
    />
  );
};

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
    paddingBottom: Spacing.xs,
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
  gridContent: {
    paddingTop: Spacing.lg,
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
    paddingHorizontal: Spacing["3xl"],
  },
  loadingFooter: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
});

export default CollectionScreen;
