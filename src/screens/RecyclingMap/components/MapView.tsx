import React, { useRef, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { styles } from "@screens/RecyclingMap/styles/MapStyles";
import { useRecyclingMap } from "../hooks/useRecyclingMap";

export const MapView = () => {
  const { filteredPoints, selectedPoint, userLocation, pulseAnim } =
    useRecyclingMap();
  const webViewRef = useRef<WebView>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    if (userLocation && filteredPoints.length > 0 && webViewRef.current) {
      updateMapData();
    }
  }, [userLocation, filteredPoints, selectedPoint]);

  const updateMapData = () => {
    if (!webViewRef.current || !userLocation) return;
    const points = filteredPoints.slice(0, 5).map((point: any) => ({
      ...point,
      isSelected: selectedPoint?.id === point.id,
      isNearest:
        selectedPoint === null &&
        filteredPoints.length > 0 &&
        point.id === filteredPoints[0].id,
    }));
    const message = {
      type: "updateData",
      userLocation: userLocation,
      points: points,
      selectedPointId: selectedPoint?.id || null,
    };
    const jsCode = `
      (function() {
        try {
          const data = ${JSON.stringify(message)};
          if (typeof updateMapData === 'function') {
            updateMapData(data);
          } else if (typeof window.updateMapData === 'function') {
            window.updateMapData(data);
          }
        } catch (error) {}
      })();
      true;
    `;
    webViewRef.current.injectJavaScript(jsCode);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "debug") {
        console.log(data.message, data.data || "");
        return;
      }
      switch (data.type) {
        case "mapLoaded":
          setIsMapLoading(false);
          setTimeout(() => {
            updateMapData();
          }, 500);
          break;
        case "markerClicked":
          // Aquí podrías levantar un callback o manejar la selección desde el hook global
          break;
      }
    } catch (error) {
      console.error("Error processing WebView message:", error);
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #map { height: 100%; width: 100%; }
        .recycling-marker { background: #22C55E; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; transition: all 0.2s ease; }
        .recycling-marker:hover { transform: scale(1.1); }
        .recycling-marker.selected { background: #3B82F6; width: 32px; height: 32px; font-size: 14px; border-width: 4px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
        .recycling-marker.nearest { background: #F88D2A; width: 28px; height: 28px; font-size: 13px; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(248, 141, 42, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(248, 141, 42, 0); } 100% { box-shadow: 0 0 0 0 rgba(248, 141, 42, 0); } }
        .user-location { background: #1E40AF; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(30, 64, 175, 0.4); animation: userPulse 2s infinite; }
        @keyframes userPulse { 0% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(30, 64, 175, 0); } 100% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0); } }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map;
        let userMarker;
        let pointMarkers = [];
        function logToRN(message, data) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', message: message, data: data }));
          }
        }
        function initMap() {
          map = L.map('map', { zoomControl: true, attributionControl: false }).setView([-34.6037, -58.3816], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapLoaded' }));
          }
        }
        function createRecyclingIcon(isSelected, isNearest) {
          let className = 'recycling-marker';
          if (isSelected) className += ' selected';
          else if (isNearest) className += ' nearest';
          return L.divIcon({ html: '<div class="' + className + '">♻️</div>', className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
        }
        function createUserIcon() {
          return L.divIcon({ html: '<div class="user-location"></div>', className: '', iconSize: [22, 22], iconAnchor: [11, 11] });
        }
        function updateMapData(data) {
          if (!map) return;
          pointMarkers.forEach(marker => { map.removeLayer(marker); });
          pointMarkers = [];
          if (userMarker) { map.removeLayer(userMarker); }
          if (data.userLocation) {
            userMarker = L.marker([data.userLocation.latitude, data.userLocation.longitude], { icon: createUserIcon() }).addTo(map);
          }
          if (data.points && data.points.length > 0) {
            data.points.forEach((point, index) => {
              try {
                const marker = L.marker([point.latitude, point.longitude], { icon: createRecyclingIcon(point.isSelected, point.isNearest) }).addTo(map);
                marker.pointId = point.id;
                marker.on('click', function() {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClicked', pointId: point.id }));
                  }
                });
                marker.bindPopup('<div style="text-align: center; padding: 5px;"><strong>' + point.name + '</strong><br><small>' + point.address + '</small>' + (point.isNearest ? '<br><span style="color: #F88D2A; font-weight: bold;">Más cercano</span>' : '') + '</div>');
                pointMarkers.push(marker);
              } catch (error) {}
            });
          }
          let centerLat, centerLng, zoomLevel = 13;
          if (data.selectedPointId) {
            const selectedPoint = data.points?.find(p => p.id === data.selectedPointId);
            if (selectedPoint) {
              centerLat = selectedPoint.latitude;
              centerLng = selectedPoint.longitude;
              zoomLevel = 15;
            } else if (data.userLocation) {
              centerLat = data.userLocation.latitude;
              centerLng = data.userLocation.longitude;
            }
          } else if (data.userLocation) {
            centerLat = data.userLocation.latitude;
            centerLng = data.userLocation.longitude;
          }
          if (centerLat && centerLng) {
            map.setView([centerLat, centerLng], zoomLevel);
          }
        }
        window.updateMapData = updateMapData;
        window.onload = function() { initMap(); };
      </script>
    </body>
    </html>
  `;

  return (
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

      <View style={styles.mapInfo}>
        <Text style={styles.mapInfoText}>{filteredPoints.length} puntos</Text>
      </View>
    </View>
  );
};
