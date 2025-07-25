import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { colors } from "../styles";
import { RecyclingPoint, UserLocation, MapRegion } from "../types/recycling";
import {
  MOCK_RECYCLING_POINTS,
  RECYCLING_TYPES,
} from "../constants/recyclingData";
import { LocationService } from "../services/locationService";
import { RecyclingMarker } from "./icons/RecyclingMarker";

const { width } = Dimensions.get("window");

interface RecyclingMapProps {
  onPointSelect?: (point: RecyclingPoint) => void;
}

export const RecyclingMap: React.FC<RecyclingMapProps> = ({
  onPointSelect,
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RecyclingPoint | null>(
    null
  );
  const [region, setRegion] = useState<MapRegion>({
    latitude: -34.5906,
    longitude: -58.4069,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
        setRegion({
          ...region,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
    }
  };

  const handlePointPress = (point: RecyclingPoint) => {
    setSelectedPoint(point);
    onPointSelect?.(point);
  };

  const getNearestPoint = (): RecyclingPoint | null => {
    if (!userLocation) return null;

    let nearest = MOCK_RECYCLING_POINTS[0];
    let minDistance = LocationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      nearest.latitude,
      nearest.longitude
    );

    MOCK_RECYCLING_POINTS.forEach((point) => {
      const distance = LocationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        point.latitude,
        point.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    return nearest;
  };

  const renderMarker = (point: RecyclingPoint) => {
    const isSelected = selectedPoint?.id === point.id;
    const distance = userLocation
      ? LocationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          point.latitude,
          point.longitude
        )
      : 0;

    return (
      <TouchableOpacity
        key={point.id}
        style={[styles.marker, isSelected && styles.selectedMarker]}
        onPress={() => handlePointPress(point)}
      >
        <RecyclingMarker size={isSelected ? 48 : 40} color={colors.primary} />
        {isSelected && (
          <View style={styles.markerInfo}>
            <Text style={styles.markerTitle}>{point.name}</Text>
            <Text style={styles.markerDistance}>
              {LocationService.formatDistance(distance)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const nearestPoint = getNearestPoint();

  return (
    <View style={styles.container}>
      {/* Simulación del mapa */}
      <View style={styles.mapContainer}>
        <View style={styles.mapBackground}>
          <Text style={styles.mapTitle}>Mapa de Reciclaje</Text>
          <Text style={styles.mapSubtitle}>Puntos cercanos en tu zona</Text>

          {/* Simulación de marcadores */}
          <View style={styles.markersContainer}>
            {MOCK_RECYCLING_POINTS.map(renderMarker)}
          </View>

          {/* Indicador de ubicación del usuario */}
          {userLocation && (
            <View style={styles.userLocationMarker}>
              <Text style={styles.userLocationText}>📍</Text>
              <Text style={styles.userLocationLabel}>Tu ubicación</Text>
            </View>
          )}
        </View>
      </View>

      {/* Información del punto más cercano */}
      {nearestPoint && (
        <View style={styles.nearestPointCard}>
          <Text style={styles.cardTitle}>Punto más cercano</Text>
          <Text style={styles.pointName}>{nearestPoint.name}</Text>
          <Text style={styles.pointAddress}>{nearestPoint.address}</Text>

          <View style={styles.wasteTypesContainer}>
            {nearestPoint.acceptedWasteTypes.map((type: string) => {
              const recyclingType = RECYCLING_TYPES.find(
                (rt) => rt.id === type
              );
              return (
                <View key={type} style={styles.wasteTypeTag}>
                  <Text style={styles.wasteTypeEmoji}>
                    {recyclingType?.emoji}
                  </Text>
                  <Text style={styles.wasteTypeName}>
                    {recyclingType?.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {userLocation && (
            <Text style={styles.distance}>
              Distancia:{" "}
              {LocationService.formatDistance(
                LocationService.calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  nearestPoint.latitude,
                  nearestPoint.longitude
                )
              )}
            </Text>
          )}

          <TouchableOpacity style={styles.directionsButton}>
            <Text style={styles.directionsText}>Cómo llegar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
  mapBackground: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  markersContainer: {
    flex: 1,
    position: "relative",
  },
  marker: {
    position: "absolute",
    alignItems: "center",
  },
  selectedMarker: {
    zIndex: 10,
  },
  markerInfo: {
    backgroundColor: colors.cardBackground,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 120,
    alignItems: "center",
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  markerDistance: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userLocationMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    alignItems: "center",
  },
  userLocationText: {
    fontSize: 24,
  },
  userLocationLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  nearestPointCard: {
    backgroundColor: colors.cardBackground,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  pointName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  wasteTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  wasteTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.belandGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  wasteTypeEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  wasteTypeName: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  distance: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  directionsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  directionsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
