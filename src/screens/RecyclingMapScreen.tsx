import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { colors } from "../styles";
import {
  RecyclingPoint,
  UserLocation,
  RecyclingType,
} from "../types/recycling";
import {
  MOCK_RECYCLING_POINTS,
  RECYCLING_TYPES,
} from "../constants/recyclingData";
import { LocationService } from "../services/locationService";

export const RecyclingMapScreen = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RecyclingPoint | null>(
    null
  );
  const [filteredPoints, setFilteredPoints] = useState<RecyclingPoint[]>(
    MOCK_RECYCLING_POINTS
  );
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isMapLoading, setIsMapLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    getUserLocation();
    startPulseAnimation();
  }, []);

  useEffect(() => {
    filterPoints();
  }, [selectedFilters, searchQuery, selectedPoint]);

  useEffect(() => {
    // Cuando obtenemos la ubicación del usuario o los puntos cambian, actualizar el mapa
    if (userLocation && filteredPoints.length > 0 && webViewRef.current) {
      console.log("📍 RecyclingMapScreen - useEffect triggered:", {
        hasUserLocation: !!userLocation,
        filteredPointsLength: filteredPoints.length,
        hasWebView: !!webViewRef.current,
        userLocation,
      });
      console.log(
        "📍 RecyclingMapScreen - Condiciones cumplidas, llamando updateMapData"
      );
      updateMapData();
    }
  }, [userLocation, filteredPoints, selectedPoint]);

  const getUserLocation = async () => {
    console.log("📍 RecyclingMapScreen - getUserLocation iniciado");
    try {
      const location = await LocationService.getCurrentLocation();
      console.log("📍 RecyclingMapScreen - Ubicación obtenida:", location);
      if (location) {
        setUserLocation(location);
        console.log("📍 RecyclingMapScreen - UserLocation set:", location);
      }
    } catch (error) {
      console.error(
        "❌ RecyclingMapScreen - Error obteniendo ubicación:",
        error
      );
      // Usar ubicación por defecto si hay error
      const defaultLocation = {
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 100,
      };
      console.log(
        "📍 RecyclingMapScreen - Usando ubicación por defecto:",
        defaultLocation
      );
      setUserLocation(defaultLocation);
    }
  };

  const updateMapData = () => {
    console.log("📍 RecyclingMapScreen - updateMapData LLAMADO");

    if (!webViewRef.current) {
      console.log("📍 RecyclingMapScreen - ERROR: webViewRef.current es null");
      return;
    }

    if (!userLocation) {
      console.log(
        "📍 RecyclingMapScreen - ERROR: userLocation es null",
        userLocation
      );
      return;
    }

    console.log("📍 RecyclingMapScreen - Preparando datos para envío");

    const points = filteredPoints.slice(0, 5).map((point) => ({
      ...point,
      isSelected: selectedPoint?.id === point.id,
      isNearest:
        selectedPoint === null &&
        filteredPoints.length > 0 &&
        point.id === filteredPoints[0].id, // El primer punto ya está ordenado por distancia
    }));

    const message = {
      type: "updateData",
      userLocation: userLocation,
      points: points,
      selectedPointId: selectedPoint?.id || null,
    };

    console.log("📍 RecyclingMapScreen - Enviando datos al mapa:", {
      filteredPointsTotal: filteredPoints.length,
      filteredPointsIds: filteredPoints.map((p) => p.id),
      pointsToSend: points.length,
      pointsToSendIds: points.map((p) => p.id),
      userLocation,
      selectedPointId: selectedPoint?.id,
      message,
    });

    // Usar injectJavaScript en lugar de postMessage para mejor compatibilidad
    const jsCode = `
      (function() {
        try {
          console.log('📍 WebView - Inyectando JavaScript...');
          const data = ${JSON.stringify(message)};
          console.log('📍 WebView - Datos recibidos:', JSON.stringify({
            hasUserLocation: !!data.userLocation,
            pointsCount: data.points?.length,
            type: data.type
          }));
          if (typeof updateMapData === 'function') {
            console.log('📍 WebView - Función updateMapData encontrada, ejecutando...');
            updateMapData(data);
          } else if (typeof window.updateMapData === 'function') {
            console.log('📍 WebView - Función window.updateMapData encontrada, ejecutando...');
            window.updateMapData(data);
          } else {
            console.log('📍 WebView - ERROR: updateMapData no encontrada');
          }
        } catch (error) {
          console.log('📍 WebView - Error en JavaScript inyectado:', error.toString());
        }
      })();
      true;
    `;

    console.log("📍 RecyclingMapScreen - Ejecutando injectJavaScript...");
    webViewRef.current.injectJavaScript(jsCode);
    console.log("📍 RecyclingMapScreen - injectJavaScript ejecutado");
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "debug") {
        console.log(data.message, data.data || "");
        return;
      }

      console.log(
        "📍 RecyclingMapScreen - Mensaje recibido del WebView:",
        data
      );

      switch (data.type) {
        case "mapLoaded":
          console.log(
            "📍 RecyclingMapScreen - Mapa cargado, enviando datos..."
          );
          setIsMapLoading(false);
          // Esperar un poco para asegurar que el WebView esté completamente listo
          setTimeout(() => {
            console.log(
              "📍 RecyclingMapScreen - Llamando updateMapData después de delay"
            );
            updateMapData();
          }, 500);
          break;

        case "markerClicked":
          console.log(
            "📍 RecyclingMapScreen - Marcador clickeado:",
            data.pointId
          );
          const clickedPoint = filteredPoints.find(
            (p) => p.id === data.pointId
          );
          if (clickedPoint) {
            // Toggle selection
            if (selectedPoint?.id === clickedPoint.id) {
              setSelectedPoint(null);
            } else {
              setSelectedPoint(clickedPoint);
            }

            // Scroll to top of list
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }, 100);
          }
          break;
      }
    } catch (error) {
      console.error(
        "❌ RecyclingMapScreen - Error processing WebView message:",
        error
      );
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const filterPoints = () => {
    console.log("🔍 RecyclingMapScreen - filterPoints iniciado");
    let points = [...MOCK_RECYCLING_POINTS];
    console.log(
      "🔍 RecyclingMapScreen - Puntos iniciales:",
      points.length,
      points.map((p) => p.id)
    );

    // Filtrar por tipos de residuos
    if (selectedFilters.length > 0) {
      console.log(
        "🔍 RecyclingMapScreen - Aplicando filtros:",
        selectedFilters
      );
      points = points.filter((point) =>
        selectedFilters.some((filter) =>
          point.acceptedWasteTypes.includes(filter)
        )
      );
      console.log(
        "🔍 RecyclingMapScreen - Después de filtros:",
        points.length,
        points.map((p) => p.id)
      );
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      console.log("🔍 RecyclingMapScreen - Aplicando búsqueda:", searchQuery);
      points = points.filter(
        (point) =>
          point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          point.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log(
        "🔍 RecyclingMapScreen - Después de búsqueda:",
        points.length,
        points.map((p) => p.id)
      );
    }

    // Ordenar por distancia si tenemos ubicación
    if (userLocation) {
      console.log(
        "🔍 RecyclingMapScreen - Ordenando por distancia desde:",
        userLocation
      );
      points = points
        .map((point) => ({
          ...point,
          distance: LocationService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            point.latitude,
            point.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance);
      console.log(
        "🔍 RecyclingMapScreen - Después de ordenar:",
        points.length,
        points.map((p) => `${p.id}(${p.distance?.toFixed(1)}km)`)
      );
    }

    // Mover el punto seleccionado al principio de la lista
    if (selectedPoint) {
      console.log(
        "🔍 RecyclingMapScreen - Moviendo punto seleccionado al inicio:",
        selectedPoint.id
      );
      const selectedIndex = points.findIndex((p) => p.id === selectedPoint.id);
      if (selectedIndex > 0) {
        const selectedPointData = points[selectedIndex];
        points.splice(selectedIndex, 1);
        points.unshift(selectedPointData);
        console.log(
          "🔍 RecyclingMapScreen - Punto seleccionado movido. Nuevo orden:",
          points.map((p) => p.id)
        );
      }
    }

    console.log(
      "🔍 RecyclingMapScreen - Puntos finales:",
      points.length,
      points.map((p) => p.id)
    );
    setFilteredPoints(points);
  };

  const toggleFilter = (wasteType: string) => {
    setSelectedFilters((prev) =>
      prev.includes(wasteType)
        ? prev.filter((type) => type !== wasteType)
        : [...prev, wasteType]
    );
  };

  const handleDirections = (point: RecyclingPoint) => {
    Alert.alert(
      "Cómo llegar",
      `¿Deseas abrir la navegación hacia ${point.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, navegar",
          onPress: () => console.log("Navigate to", point),
        },
      ]
    );
  };

  // HTML del mapa interactivo con Leaflet
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html { 
          height: 100%; 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map { 
          height: 100%; 
          width: 100%;
        }
        .recycling-marker {
          background: #22C55E;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .recycling-marker:hover {
          transform: scale(1.1);
        }
        .recycling-marker.selected {
          background: #3B82F6;
          width: 32px;
          height: 32px;
          font-size: 14px;
          border-width: 4px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .recycling-marker.nearest {
          background: #F88D2A;
          width: 28px;
          height: 28px;
          font-size: 13px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(248, 141, 42, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(248, 141, 42, 0); }
          100% { box-shadow: 0 0 0 0 rgba(248, 141, 42, 0); }
        }
        .user-location {
          background: #1E40AF;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(30, 64, 175, 0.4);
          animation: userPulse 2s infinite;
        }
        @keyframes userPulse {
          0% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(30, 64, 175, 0); }
          100% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map;
        let userMarker;
        let pointMarkers = [];

        // Función helper para logging
        function logToRN(message, data) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'debug',
              message: message,
              data: data
            }));
          }
        }

        // Inicializar mapa
        function initMap() {
          logToRN('🗺️ WebView - Inicializando mapa...');
          map = L.map('map', {
            zoomControl: true,
            attributionControl: false
          }).setView([-34.6037, -58.3816], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          logToRN('🗺️ WebView - Mapa inicializado, enviando mapLoaded...');
          // Notificar que el mapa está listo
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          } else {
            logToRN('🗺️ WebView - ReactNativeWebView no disponible');
          }
        }

        // Crear icono personalizado para puntos de reciclaje
        function createRecyclingIcon(isSelected, isNearest) {
          let className = 'recycling-marker';
          if (isSelected) className += ' selected';
          else if (isNearest) className += ' nearest';
          
          return L.divIcon({
            html: '<div class="' + className + '">♻️</div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
        }

        // Crear icono para ubicación del usuario
        function createUserIcon() {
          return L.divIcon({
            html: '<div class="user-location"></div>',
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
        }

        // Actualizar datos del mapa
        function updateMapData(data) {
          logToRN('🗺️ WebView - updateMapData recibido:', JSON.stringify({
            hasUserLocation: !!data.userLocation,
            pointsCount: data.points?.length,
            userLat: data.userLocation?.latitude,
            userLng: data.userLocation?.longitude,
            selectedPointId: data.selectedPointId
          }));
          
          if (!map) {
            logToRN('❌ WebView - Error: Mapa no inicializado');
            return;
          }
          
          // Limpiar marcadores existentes
          logToRN('🗺️ WebView - Limpiando marcadores existentes...');
          pointMarkers.forEach(marker => {
            map.removeLayer(marker);
          });
          pointMarkers = [];
          
          if (userMarker) {
            map.removeLayer(userMarker);
            logToRN('🗺️ WebView - Marcador de usuario removido');
          }

          // Agregar ubicación del usuario
          if (data.userLocation) {
            logToRN('� WebView - Agregando marcador de usuario en: ' + data.userLocation.latitude + ',' + data.userLocation.longitude);
            userMarker = L.marker([data.userLocation.latitude, data.userLocation.longitude], {
              icon: createUserIcon()
            }).addTo(map);
            
            logToRN('✅ WebView - Marcador de usuario agregado exitosamente');
          } else {
            logToRN('⚠️ WebView - No hay ubicación de usuario disponible');
          }

          // Agregar puntos de reciclaje
          if (data.points && data.points.length > 0) {
            logToRN('�️ WebView - Procesando ' + data.points.length + ' puntos de reciclaje...');
            
            data.points.forEach((point, index) => {
              logToRN('� WebView - Agregando punto ' + index + ': ' + point.name + ' (isNearest: ' + point.isNearest + ', isSelected: ' + point.isSelected + ')');
              
              try {
                const marker = L.marker([point.latitude, point.longitude], {
                  icon: createRecyclingIcon(point.isSelected, point.isNearest)
                }).addTo(map);
                
                marker.pointId = point.id;
                
                marker.on('click', function() {
                  logToRN('🗺️ WebView - Marcador clickeado:', point.id);
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'markerClicked',
                      pointId: point.id
                    }));
                  }
                });
                
                // Popup con información
                marker.bindPopup(
                  '<div style="text-align: center; padding: 5px;">' +
                  '<strong>' + point.name + '</strong><br>' +
                  '<small>' + point.address + '</small>' +
                  (point.isNearest ? '<br><span style="color: #F88D2A; font-weight: bold;">Más cercano</span>' : '') +
                  '</div>'
                );
                
                pointMarkers.push(marker);
                logToRN('✅ WebView - Marcador ' + index + ' agregado en: ' + point.latitude + ',' + point.longitude);
              } catch (error) {
                logToRN('❌ WebView - Error agregando marcador ' + index + ': ' + error.toString());
              }
            });
            
            logToRN('🏁 WebView - Todos los marcadores procesados. Total: ' + pointMarkers.length);
          } else {
            logToRN('⚠️ WebView - No hay puntos para mostrar');
          }

          // Determinar dónde centrar el mapa
          let centerLat, centerLng, zoomLevel = 13;
          
          if (data.selectedPointId) {
            // Si hay un punto seleccionado, centrar en él
            const selectedPoint = data.points?.find(p => p.id === data.selectedPointId);
            if (selectedPoint) {
              centerLat = selectedPoint.latitude;
              centerLng = selectedPoint.longitude;
              zoomLevel = 15; // Zoom más cercano para punto seleccionado
              logToRN('🎯 WebView - Centrando en punto seleccionado: ' + selectedPoint.name + ' (' + centerLat + ',' + centerLng + ')');
            } else {
              // Fallback a ubicación del usuario si no se encuentra el punto seleccionado
              if (data.userLocation) {
                centerLat = data.userLocation.latitude;
                centerLng = data.userLocation.longitude;
                logToRN('⚠️ WebView - Punto seleccionado no encontrado, usando ubicación del usuario');
              }
            }
          } else if (data.userLocation) {
            // Si no hay punto seleccionado, centrar en ubicación del usuario
            centerLat = data.userLocation.latitude;
            centerLng = data.userLocation.longitude;
            logToRN('👤 WebView - Centrando en ubicación del usuario (' + centerLat + ',' + centerLng + ')');
          }

          // Centrar el mapa
          if (centerLat && centerLng) {
            map.setView([centerLat, centerLng], zoomLevel);
            logToRN('🎯 WebView - Mapa centrado en: ' + centerLat + ',' + centerLng + ' (zoom: ' + zoomLevel + ')');
          } else {
            logToRN('⚠️ WebView - No se pudo determinar dónde centrar el mapa');
          }
        }

        // Hacer la función disponible globalmente
        window.updateMapData = updateMapData;

        // Inicializar cuando se carga la página
        window.onload = function() {
          initMap();
        };
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Puntos de Reciclaje</Text>
        <Text style={styles.subtitle}>
          {filteredPoints.length} puntos encontrados
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o dirección..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {RECYCLING_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterChip,
              selectedFilters.includes(type.id) && styles.activeFilterChip,
            ]}
            onPress={() => toggleFilter(type.id)}
          >
            <Text style={styles.filterEmoji}>{type.emoji}</Text>
            <Text
              style={[
                styles.filterText,
                selectedFilters.includes(type.id) && styles.activeFilterText,
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onLoadEnd={() => setIsMapLoading(false)}
        />

        {isMapLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}

        {/* Map Info */}
        <View style={styles.mapInfo}>
          <Text style={styles.mapInfoText}>{filteredPoints.length} puntos</Text>
        </View>
      </View>

      {/* Points List */}
      <ScrollView ref={scrollViewRef} style={styles.pointsList}>
        {filteredPoints.map((point, index) => {
          const isSelected = selectedPoint?.id === point.id;
          return (
            <TouchableOpacity
              key={point.id}
              style={[styles.pointCard, isSelected && styles.selectedPointCard]}
              onPress={() => {
                // Si el punto ya está seleccionado, deseleccionarlo
                if (selectedPoint?.id === point.id) {
                  setSelectedPoint(null);
                } else {
                  setSelectedPoint(point);
                }
              }}
            >
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>SELECCIONADO</Text>
                </View>
              )}
              <View style={styles.pointHeader}>
                <View style={styles.pointInfo}>
                  <Text
                    style={[
                      styles.pointName,
                      isSelected && styles.selectedPointName,
                    ]}
                  >
                    {point.name}
                  </Text>
                  <Text style={styles.pointAddress}>{point.address}</Text>
                  {userLocation && (
                    <Text style={styles.pointDistance}>
                      {LocationService.formatDistance(
                        LocationService.calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          point.latitude,
                          point.longitude
                        )
                      )}
                    </Text>
                  )}
                </View>
                <View style={styles.pointStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: colors.success },
                    ]}
                  />
                  <Text style={styles.statusText}>Abierto</Text>
                </View>
              </View>

              <View style={styles.wasteTypesSection}>
                <Text style={styles.wasteTypesLabel}>Acepta:</Text>
                <View style={styles.wasteTypes}>
                  {point.acceptedWasteTypes.slice(0, 3).map((wasteType) => {
                    const type = RECYCLING_TYPES.find(
                      (t) => t.id === wasteType
                    );
                    return (
                      <View key={wasteType} style={styles.wasteTypeChip}>
                        <Text style={styles.wasteTypeEmoji}>{type?.emoji}</Text>
                        <Text style={styles.wasteTypeName}>{type?.name}</Text>
                      </View>
                    );
                  })}
                  {point.acceptedWasteTypes.length > 3 && (
                    <View style={styles.moreTypesChip}>
                      <Text style={styles.moreTypesText}>
                        +{point.acceptedWasteTypes.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => handleDirections(point)}
              >
                <Text style={styles.directionsText}>Cómo llegar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  activeFilterText: {
    color: "white",
  },
  mapContainer: {
    height: 280, // Aumentado para mejor visualización del mapa
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
  },
  pointsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pointCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pointDistance: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  pointStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  wasteTypesSection: {
    marginBottom: 16,
  },
  wasteTypesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
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
  directionsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  directionsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mapInfo: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 10,
  },
  mapInfoText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  selectedIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#22C55E",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  selectedIndicatorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedPointCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "#F0F9FF",
    elevation: 6,
    shadowOpacity: 0.2,
  },
  selectedBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  selectedPointName: {
    color: colors.primary,
    fontWeight: "700",
  },
  // Estilos para la imagen del mapa
  mapImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
  },
  mapImageContent: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  mapIllustration: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  mapBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#E8F5E8",
    borderRadius: 16,
    opacity: 0.5,
  },
  illustrativeMarker: {
    position: "absolute",
    width: 30,
    height: 30,
    backgroundColor: colors.primary,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerEmoji: {
    fontSize: 14,
  },
  userLocationIllustration: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(248, 141, 42, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  mapImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: "center",
  },
  mapImageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  mapImageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  locationRequestText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
});
