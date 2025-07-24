import { useState, useCallback } from "react";
import { detectCurrentLocation } from "../../../utils/locationUtils";

interface LocationResult {
  address: string;
  error?: string;
}

export const useLocationModal = (
  onLocationFromMaps?: (location: string) => void
) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationResult | null>(
    null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Manejar ubicaciones que vienen de Google Maps via deep link
  const handleLocationFromDeepLink = useCallback(
    (location: string) => {
      console.log("Ubicación recibida de Google Maps:", location);

      // Actualizar el estado local
      setCurrentLocation({ address: location });

      // Cerrar el modal si está abierto
      setShowLocationModal(false);

      // Llamar al callback si existe
      if (onLocationFromMaps) {
        onLocationFromMaps(location);
      }
    },
    [onLocationFromMaps]
  );

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

  const getCurrentLocation = async (): Promise<LocationResult | null> => {
    try {
      setIsLoadingLocation(true);

      const result = await detectCurrentLocation();

      if (result.success && result.address) {
        const locationResult: LocationResult = {
          address: result.address,
        };

        setCurrentLocation(locationResult);
        return locationResult;
      } else {
        // Manejar error
        const errorResult: LocationResult = {
          address: "",
          error: result.error,
        };
        setCurrentLocation(errorResult);
        return null;
      }
    } catch (error) {
      console.error("Error en useLocationModal:", error);
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Nota: openMapsForSelection fue removida ya que ahora usamos MapSelector

  return {
    // Estados
    showLocationModal,
    predefinedLocations,
    currentLocation,
    isLoadingLocation,

    // Setters
    setShowLocationModal,
    setCurrentLocation,

    // Funciones
    getCurrentLocation,
    // openMapsForSelection removida - ahora se usa MapSelector
  };
};
