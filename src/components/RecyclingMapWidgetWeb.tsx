import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { colors } from "../styles";

interface RecyclingMapWidgetWebProps {
  onPress?: () => void;
}

export const RecyclingMapWidgetWeb: React.FC<RecyclingMapWidgetWebProps> = ({
  onPress,
}) => {
  const handlePress = () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Funcionalidad de Mapa",
        "Esta funcionalidad está optimizada para dispositivos móviles. ¡Prueba la app en tu teléfono para la mejor experiencia!"
      );
    } else {
      onPress?.();
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
          {/* Versión simplificada para web */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneScreen}>
              <View style={styles.mapPreview}>
                <Text style={styles.mapEmoji}>🗺️</Text>
                <Text style={styles.mapText}>Vista previa del mapa</Text>

                {/* Puntos simulados */}
                <View style={[styles.point, { top: 20, left: 30 }]}>
                  <Text style={styles.pointEmoji}>♻️</Text>
                </View>
                <View style={[styles.point, { top: 40, right: 25 }]}>
                  <Text style={styles.pointEmoji}>♻️</Text>
                </View>
                <View style={[styles.point, { bottom: 30, left: 45 }]}>
                  <Text style={styles.pointEmoji}>♻️</Text>
                </View>

                {/* Ubicación del usuario */}
                <View style={styles.userLocation}>
                  <View style={styles.userDot} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionArea}>
          <Text style={styles.actionText}>
            {Platform.OS === "web"
              ? "Mejor experiencia en móvil"
              : "Tocar para activar GPS y ver mapa detallado"}
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
  phoneFrame: {
    width: 120,
    height: 120,
    backgroundColor: "#7DA244",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  phoneScreen: {
    width: 80,
    height: 100,
    backgroundColor: "#B1E4F9",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  mapPreview: {
    flex: 1,
    backgroundColor: "#E8F4FD",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mapEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  mapText: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: "center",
  },
  point: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  pointEmoji: {
    fontSize: 8,
  },
  userLocation: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(248, 141, 42, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F88D2A",
  },
  userDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F88D2A",
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
