import React, { useState } from "react";
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

  // HTML con OpenStreetMap (sin necesidad de API key)
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
          background: #007AFF;
          color: white;
          padding: 15px;
          text-align: center;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .instructions {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
          z-index: 1000;
          max-height: 120px;
          overflow-y: auto;
        }
        .confirm-btn {
          background: #007AFF;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
        }
        .confirm-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        #map {
          margin-top: 60px;
          margin-bottom: 140px;
        }
        .selected-info {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h3>📍 Selecciona tu ubicación</h3>
      </div>
      
      <div id="map"></div>
      
      <div class="instructions">
        <p><strong>Toca en el mapa</strong> para seleccionar tu ubicación</p>
        <p id="selected-address">Ninguna ubicación seleccionada</p>
        <div id="selected-coords" class="selected-info"></div>
        <button id="confirm-btn" class="confirm-btn" disabled onclick="confirmLocation()">
          Confirmar Ubicación
        </button>
      </div>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map;
        let marker;
        let selectedLocation = null;

        function initMap() {
          // Ubicación inicial (Buenos Aires)
          const buenosAires = [-34.6118, -58.3960];

          map = L.map('map').setView(buenosAires, 13);

          // Agregar capa de OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Añadir listener para clics en el mapa
          map.on('click', function(e) {
            selectLocation(e.latlng);
          });

          console.log('Mapa inicializado correctamente');
        }

        function selectLocation(latlng) {
          console.log('Ubicación seleccionada:', latlng);
          
          // Remover marcador anterior
          if (marker) {
            map.removeLayer(marker);
          }

          // Crear nuevo marcador
          marker = L.marker([latlng.lat, latlng.lng]).addTo(map);

          // Geocodificación inversa usando Nominatim (gratis)
          const url = \`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${latlng.lat}&lon=\${latlng.lng}&zoom=18&addressdetails=1\`;
          
          fetch(url)
            .then(response => response.json())
            .then(data => {
              console.log('Datos de geocodificación:', data);
              
              let address = 'Ubicación seleccionada';
              
              if (data && data.display_name) {
                address = data.display_name;
                
                // Intentar crear una dirección más limpia
                if (data.address) {
                  const addr = data.address;
                  const parts = [];
                  
                  if (addr.road) parts.push(addr.road);
                  if (addr.house_number) parts.push(addr.house_number);
                  if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
                  if (addr.city || addr.town) parts.push(addr.city || addr.town);
                  if (addr.state) parts.push(addr.state);
                  
                  if (parts.length > 0) {
                    address = parts.join(', ');
                  }
                }
              }

              selectedLocation = {
                address: address,
                lat: latlng.lat,
                lng: latlng.lng
              };
              
              document.getElementById('selected-address').innerText = address;
              document.getElementById('selected-coords').innerText = 
                \`Lat: \${latlng.lat.toFixed(6)}, Lng: \${latlng.lng.toFixed(6)}\`;
              document.getElementById('confirm-btn').disabled = false;
            })
            .catch(error => {
              console.error('Error en geocodificación:', error);
              
              // Fallback sin geocodificación
              selectedLocation = {
                address: \`Ubicación: \${latlng.lat.toFixed(4)}, \${latlng.lng.toFixed(4)}\`,
                lat: latlng.lat,
                lng: latlng.lng
              };
              
              document.getElementById('selected-address').innerText = selectedLocation.address;
              document.getElementById('selected-coords').innerText = 
                \`Lat: \${latlng.lat.toFixed(6)}, Lng: \${latlng.lng.toFixed(6)}\`;
              document.getElementById('confirm-btn').disabled = false;
            });
        }

        function confirmLocation() {
          if (selectedLocation) {
            console.log('Confirmando ubicación:', selectedLocation);
            
            // Enviar ubicación a React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'LOCATION_SELECTED',
                data: selectedLocation
              }));
            } else {
              console.error('ReactNativeWebView no disponible');
            }
          }
        }

        // Inicializar mapa cuando se carga la página
        document.addEventListener('DOMContentLoaded', function() {
          console.log('DOM cargado, inicializando mapa...');
          setTimeout(initMap, 100);
        });
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "LOCATION_SELECTED") {
        const { address, lat, lng } = message.data;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLocationSelect(address, { lat, lng });
        onClose();
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}

        <WebView
          source={{ html: mapHTML }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
