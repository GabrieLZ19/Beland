import React, { useRef, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackNavigator } from "./src/components/layout/RootStackNavigator";
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { useSystemBars } from "./src/hooks/useImmersiveMode";
import { colors } from "./src/styles/colors";

export default function App() {
  // Hook mejorado que maneja edge-to-edge automáticamente
  useSystemBars();

  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(
    undefined
  );

  const handleQRPress = () => {
    navigationRef.current?.navigate("QR");
  };

  const onNavigationStateChange = (state: NavigationState | undefined) => {
    if (state) {
      // Obtener la ruta actual del stack principal
      const currentRouteName = state.routes[state.index]?.name;
      setCurrentRoute(currentRouteName);
    }
  };

  // Solo mostrar el botón QR si no estamos en la pantalla QR
  const shouldShowQRButton = currentRoute !== "QR";

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar style="light" />
        <NavigationContainer
          ref={navigationRef}
          onStateChange={onNavigationStateChange}
        >
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <RootStackNavigator />
            {shouldShowQRButton && <FloatingQRButton onPress={handleQRPress} />}
          </View>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
