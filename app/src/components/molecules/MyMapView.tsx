import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { MapPin, Binoculars } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text } from "../atoms";
import { useCards, useMapSightings } from "../../hooks/useApi";

const US_CENTER: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 40,
  longitudeDelta: 40,
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

export const MyMapView: React.FC<{
  onMarkerPress?: (speciesId: string) => void;
}> = ({ onMarkerPress }) => {
  const { data: cards, isLoading: cardsLoading } = useCards();
  const { data: mapSightings, isLoading: sightingsLoading } = useMapSightings();
  const mapRef = useRef<MapView>(null);

  const allCards = cards ?? [];
  const sightings = mapSightings ?? [];
  const totalCaptures = allCards.reduce((sum, c) => sum + c.sighting_count, 0);
  const totalSpecies = allCards.length;

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
      onMarkerPress?.(speciesId);
    },
    [onMarkerPress],
  );

  return (
    <View style={styles.container} testID="my-map-view">
      <View style={styles.statsTrio}>
        <StatBlock
          value={String(totalCaptures)}
          label="Captures"
          isLoading={cardsLoading}
          testID="map-stat-captures"
        />
        <StatBlock
          value={String(totalSpecies)}
          label="Species"
          isLoading={cardsLoading}
          testID="map-stat-species"
        />
        <StatBlock
          value={uniqueStates > 0 ? String(uniqueStates) : "—"}
          label="States"
          isLoading={sightingsLoading}
          testID="map-stat-states"
        />
      </View>

      <View style={styles.mapContainer} testID="my-map">
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={US_CENTER}
          showsUserLocation
          showsMyLocationButton={false}
          testID="my-map-view-map"
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
                handleMarkerPress(
                  (sighting as any).species?.id ?? sighting.species_id,
                )
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

const styles = StyleSheet.create({
  container: {
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

export default MyMapView;
