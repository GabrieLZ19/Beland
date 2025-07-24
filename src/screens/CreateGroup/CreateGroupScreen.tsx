import React, { useState } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { WaveBottomGray } from "../../components/icons";
import { GroupService } from "../../services/groupService";
import { Participant } from "../../types";
import { useCreateGroupStore } from "../../stores/useCreateGroupStore";
import * as Haptics from "expo-haptics";

// Validación y utilidades
import {
  validateGroupForm,
  validateParticipantName,
  validateParticipantEmail,
} from "../../business/validation/groupValidation";
import {
  formatTimeInput,
  formatPersonName,
  formatEmail,
} from "../../business/textUtils";

// Hooks personalizados
import { useCreateGroupForm, useTimeModal, useLocationModal } from "./hooks";

// Componentes
import {
  CreateGroupHeader,
  BasicGroupInfo,
  ParticipantsSection,
  ProductsSection,
  TimeModal,
  LocationModal,
  CreateGroupButton,
} from "./components";

// Estilos
import { createGroupStyles } from "./styles";

export const CreateGroupScreen = ({ navigation, route }: any) => {
  // Store de Zustand
  const {
    groupName,
    description,
    location,
    deliveryTime,
    participants,
    products,
    isCreatingGroup,
    setGroupName,
    setDescription,
    setLocation,
    setDeliveryTime,
    addParticipant,
    removeParticipant,
    updateProductQuantity,
    removeProduct,
    setIsCreatingGroup,
    clearGroup,
  } = useCreateGroupStore();

  // Hooks personalizados (usando la implementación actual)
  const {
    newParticipantName,
    newParticipantEmail,
    errors,
    setNewParticipantName,
    setNewParticipantEmail,
    clearError,
    setError,
  } = useCreateGroupForm();

  const {
    showTimeModal,
    selectedHour,
    selectedMinute,
    setShowTimeModal,
    setSelectedHour,
    setSelectedMinute,
    getFormattedDeliveryTime,
  } = useTimeModal();

  const {
    showLocationModal,
    currentLocation,
    isLoadingLocation,
    setShowLocationModal,
    getCurrentLocation,
  } = useLocationModal((locationFromMaps) => {
    // Callback que se ejecuta cuando se recibe ubicación de Google Maps
    setLocation(locationFromMaps);
    if (errors.location) {
      clearError("location");
    }
  });

  // Estados locales
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  // Función para mostrar alertas
  const showCustomAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const validationErrors = validateGroupForm({
      groupName,
      location,
      deliveryTime,
      participants,
      products,
    });

    // Actualizar errors usando setError
    Object.keys(validationErrors).forEach((key) => {
      setError(
        key as any,
        validationErrors[key as keyof typeof validationErrors]!
      );
    });

    return Object.keys(validationErrors).length === 0;
  };

  // Funciones de manejo
  const handleGroupNameChange = (text: string) => {
    setGroupName(text);
    if (errors.groupName && text.trim().length >= 3) {
      clearError("groupName");
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (errors.description && text.trim().length >= 10) {
      clearError("description");
    }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (errors.location && text.trim()) {
      clearError("location");
    }
  };

  const handleTimeChange = (text: string) => {
    const formattedText = formatTimeInput(text);
    setDeliveryTime(formattedText);
    if (errors.deliveryTime && formattedText.length === 5) {
      clearError("deliveryTime");
    }
  };

  const handleParticipantNameChange = (text: string) => {
    setNewParticipantName(text);
    if (errors.newParticipantName && text.trim().length >= 2) {
      clearError("newParticipantName");
    }
  };

  const handleParticipantEmailChange = (text: string) => {
    setNewParticipantEmail(text);
    if (errors.newParticipantEmail && text.includes("@")) {
      clearError("newParticipantEmail");
    }
  };

  // Ubicación y tiempo
  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationModal(false);
    if (errors.location) {
      clearError("location");
    }
  };

  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setLocation(location.address);
      setShowLocationModal(false);
      if (errors.location) {
        clearError("location");
      }
    }
  };

  const handleTimeConfirm = () => {
    const deliveryTime = getFormattedDeliveryTime();
    setDeliveryTime(deliveryTime);
    setShowTimeModal(false);
    if (errors.deliveryTime) {
      clearError("deliveryTime");
    }
  };

  // Agregar participante
  const handleAddParticipant = () => {
    const nameError = validateParticipantName(newParticipantName);
    const existingEmails = participants
      .map((p) => p.email || "")
      .filter((email) => email);
    const emailError = validateParticipantEmail(
      newParticipantEmail,
      existingEmails
    );

    if (nameError) setError("newParticipantName", nameError);
    if (emailError) setError("newParticipantEmail", emailError);

    if (nameError || emailError) return;

    clearError("newParticipantName");
    clearError("newParticipantEmail");
    clearError("participants");

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: formatPersonName(newParticipantName),
      email: newParticipantEmail.trim() ? formatEmail(newParticipantEmail) : "",
    };
    addParticipant(newParticipant);
    setNewParticipantName("");
    setNewParticipantEmail("");
  };

  // Productos con feedback háptico
  const handleUpdateProductQuantity = (id: string, quantity: number) => {
    updateProductQuantity(id, quantity);
    if (quantity <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveProduct = (id: string) => {
    removeProduct(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  // Navegación al catálogo
  // Funciones de navegación
  const handleBackToGroups = () => {
    // Navegar a la pestaña de grupos
    navigation.navigate("Groups", { screen: "GroupsList" });
  };

  const handleNavigateToCatalog = () => {
    setIsCreatingGroup(true);
    navigation.navigate("Catalog");
  };

  // Crear grupo
  const handleCreateGroup = async () => {
    if (!validateForm()) {
      showCustomAlert(
        "Formulario incompleto",
        "Por favor completa todos los campos requeridos correctamente.",
        "error"
      );
      return;
    }

    setIsLoading(true);

    try {
      await GroupService.createGroup({
        name: groupName,
        description: description,
        location: location,
        deliveryTime: deliveryTime,
        participants: participants,
        products: products,
      });

      showCustomAlert(
        "¡Grupo Creado Exitosamente!",
        `El grupo "${groupName}" ha sido creado correctamente.`,
        "success"
      );

      setTimeout(() => {
        setGroupName("");
        setDescription("");
        setLocation("");
        setDeliveryTime("");
        clearGroup();
        setNewParticipantName("");
        setNewParticipantEmail("");
        navigation.goBack();
      }, 2000);
    } catch (error) {
      showCustomAlert(
        "Error al crear grupo",
        "Hubo un problema al crear el grupo. Por favor intenta nuevamente.",
        "error"
      );
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={createGroupStyles.container} edges={[]}>
      <ScrollView style={createGroupStyles.scrollView}>
        <View style={createGroupStyles.content}>
          {/* Header */}
          <CreateGroupHeader onBackPress={handleBackToGroups} />

          {/* Información básica del grupo */}
          <BasicGroupInfo
            groupName={groupName}
            description={description}
            location={location}
            deliveryTime={deliveryTime}
            errors={errors}
            onGroupNameChange={handleGroupNameChange}
            onDescriptionChange={handleDescriptionChange}
            onLocationPress={() => setShowLocationModal(true)}
            onTimePress={() => setShowTimeModal(true)}
          />

          {/* Participantes */}
          <ParticipantsSection
            participants={participants}
            newParticipantName={newParticipantName}
            newParticipantEmail={newParticipantEmail}
            errors={errors}
            onParticipantNameChange={handleParticipantNameChange}
            onParticipantEmailChange={handleParticipantEmailChange}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={removeParticipant}
          />

          {/* Productos */}
          <ProductsSection
            products={products}
            participants={participants}
            errors={errors}
            onUpdateProductQuantity={handleUpdateProductQuantity}
            onRemoveProduct={handleRemoveProduct}
            onNavigateToCatalog={handleNavigateToCatalog}
          />

          {/* Botón crear grupo */}
          <CreateGroupButton
            isLoading={isLoading}
            groupName={groupName}
            hasProducts={products.length > 0}
            onPress={handleCreateGroup}
          />
        </View>
      </ScrollView>

      {/* Ola de fondo */}
      <View style={createGroupStyles.waveContainer}>
        <WaveBottomGray width={Dimensions.get("window").width} height={120} />
      </View>

      {/* Alerta personalizada */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setShowAlert(false)}
        buttonText="Entendido"
      />

      {/* Modal de ubicación */}
      <LocationModal
        visible={showLocationModal}
        currentLocation={currentLocation}
        isLoadingLocation={isLoadingLocation}
        onLocationSelect={handleLocationSelect}
        onGetCurrentLocation={handleGetCurrentLocation}
        onClose={() => setShowLocationModal(false)}
      />

      {/* Modal de tiempo */}
      <TimeModal
        visible={showTimeModal}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onHourChange={setSelectedHour}
        onMinuteChange={setSelectedMinute}
        onConfirm={handleTimeConfirm}
        onClose={() => setShowTimeModal(false)}
      />
    </SafeAreaView>
  );
};
