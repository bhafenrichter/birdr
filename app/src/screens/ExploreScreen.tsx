import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, MapPin } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text, SegmentedControl, Pill } from "../components/atoms";
import {
  DUMMY_EXPLORE_LIST,
  DUMMY_SIGHTINGS,
  DUMMY_USER,
  type ExploreSpecies,
} from "../data/dummy";

export const ExploreScreen: React.FC = () => {
  const [segmentIndex, setSegmentIndex] = useState(0);

  return (
    <SafeAreaView style={styles.container} testID="explore-screen">
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
        <NearMeView />
      ) : (
        <MyMapView />
      )}
    </SafeAreaView>
  );
};

// ── Near Me ────────────────────────────────────────────────────────────────

const NearMeView: React.FC = () => {
  const list = DUMMY_EXPLORE_LIST;
  const unspottedCount = list.filter((e) => !e.spotted).length;

  return (
    <View style={{ flex: 1 }} testID="explore-near-me">
      {/* Context header */}
      <View style={styles.contextHeader}>
        <Text
          variant="medium"
          size="sm"
          color={Colors.inkSoft}
          testID="explore-context"
        >
          {`Spring near Asheville, NC · ${list.length} species expected`}
        </Text>
      </View>

      <FlashList
        data={list}
        keyExtractor={(item) => item.species.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <SpeciesRow item={item} />}
      />
    </View>
  );
};

const SpeciesRow: React.FC<{ item: ExploreSpecies }> = ({ item }) => {
  const { species, seasonality, spotted } = item;

  return (
    <Pressable
      style={styles.speciesRow}
      testID={`explore-species-${species.id}`}
    >
      {/* Reference illustration placeholder */}
      <View style={styles.speciesAvatar}>
        <Text variant="bold" size="lg" color={Colors.white} testID={`explore-avatar-${species.id}`}>
          {species.name.charAt(0)}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.speciesInfo}>
        <Text
          variant="medium"
          size="base"
          color={Colors.ink}
          testID={`explore-name-${species.id}`}
        >
          {species.name}
        </Text>
        <Text
          variant="regular"
          size="xs"
          color={Colors.inkSoft}
          testID={`explore-meta-${species.id}`}
        >
          {`${species.speciesType} · ${seasonality}`}
        </Text>
      </View>

      {/* Status */}
      {spotted ? (
        <View style={styles.spottedBadge} testID={`explore-spotted-${species.id}`}>
          <Check size={14} color={Colors.white} strokeWidth={2.5} />
        </View>
      ) : (
        <Text
          variant="regular"
          size="xs"
          color={Colors.inkFaint}
          testID={`explore-unspotted-${species.id}`}
        >
          Not yet
        </Text>
      )}
    </Pressable>
  );
};

// ── My Map ─────────────────────────────────────────────────────────────────

const MyMapView: React.FC = () => {
  const user = DUMMY_USER;
  const sightings = DUMMY_SIGHTINGS;
  const uniqueStates = new Set(
    sightings.map((s) => s.namedLocation.split(", ").pop())
  );

  return (
    <View style={styles.myMapContainer} testID="explore-my-map">
      {/* Stats trio */}
      <View style={styles.statsTrio}>
        <StatBlock
          value={String(user.totalCaptures)}
          label="Captures"
          testID="explore-stat-captures"
        />
        <StatBlock
          value={String(user.totalSpecies)}
          label="Species"
          testID="explore-stat-species"
        />
        <StatBlock
          value={String(uniqueStates.size)}
          label="States"
          testID="explore-stat-states"
        />
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
          {`${sightings.length} sightings across ${uniqueStates.size} state${uniqueStates.size !== 1 ? "s" : ""}`}
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
    <Text variant="bold" size="xl" color={Colors.ink} testID={`${testID}-value`}>
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
  contextHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  separator: {
    height: 1,
    backgroundColor: Colors.paper,
  },
  speciesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  speciesAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  speciesInfo: {
    flex: 1,
    gap: 2,
  },
  spottedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.sage,
    alignItems: "center",
    justifyContent: "center",
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
