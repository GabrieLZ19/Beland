import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { colors } from "../styles";
import { LocationService } from "../services/locationService";
import { PhoneMapSVG } from "./icons/PhoneMapSVG";
import { MiniMapContent } from "./MiniMapContent";

interface RecyclingMapWidgetNativeProps {
  onPress?: () => void;
}

export const RecyclingMapWidgetNative: React.FC<
  RecyclingMapWidgetNativeProps
> = ({ onPress }) => {
  const handlePress = async () => {
    try {
      // Verificar si ya tiene permisos
      const hasPermission = await LocationService.hasLocationPermission();

      if (hasPermission) {
        // Si ya tiene permisos, intentar obtener ubicación y navegar
        try {
          await LocationService.getCurrentLocation();
          onPress?.();
        } catch (locationError: any) {
          // Manejar errores específicos de ubicación
          handleLocationError(locationError);
        }
        return;
      }

      // Si no tiene permisos, solicitarlos
      const permissionGranted =
        await LocationService.requestLocationPermission();

      if (permissionGranted) {
        // Si otorgó permisos, intentar obtener ubicación y navegar
        try {
          await LocationService.getCurrentLocation();
          onPress?.();
        } catch (locationError: any) {
          handleLocationError(locationError);
        }
      } else {
        // Si no otorgó permisos, mostrar alerta
        Alert.alert(
          "Permisos de ubicación",
          "Para encontrar los puntos de reciclaje más cercanos, necesitamos acceso a tu ubicación.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Configurar",
              onPress: () => {
                Alert.alert(
                  "Por favor, habilita los permisos de ubicación en la configuración de la app."
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error al solicitar permisos de ubicación:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al acceder a la ubicación. Por favor, intenta nuevamente."
      );
    }
  };

  const handleLocationError = (error: any) => {
    const errorMessage = error.message;

    switch (errorMessage) {
      case "GPS_DISABLED":
        Alert.alert(
          "GPS Deshabilitado",
          "Para usar esta función, necesitas habilitar el GPS en tu dispositivo.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ver Mapa Sin GPS", onPress: () => onPress?.() },
          ]
        );
        break;

      case "GPS_SETTINGS_UNSATISFIED":
        Alert.alert(
          "Configuración de Ubicación",
          "Tu dispositivo necesita configurar los servicios de ubicación. ¿Quieres continuar sin GPS?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ver Mapa Sin GPS", onPress: () => onPress?.() },
          ]
        );
        break;

      case "GPS_UNAVAILABLE":
        Alert.alert(
          "GPS No Disponible",
          "No se puede acceder al GPS en este momento. ¿Quieres ver el mapa sin ubicación exacta?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ver Mapa", onPress: () => onPress?.() },
          ]
        );
        break;

      case "PERMISSION_DENIED":
        Alert.alert(
          "Permisos Denegados",
          "Se necesitan permisos de ubicación para esta función.",
          [{ text: "OK", style: "default" }]
        );
        break;

      default:
        Alert.alert(
          "Error de Ubicación",
          "Hubo un problema con la ubicación. ¿Quieres ver el mapa de todas formas?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ver Mapa", onPress: () => onPress?.() },
          ]
        );
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encuentra el punto de canje más cercano</Text>
      <Text style={styles.subtitle}>
        Localiza puntos de reciclaje cerca de ti y contribuye al medio ambiente
      </Text>

      <TouchableOpacity style={styles.mapButton} onPress={handlePress}>
        <View style={styles.phoneContainer}>
          <PhoneMapSVG width={120} height={120}>
            <MiniMapContent />
          </PhoneMapSVG>
        </View>

        <View style={styles.actionArea}>
          <Text style={styles.actionText}>
            Tocar para activar GPS y ver mapa detallado
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  phoneContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#F0F9FF",
  },
  actionArea: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
