import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MapSelector } from "../../../components/MapSelector";
import { modalStyles } from "../styles";

interface LocationModalProps {
  visible: boolean;
  currentLocation: any;
  isLoadingLocation: boolean;
  onLocationSelect: (location: string) => void;
  onGetCurrentLocation: () => void;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  currentLocation,
  isLoadingLocation,
  onLocationSelect,
  onGetCurrentLocation,
  onClose,
}) => {
  const [showMapSelector, setShowMapSelector] = useState(false);

  const openMapSelector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMapSelector(true);
  };

  const handleMapLocationSelect = (
    location: string,
    coordinates?: { lat: number; lng: number }
  ) => {
    console.log("Ubicación seleccionada del mapa:", location, coordinates);
    onLocationSelect(location);
    setShowMapSelector(false);
    onClose();
  };

  const handleLocationSelect = (location: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLocationSelect(location);
    onClose();
  };

  const handleCurrentLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGetCurrentLocation();
  };

  const predefinedLocations = [
    "Palermo, CABA",
    "Villa Crespo, CABA",
    "Belgrano, CABA",
    "Caballito, CABA",
    "San Telmo, CABA",
    "Puerto Madero, CABA",
    "Recoleta, CABA",
    "Barracas, CABA",
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>📍 Seleccionar Ubicación</Text>
            <TouchableOpacity
              style={modalStyles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={modalStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.locationList}>
            {/* Botón de ubicación actual */}
            <TouchableOpacity
              style={[
                modalStyles.mapButton,
                currentLocation && modalStyles.mapButtonSelected,
              ]}
              onPress={handleCurrentLocation}
              activeOpacity={0.8}
              disabled={isLoadingLocation}
            >
              <Text style={modalStyles.mapButtonIcon}>
                {isLoadingLocation ? "⏳" : "📍"}
              </Text>
              <View style={modalStyles.mapButtonContent}>
                <Text style={modalStyles.mapButtonText}>
                  {isLoadingLocation
                    ? "Obteniendo ubicación..."
                    : currentLocation
                    ? "Usar ubicación actual"
                    : "Obtener mi ubicación"}
                </Text>
                <Text style={modalStyles.mapButtonSubtext}>
                  {currentLocation
                    ? currentLocation.address
                    : "GPS y geolocalización"}
                </Text>
              </View>
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={modalStyles.mapButtonArrow}>
                  {currentLocation ? "✓" : "→"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Botón del Selector de Mapa Integrado */}
            <TouchableOpacity
              style={modalStyles.mapButton}
              onPress={openMapSelector}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.mapButtonIcon}>🎯</Text>
              <View style={modalStyles.mapButtonContent}>
                <Text style={modalStyles.mapButtonText}>
                  Seleccionar en Mapa
                </Text>
                <Text style={modalStyles.mapButtonSubtext}>
                  Mapa integrado - Selección automática
                </Text>
              </View>
              <Text style={modalStyles.mapButtonArrow}>→</Text>
            </TouchableOpacity>

            <View style={modalStyles.locationDivider}>
              <Text style={modalStyles.locationDividerText}>
                Ubicaciones sugeridas
              </Text>
            </View>

            {predefinedLocations.map((loc, index) => (
              <TouchableOpacity
                key={index}
                style={modalStyles.locationOption}
                onPress={() => handleLocationSelect(loc)}
                activeOpacity={0.8}
              >
                <Text style={modalStyles.locationOptionIcon}>📍</Text>
                <Text style={modalStyles.locationOptionText}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Selector de Mapa Integrado */}
      <MapSelector
        visible={showMapSelector}
        onLocationSelect={handleMapLocationSelect}
        onClose={() => setShowMapSelector(false)}
      />
    </Modal>
  );
};
