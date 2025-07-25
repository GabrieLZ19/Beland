import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { colors } from "../styles";
import { RecyclingPoint, UserLocation } from "../types/recycling";
import {
  MOCK_RECYCLING_POINTS,
  RECYCLING_TYPES,
} from "../constants/recyclingData";
import { LocationService } from "../services/locationService";
import { RecyclingMarker } from "./icons/RecyclingMarker";

const { width } = Dimensions.get("window");

interface RecyclingMapCompactProps {
  onPress?: () => void;
}

export const RecyclingMapCompact: React.FC<RecyclingMapCompactProps> = ({
  onPress,
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestPoint, setNearestPoint] = useState<RecyclingPoint | null>(null);
  const [nearestPoints, setNearestPoints] = useState<RecyclingPoint[]>([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [recyclingStats] = useState({
    totalPointsInArea: 12,
    weeklyRecycled: 847,
    carbonSaved: 156,
    treesEquivalent: 23,
  });

  useEffect(() => {
    getUserLocation();
    startPulseAnimation();
  }, []);

  useEffect(() => {
    console.log(
      "RecyclingMapCompact - nearestPoints updated:",
      nearestPoints.length
    );
  }, [nearestPoints]);

  // Función para convertir coordenadas GPS a posiciones en el mapa visual
  const coordinatesToMapPosition = (latitude: number, longitude: number) => {
    if (!userLocation) return { left: 100, top: 100 };

    // Definir los límites del mapa visual (área de Buenos Aires ampliada)
    const mapBounds = {
      north: -34.55, // Más al norte
      south: -34.65, // Más al sur
      west: -58.5, // Más al oeste
      east: -58.35, // Más al este
    };

    // Dimensiones del mapa visual (estimadas en pixels)
    const mapWidth = 280; // Ancho aproximado del mapa
    const mapHeight = 200; // Alto del mapa

    // Convertir coordenadas a posiciones en pixels
    const xPercent =
      (longitude - mapBounds.west) / (mapBounds.east - mapBounds.west);
    const yPercent =
      (mapBounds.north - latitude) / (mapBounds.north - mapBounds.south);

    const xPixels = xPercent * mapWidth;
    const yPixels = yPercent * mapHeight;

    // Asegurar que los puntos estén dentro del mapa visual (con margen)
    const constrainedX = Math.max(20, Math.min(mapWidth - 20, xPixels));
    const constrainedY = Math.max(20, Math.min(mapHeight - 20, yPixels));

    return {
      left: constrainedX,
      top: constrainedY,
    };
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getUserLocation = async () => {
    console.log("🌍 DEBUGGING getUserLocation - INICIANDO");
    console.log("📡 Intentando obtener ubicación del usuario...");

    try {
      // Primer intento: LocationService estándar
      console.log("📡 Primer intento: LocationService con expo-location...");
      const location = await LocationService.getCurrentLocation();
      console.log("📍 Resultado primer intento:", location);

      if (location) {
        console.log("✅ Ubicación real obtenida");
        setUserLocation(location);
        findNearestPoints(location);
        return;
      }

      // Segundo intento: GPS forzado
      console.log("🚀 Segundo intento: Forzando GPS real...");
      const realLocation = await LocationService.forceRealLocation();

      if (realLocation) {
        console.log("✅ GPS real exitoso en segundo intento");
        setUserLocation(realLocation);
        findNearestPoints(realLocation);
        return;
      }

      // Último recurso: ubicación por defecto SOLO si ambos fallan
      console.log("🏠 Usando ubicación por defecto como último recurso");
      const defaultLocation = {
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 100,
      };
      setUserLocation(defaultLocation);
      findNearestPoints(defaultLocation);
    } catch (error) {
      console.error("� Error obteniendo ubicación:", error);
      // Usar ubicación por defecto si hay error
      const defaultLocation = {
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 100,
      };
      console.log(
        "🏠 Usando ubicación por defecto después del error:",
        defaultLocation
      );
      setUserLocation(defaultLocation);
      findNearestPoints(defaultLocation);
    }
  };

  const findNearestPoints = (location: UserLocation) => {
    console.log("🔍 DEBUGGING findNearestPoints:");
    console.log("📍 User location:", location);
    console.log("🗂️ Total points available:", MOCK_RECYCLING_POINTS.length);

    const pointsWithDistance = MOCK_RECYCLING_POINTS.map((point) => {
      console.log(
        `🎯 Processing point: ${point.name} at (${point.latitude}, ${point.longitude})`
      );

      const distance = LocationService.calculateDistance(
        location.latitude,
        location.longitude,
        point.latitude,
        point.longitude
      );

      console.log(`📏 Distance to ${point.name}: ${distance.toFixed(2)}km`);

      return {
        ...point,
        distance,
      };
    }).sort((a, b) => a.distance - b.distance);

    console.log("✅ Nearest points found:", pointsWithDistance.length);
    console.log(
      "🎯 First 3 points distances:",
      pointsWithDistance
        .slice(0, 3)
        .map((p) => ({ name: p.name, distance: p.distance.toFixed(2) + "km" }))
    );

    // Asegurar que siempre tengamos hasta 5 puntos para mostrar
    const nearestPointsToShow = pointsWithDistance.slice(0, 5);
    setNearestPoints(nearestPointsToShow);
    setNearestPoint(pointsWithDistance[0]);
  };

  const renderMarker = (point: RecyclingPoint, index: number) => {
    const isNearest = nearestPoint?.id === point.id;
    const positions = [
      { top: 24, left: 32 },
      { top: 40, right: 40 },
      { bottom: 48, left: 56 },
      { top: 72, left: 24 },
      { top: 96, right: 32 },
    ];

    const position = positions[index] || positions[0];

    return (
      <View
        key={point.id}
        style={[styles.markerPosition, position, isNearest && { zIndex: 10 }]}
      >
        {isNearest ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <RecyclingMarker size={32} color={colors.belandGreen} />
          </Animated.View>
        ) : (
          <RecyclingMarker size={24} color={colors.primary} />
        )}
        {isNearest && (
          <View style={styles.nearestIndicator}>
            <Text style={styles.nearestText}>Más cerca</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>♻️ Puntos de Reciclaje</Text>
          <Text style={styles.subtitle}>
            {recyclingStats.totalPointsInArea} puntos disponibles en tu zona
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Mapa visual mejorado */}
        <TouchableOpacity
          style={styles.mapContainer}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.mapBackground}>
            {/* Grid de fondo para simular calles */}
            <View style={styles.gridContainer}>
              {[...Array(3)].map((_, i) => (
                <View
                  key={`h-${i}`}
                  style={[
                    styles.gridLine,
                    styles.horizontalLine,
                    { top: `${25 + i * 25}%` },
                  ]}
                />
              ))}
              {[...Array(3)].map((_, i) => (
                <View
                  key={`v-${i}`}
                  style={[
                    styles.gridLine,
                    styles.verticalLine,
                    { left: `${25 + i * 25}%` },
                  ]}
                />
              ))}
            </View>

            {/* Marcadores de puntos de reciclaje - ordenados por proximidad */}
            {nearestPoints.slice(0, 5).map((point, index) => {
              // Usar coordenadas GPS reales para posicionar
              const realPosition = coordinatesToMapPosition(
                point.latitude,
                point.longitude
              );
              const isNearest = index === 0; // El primer punto es el más cercano
              const distance = point.distance || 0;

              console.log(
                `Marker ${index} (${isNearest ? "NEAREST" : "regular"}):`,
                point.name,
                `Distance: ${distance.toFixed(2)}km`,
                "at GPS:",
                `(${point.latitude}, ${point.longitude})`,
                "mapped to:",
                realPosition
              );

              return (
                <View
                  key={point.id}
                  style={[
                    styles.markerPosition,
                    {
                      left: realPosition.left,
                      top: realPosition.top,
                    },
                    { zIndex: isNearest ? 20 : 5 + index }, // Mayor z-index para el más cercano
                  ]}
                >
                  {isNearest ? (
                    <Animated.View
                      style={{ transform: [{ scale: pulseAnim }] }}
                    >
                      <View style={styles.nearestMarker}>
                        <View
                          style={[
                            styles.markerBackground,
                            styles.nearestMarkerBackground,
                          ]}
                        >
                          <RecyclingMarker size={36} color="#FFFFFF" />
                        </View>
                        <View style={styles.nearestBadge}>
                          <Text style={styles.nearestBadgeText}>MÁS CERCA</Text>
                        </View>
                        <View style={styles.nearestDistanceBadge}>
                          <Text style={styles.nearestDistanceText}>
                            {LocationService.formatDistance(distance)}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  ) : (
                    <View style={styles.regularMarker}>
                      <View style={styles.markerBackground}>
                        <RecyclingMarker size={24} color={colors.belandGreen} />
                      </View>
                      <View style={styles.regularDistanceBadge}>
                        <Text style={styles.regularDistanceText}>
                          {LocationService.formatDistance(distance)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Ubicación del usuario posicionada por GPS real */}
            {userLocation && (
              <View
                style={[
                  styles.userLocationWrapper,
                  coordinatesToMapPosition(
                    userLocation.latitude,
                    userLocation.longitude
                  ),
                ]}
              >
                <Animated.View
                  style={[
                    styles.userLocationPulse,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={styles.userLocationDot}>
                  <Text style={styles.userLocationIcon}>📍</Text>
                </View>
                <View style={styles.userLocationBadge}>
                  <Text style={styles.userLocationText}>TÚ</Text>
                </View>
              </View>
            )}

            {/* Información superpuesta mejorada */}
            <View style={styles.mapOverlay}>
              <Text style={styles.mapStats}>
                {nearestPoints.length} puntos cercanos
              </Text>
              {nearestPoint && (
                <View style={styles.nearestInfoContainer}>
                  <Text style={styles.nearestInfo}>
                    📍{" "}
                    {LocationService.formatDistance(nearestPoint.distance || 0)}
                  </Text>
                  <Text style={styles.nearestInfoExtra}>🕒 Abierto 24h</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Panel de información mejorado del punto más cercano */}
        {nearestPoint && userLocation && (
          <View style={styles.infoPanel}>
            <View style={styles.infoPanelHeader}>
              <Text style={styles.infoPanelTitle}>Punto más cercano</Text>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>
                  {LocationService.formatDistance(nearestPoint.distance || 0)}
                </Text>
              </View>
            </View>

            <Text style={styles.pointName}>{nearestPoint.name}</Text>
            <Text style={styles.pointAddress}>{nearestPoint.address}</Text>

            {/* Información adicional de puntos cercanos */}
            <View style={styles.nearbyPointsSection}>
              <Text style={styles.nearbyPointsLabel}>
                {nearestPoints.length} puntos en tu zona
              </Text>
              <View style={styles.nearbyPointsList}>
                {nearestPoints.slice(0, 3).map((point, index) => (
                  <View key={point.id} style={styles.nearbyPointItem}>
                    <Text style={styles.nearbyPointDistance}>
                      {LocationService.formatDistance(point.distance || 0)}
                    </Text>
                    <Text style={styles.nearbyPointName} numberOfLines={1}>
                      {point.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.wasteTypesSection}>
              <Text style={styles.wasteTypesLabel}>Acepta:</Text>
              <View style={styles.wasteTypes}>
                {nearestPoint.acceptedWasteTypes
                  .slice(0, 4)
                  .map((type: string) => {
                    const recyclingType = RECYCLING_TYPES.find(
                      (rt) => rt.id === type
                    );
                    return (
                      <View key={type} style={styles.wasteTypeChip}>
                        <Text style={styles.wasteTypeEmoji}>
                          {recyclingType?.emoji}
                        </Text>
                        <Text style={styles.wasteTypeName}>
                          {recyclingType?.name}
                        </Text>
                      </View>
                    );
                  })}
                {nearestPoint.acceptedWasteTypes.length > 4 && (
                  <View style={styles.moreTypesChip}>
                    <Text style={styles.moreTypesText}>
                      +{nearestPoint.acceptedWasteTypes.length - 4}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  console.log("⭐ Favorito agregado:", nearestPoint.name);
                  // Aquí se agregaría a favoritos
                }}
              >
                <Text style={styles.quickActionText}>⭐ Favorito</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => {
                  console.log("📍 Navegando a:", nearestPoint.name);
                  // Aquí se abriría navegación
                }}
              >
                <Text style={styles.directionsText}>📍 Cómo llegar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.belandGreenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginRight: 4,
  },
  arrow: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  mapContainer: {
    marginBottom: 20,
  },
  mapBackground: {
    height: 200,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "#D1E7FE",
  },
  horizontalLine: {
    height: 1,
    left: 0,
    right: 0,
  },
  verticalLine: {
    width: 1,
    top: 0,
    bottom: 0,
  },
  markerPosition: {
    position: "absolute",
    alignItems: "center",
  },
  nearestIndicator: {
    backgroundColor: colors.belandGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  nearestText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  userLocation: {
    position: "absolute",
    alignItems: "center",
  },
  userLocationPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.5)",
    top: -10,
    left: -10,
  },
  userLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 6,
  },
  userLocationIcon: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  userLocationText: {
    fontSize: 8,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 2,
  },
  nearestInfo: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  mapOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mapStats: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  infoPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginTop: 4,
  },
  infoPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoPanelTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  distanceBadge: {
    backgroundColor: colors.belandGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.belandGreen,
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
  wasteTypesSection: {
    marginBottom: 12,
  },
  wasteTypesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  wasteTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  wasteTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  wasteTypeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  wasteTypeName: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  moreTypesChip: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  moreTypesText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  nearbyPointsSection: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  nearbyPointsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  nearbyPointsList: {
    gap: 6,
  },
  nearbyPointItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  nearbyPointDistance: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    minWidth: 60,
  },
  nearbyPointName: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: 8,
  },
  titleSection: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 12,
  },
  nearestInfoContainer: {
    alignItems: "flex-end",
  },
  nearestInfoExtra: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#FEF3F2",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  directionsButton: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  directionsText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  nearestMarker: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  nearestMarkerBackground: {
    backgroundColor: "#F88D2A",
    borderRadius: 24,
    padding: 6,
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  nearestBadge: {
    position: "absolute",
    top: -16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 70,
    borderWidth: 2,
    borderColor: "#F88D2A",
  },
  nearestBadgeText: {
    color: "#F88D2A",
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  nearestDistanceBadge: {
    position: "absolute",
    top: 42,
    backgroundColor: "#1F2937",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 50,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  nearestDistanceText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  regularDistanceBadge: {
    position: "absolute",
    top: 28,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 35,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  regularDistanceText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  regularMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerBackground: {
    borderRadius: 16,
    padding: 3,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  nearestMarkerText: {
    position: "absolute",
    fontSize: 12,
    color: colors.primary,
    fontWeight: "bold",
    top: -2,
    left: -2,
  },
  userLocationWrapper: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -15 }, { translateY: -15 }], // Centrar el marcador
  },
  userLocationBadge: {
    position: "absolute",
    top: 25,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 20,
  },
});
