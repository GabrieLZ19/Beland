import * as Location from "expo-location";

export interface LocationResult {
  success: boolean;
  address?: string;
  error?: string;
}

// Función para detectar ubicación actual con GPS
export const detectCurrentLocation = async (): Promise<LocationResult> => {
  try {
    // Solicitar permisos de ubicación
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return {
        success: false,
        error:
          "La aplicación necesita acceso a la ubicación para detectar tu posición actual",
      };
    }

    // Obtener ubicación actual
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Geocodificación inversa para obtener la dirección
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (reverseGeocode && reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      const formattedAddress = `${address.street || ""} ${
        address.streetNumber || ""
      }, ${address.city || ""}, ${address.region || ""}`
        .replace(/,\s*,/g, ",")
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, "");

      return {
        success: true,
        address: formattedAddress,
      };
    } else {
      return {
        success: false,
        error: "No se pudo obtener la dirección de tu ubicación",
      };
    }
  } catch (error) {
    console.error("Error detecting location:", error);
    return {
      success: false,
      error:
        "No se pudo detectar tu ubicación actual. Verifica que el GPS esté activado.",
    };
  }
};

// Función para obtener sugerencias de ubicación (simulada - en producción usar Google Places API)
export const fetchLocationSuggestions = async (
  query: string
): Promise<string[]> => {
  if (query.length < 3) {
    return [];
  }

  try {
    // Simulación de API de Google Places
    const mockSuggestions = [
      `${query}, Buenos Aires, Argentina`,
      `${query}, CABA, Argentina`,
      `${query}, Palermo, CABA`,
      `${query}, Villa Crespo, CABA`,
      `${query}, Belgrano, CABA`,
    ].filter((suggestion) =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );

    // Simular delay de API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSuggestions);
      }, 300);
    });

    // Para usar la API real de Google Places, reemplazar con:
    /*
    const GOOGLE_PLACES_API_KEY = 'TU_API_KEY_AQUI';
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&components=country:ar`
    );
    const data = await response.json();
    
    if (data.predictions) {
      return data.predictions.map((prediction: any) => prediction.description);
    }
    return [];
    */
  } catch (error) {
    console.error("Error fetching location suggestions:", error);
    return [];
  }
};

// Nota: La función openGoogleMapsForSelection fue removida
// ya que ahora usamos MapSelector para selección automática de ubicación
