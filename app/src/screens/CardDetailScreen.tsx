import React from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../theme";
import { Text, CircleBtn } from "../components/atoms";
import { BirdCard } from "../components/molecules/BirdCard";
import {
  DUMMY_USER_CARDS,
  DUMMY_SPECIES,
  DUMMY_SIGHTINGS,
  type Species,
} from "../data/dummy";
import type { CollectionStackParamList } from "../navigation/stacks/CollectionStack";

type RouteProps = RouteProp<CollectionStackParamList, "CardDetail">;

export const CardDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { speciesId } = route.params;

  const species = DUMMY_SPECIES.find((s) => s.id === speciesId);
  const userCard = DUMMY_USER_CARDS.find((c) => c.speciesId === speciesId);
  const sightings = DUMMY_SIGHTINGS.filter((s) => s.speciesId === speciesId).sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  );

  if (!species) {
    return (
      <SafeAreaView style={styles.container}>
        <Text variant="regular" size="base" color={Colors.ink} testID="card-detail-not-found">
          Species not found
        </Text>
      </SafeAreaView>
    );
  }

  const isSpotted = !!userCard;

  return (
    <SafeAreaView style={styles.container} testID="card-detail-screen">
      {/* Back button */}
      <View style={styles.topBar}>
        <CircleBtn
          icon={ArrowLeft}
          size={36}
          backgroundColor={Colors.white}
          color={Colors.ink}
          onPress={() => navigation.goBack()}
          testID="card-detail-back"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card centered on paper background */}
        <View style={styles.cardWrapper}>
          <BirdCard
            data={{
              speciesName: species.name,
              familyName: species.familyName,
              habitat: species.habitat,
              conservationTier: species.conservationTier,
              photoUri: userCard?.heroPhotoUri ?? null,
              size: species.size,
              about: species.about,
              firstSight: isSpotted
                ? formatDate(userCard!.firstSeenAt)
                : undefined,
              sightingCount: userCard?.sightingCount,
              locked: !isSpotted,
            }}
            testID="card-detail-bird-card"
          />
        </View>

        {/* Sightings log (spotted only) */}
        {isSpotted && sightings.length > 0 && (
          <View style={styles.sightingsSection} testID="card-detail-sightings">
            <Text
              variant="semiBold"
              size="base"
              color={Colors.ink}
              testID="card-detail-sightings-title"
              style={{ marginBottom: Spacing.md }}
            >
              {`Sightings (${sightings.length})`}
            </Text>
            {sightings.map((sighting) => (
              <View
                key={sighting.id}
                style={styles.sightingRow}
                testID={`card-detail-sighting-${sighting.id}`}
              >
                <View style={styles.sightingDot} />
                <View style={{ flex: 1 }}>
                  <Text
                    variant="medium"
                    size="sm"
                    color={Colors.ink}
                    testID={`sighting-location-${sighting.id}`}
                  >
                    {sighting.namedLocation}
                  </Text>
                  <Text
                    variant="regular"
                    size="xs"
                    color={Colors.inkSoft}
                    testID={`sighting-date-${sighting.id}`}
                  >
                    {formatDateTime(sighting.capturedAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Unspotted CTA */}
        {!isSpotted && (
          <View style={styles.unspottedCta} testID="card-detail-unspotted-cta">
            <Text
              variant="medium"
              size="base"
              color={Colors.ink}
              align="center"
              testID="card-detail-unspotted-text"
            >
              You haven't spotted this species yet
            </Text>
            <Text
              variant="regular"
              size="sm"
              color={Colors.inkSoft}
              align="center"
              testID="card-detail-unspotted-hint"
              style={{ marginTop: Spacing.xs }}
            >
              Head out and capture one to add it to your collection
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["5xl"],
  },
  cardWrapper: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  sightingsSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  sightingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
  sightingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
  },
  unspottedCta: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
});

export default CardDetailScreen;
