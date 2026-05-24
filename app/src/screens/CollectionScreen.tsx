import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput as RNTextInput,
} from "react-native";
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
import { Text, SegmentedControl } from "../components/atoms";
import { BirdCardThumb } from "../components/molecules/BirdCard";
import { useCards, useAllSpecies } from "../hooks/useApi";
import type { CollectionStackParamList } from "../navigation/stacks/CollectionStack";

type Nav = NativeStackNavigationProp<CollectionStackParamList>;

export const CollectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cards } = useCards();
  const { data: allSpecies } = useAllSpecies();
  const spottedCards = cards ?? [];
  const species = allSpecies ?? [];
  const spottedIds = new Set(spottedCards.map((c) => c.species_id));

  const filteredSpotted = useMemo(
    () =>
      spottedCards.filter((c) => {
        const sp = species.find((s) => s.id === c.species_id);
        return sp?.common_name.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    [searchQuery, spottedCards, species]
  );

  // All NA: group by habitat, mark spotted/locked
  const allNAByHabitat = useMemo(() => {
    const groups = new Map<string, { species: typeof species[0]; spotted: boolean }[]>();
    for (const sp of species) {
      const habitat = sp.habitat_name;
      const list = groups.get(habitat) ?? [];
      list.push({ species: sp, spotted: spottedIds.has(sp.id) });
      groups.set(habitat, list);
    }
    return Array.from(groups.entries()).map(([habitat, items]) => ({
      habitat,
      items,
      spotted: items.filter((i) => i.spotted).length,
      total: items.length,
    }));
  }, [species, spottedIds]);

  const segments = [
    `Spotted · ${spottedCards.length}`,
    `All NA · ${species.length}`,
  ];

  const handleCardPress = (speciesId: string) => {
    navigation.navigate("CardDetail", { speciesId });
  };

  return (
    <SafeAreaView style={styles.container} testID="collection-screen">
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
        // Spotted view
        filteredSpotted.length === 0 ? (
          <View style={styles.emptyState} testID="collection-empty">
            <Text
              variant="semiBold"
              size="lg"
              color={Colors.ink}
              align="center"
              testID="collection-empty-title"
            >
              {searchQuery
                ? "No species match your search"
                : "No captures yet"}
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
        ) : (
          <FlashList
            data={filteredSpotted}
            keyExtractor={(item) => item.species_id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const sp = species.find((s) => s.id === item.species_id);
              return (
                <Pressable
                  style={styles.gridCell}
                  onPress={() => handleCardPress(item.species_id)}
                  testID={`collection-card-${item.species_id}`}
                >
                  <BirdCardThumb
                    data={{
                      speciesName: sp?.common_name ?? "Unknown",
                      familyName: sp?.family ?? "",
                      habitat: sp?.habitat_name ?? "",
                      conservationTier: (sp?.conservation_status ?? "LC") as any,
                      photoUri: item.hero_photo_url,
                      sightingCount: item.sighting_count,
                    }}
                    testID={`collection-thumb-${item.species_id}`}
                  />
                </Pressable>
              );
            }}
          />
        )
      ) : (
        // All NA view — grouped by habitat
        <FlatList
          data={allNAByHabitat}
          keyExtractor={(item) => item.habitat}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => (
            <View
              style={styles.habitatGroup}
              testID={`collection-habitat-${group.habitat}`}
            >
              <Text
                variant="semiBold"
                size="base"
                color={Colors.ink}
                testID={`collection-habitat-${group.habitat}-title`}
              >
                {`${group.habitat} · ${group.spotted} of ${group.total}`}
              </Text>
              <View style={styles.habitatGrid}>
                {group.items.map(({ species: sp, spotted }) => (
                  <Pressable
                    key={sp.id}
                    style={styles.gridCell}
                    onPress={() => handleCardPress(sp.id)}
                    testID={`collection-card-${sp.id}`}
                  >
                    <BirdCardThumb
                      data={{
                        speciesName: sp.common_name,
                        familyName: sp.family,
                        habitat: sp.habitat_name,
                        conservationTier: sp.conservation_status as any,
                        photoUri: null,
                        sightingCount: spotted ? 1 : 0,
                        locked: !spotted,
                      }}
                      testID={`collection-thumb-${sp.id}`}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
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
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  gridRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gridCell: {
    flex: 1,
    maxWidth: "33%",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  habitatGroup: {
    marginBottom: Spacing.xl,
  },
  habitatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});

export default CollectionScreen;
