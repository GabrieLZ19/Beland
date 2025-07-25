import React from "react";
import { View, Text } from "react-native";

interface PhoneMapSVGWebProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

export const PhoneMapSVGWeb: React.FC<PhoneMapSVGWebProps> = ({
  width = 120,
  height = 120,
  children,
}) => {
  const phoneWidth = width;
  const phoneHeight = height;

  // Calcular dimensiones proporcionales de la pantalla
  const screenPadding = phoneWidth * 0.2; // 20% de padding
  const screenWidth = phoneWidth - screenPadding;
  const screenHeight = phoneHeight * 0.6; // 60% de la altura

  return (
    <View
      style={{
        width: phoneWidth,
        height: phoneHeight,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Base circular verde */}
      <View
        style={{
          position: "absolute",
          width: phoneWidth,
          height: phoneHeight,
          borderRadius: phoneWidth / 2,
          backgroundColor: "#7DA244",
        }}
      />

      {/* Marco del teléfono */}
      <View
        style={{
          width: phoneWidth * 0.7,
          height: phoneHeight * 0.85,
          backgroundColor: "#DF8C37",
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Pantalla del teléfono */}
        <View
          style={{
            width: screenWidth,
            height: screenHeight,
            backgroundColor: "#B1E4F9",
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Contenido del mapa */}
          {children}
        </View>

        {/* Botón home */}
        <View
          style={{
            position: "absolute",
            bottom: 8,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#DFEAEF",
          }}
        />
      </View>

      {/* Medalla dorada */}
      <View
        style={{
          position: "absolute",
          bottom: 5,
          right: 15,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#FAB400",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 12, color: "#FFFFFF" }}>🏆</Text>
      </View>

      {/* Botones laterales */}
      <View
        style={{
          position: "absolute",
          right: -3,
          top: phoneHeight * 0.3,
          width: 6,
          height: 15,
          backgroundColor: "#3D4951",
          borderRadius: 3,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: -3,
          top: phoneHeight * 0.45,
          width: 6,
          height: 25,
          backgroundColor: "#3D4951",
          borderRadius: 3,
        }}
      />
    </View>
  );
};
