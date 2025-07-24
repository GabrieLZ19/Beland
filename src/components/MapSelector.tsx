import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import {
  detectCurrentLocation,
  requestLocationEnable,
} from "../utils/locationUtils";

interface MapSelectorProps {
  visible: boolean;
  onLocationSelect: (
    location: string,
    coordinates?: { lat: number; lng: number }
  ) => void;
  onClose: () => void;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  visible,
  onLocationSelect,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const webViewRef = useRef<any>(null);

  // Limpiar estados cuando el modal se cierra
  useEffect(() => {
    if (!visible) {
      // Solo resetear estados si realmente cambiaron para evitar bucles infinitos
      setIsGettingLocation(false);
    } else {
      // Solo resetear isLoading cuando el modal se abre
      setIsLoading(true);
    }
  }, [visible]);

  // Función para obtener ubicación usando el GPS nativo (igual que en LocationModal)
  const handleNativeLocationRequest = async () => {
    try {
      setIsGettingLocation(true);
      console.log("Iniciando detección de ubicación nativa...");

      // Primero intentar habilitar ubicación si está desactivada (mostrará diálogo nativo)
      console.log("Intentando habilitar ubicación...");
      const locationEnabled = await requestLocationEnable();

      if (!locationEnabled) {
        console.error("No se pudo habilitar la ubicación");
        if (webViewRef.current) {
          const message = JSON.stringify({
            type: "locationError",
            error: "Los servicios de ubicación están desactivados.",
          });
          webViewRef.current.postMessage(message);
        }
        return;
      }

      const result = await detectCurrentLocation();

      if (result.success && result.address) {
        console.log("Ubicación obtenida exitosamente:", result);

        // Si tenemos el WebView, enviarle las coordenadas para centrar el mapa
        if (webViewRef.current && result.coordinates) {
          const message = JSON.stringify({
            type: "setLocation",
            lat: result.coordinates.lat,
            lng: result.coordinates.lng,
            address: result.address,
          });
          webViewRef.current.postMessage(message);
        }
      } else {
        console.error("Error obteniendo ubicación:", result.error);
        // Enviar mensaje de error al WebView
        if (webViewRef.current) {
          const message = JSON.stringify({
            type: "locationError",
            error: result.error || "Error al obtener ubicación",
          });
          webViewRef.current.postMessage(message);
        }
      }
    } catch (error) {
      console.error("Error en handleNativeLocationRequest:", error);
      if (webViewRef.current) {
        const message = JSON.stringify({
          type: "locationError",
          error: "Error inesperado al obtener ubicación",
        });
        webViewRef.current.postMessage(message);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  // HTML simplificado con iconos mejorados
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
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .location-prompt {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 1001;
          max-width: 320px;
          width: 90%;
        }
        .gps-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .enable-gps-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin: 10px 0;
        }
        .instructions {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          z-index: 1000;
          text-align: center;
        }
        .confirm-btn {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-top: 10px;
        }
        .confirm-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h3>📍 Selecciona tu ubicación</h3>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Toca en el mapa para seleccionar tu ubicación</p>
      </div>
      
      <div id="location-prompt" class="location-prompt">
        <div class="gps-icon">🎯</div>
        <h3>Encuentra tu ubicación</h3>
        <p>Para una mejor experiencia, vamos a ubicarte en el mapa automáticamente.</p>
        <button onclick="requestLocation()" class="enable-gps-btn">
          🛰️ Activar ubicación
        </button>
        <button onclick="initMapManually()" class="enable-gps-btn" style="background: transparent; color: #667eea; border: 2px solid #667eea;">
          📍 Seleccionar manualmente
        </button>
      </div>
      
      <div id="map" style="display: none;"></div>
      
      <div id="instructions" class="instructions" style="display: none;">
        <p><strong>🎯 Toca en el mapa</strong> para seleccionar tu ubicación</p>
        <p id="selected-address">Ninguna ubicación seleccionada</p>
        <button id="confirm-btn" class="confirm-btn" disabled onclick="confirmLocation()">
          ✓ Confirmar esta ubicación
        </button>
      </div>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map;
        let marker;
        let selectedLocation = null;

        function requestLocation() {
          document.getElementById('location-prompt').innerHTML = 
            '<div class="gps-icon">🛰️</div><h3>Activando GPS...</h3><p>Usando GPS nativo para mayor precisión...</p>';
          
          // En lugar de usar navigator.geolocation, enviar mensaje a React Native
          const message = JSON.stringify({
            type: 'requestNativeLocation'
          });
          
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(message);
          }
        }

        function initMapManually() {
          const defaultLat = -34.6118;
          const defaultLng = -58.3960;
          
          document.getElementById('location-prompt').style.display = 'none';
          document.getElementById('map').style.display = 'block';
          document.getElementById('instructions').style.display = 'block';
          
          initMapWithLocation(defaultLat, defaultLng);
        }

        function initMapWithLocation(lat, lng) {
          map = L.map('map').setView([lat, lng], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);
          
          map.on('click', function(e) {
            if (marker) {
              map.removeLayer(marker);
            }
            
            marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
            
            selectedLocation = {
              lat: e.latlng.lat,
              lng: e.latlng.lng
            };
            
            document.getElementById('selected-address').innerHTML = 'Ubicación seleccionada ✓';
            document.getElementById('confirm-btn').disabled = false;
            
            // Geocodificación
            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + e.latlng.lat + '&lon=' + e.latlng.lng)
              .then(response => response.json())
              .then(data => {
                if (data && data.display_name) {
                  document.getElementById('selected-address').innerHTML = '📍 ' + data.display_name;
                  selectedLocation.address = data.display_name;
                }
              })
              .catch(error => {
                console.error('Error en geocodificación:', error);
              });
          });
        }

        function confirmLocation() {
          if (selectedLocation) {
            const address = selectedLocation.address || 'Ubicación seleccionada';
            const message = JSON.stringify({
              type: 'locationSelected',
              location: address,
              coordinates: {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng
              }
            });
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(message);
            }
          }
        }

        // Funciones para manejar ubicación nativa desde React Native
        function handleNativeLocationSuccess(lat, lng, address) {
          console.log('Ubicación nativa recibida:', lat, lng, address);
          
          document.getElementById('location-prompt').style.display = 'none';
          document.getElementById('map').style.display = 'block';
          document.getElementById('instructions').style.display = 'block';
          
          initMapWithLocation(lat, lng);
          
          // Mostrar mensaje de éxito
          document.getElementById('instructions').innerHTML = 
            '<p><strong>✅ Ubicación detectada!</strong> ' + address + '</p><p>🎯 Toca en el mapa para seleccionar tu ubicación de entrega</p><p id="selected-address">Ninguna ubicación seleccionada</p><button id="confirm-btn" class="confirm-btn" disabled onclick="confirmLocation()">✓ Confirmar esta ubicación</button>';
        }

        function handleNativeLocationError(error) {
          console.error('Error de ubicación nativa:', error);
          
          document.getElementById('location-prompt').innerHTML = 
            '<div class="gps-icon">⚠️</div><h3>Error de ubicación</h3><p>' + error + '</p><button onclick="initMapManually()" class="enable-gps-btn">📍 Continuar sin GPS</button><button onclick="requestLocation()" class="enable-gps-btn" style="background: transparent; color: #667eea; border: 2px solid #667eea;">🔄 Intentar de nuevo</button>';
        }

        // Escuchar mensajes de React Native
        document.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          console.log('Mensaje recibido:', data);
          
          if (data.type === 'setLocation') {
            handleNativeLocationSuccess(data.lat, data.lng, data.address);
          } else if (data.type === 'locationError') {
            handleNativeLocationError(data.error);
          }
        });
        
        // Para Android
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          console.log('Mensaje recibido (Android):', data);
          
          if (data.type === 'setLocation') {
            handleNativeLocationSuccess(data.lat, data.lng, data.address);
          } else if (data.type === 'locationError') {
            handleNativeLocationError(data.error);
          }
        });
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "locationSelected") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLocationSelect(data.location, data.coordinates);
      } else if (data.type === "requestNativeLocation") {
        // El WebView solicita ubicación nativa
        console.log("WebView solicitó ubicación nativa");
        handleNativeLocationRequest();
      }
    } catch (error) {
      console.error("Error procesando mensaje del WebView:", error);
    }
  };

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={closeModal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗺️ Selector de Mapa</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          onLoad={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#667eea",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    alignItems: "center",
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#667eea",
    fontWeight: "500",
  },
  webview: {
    flex: 1,
  },
});
