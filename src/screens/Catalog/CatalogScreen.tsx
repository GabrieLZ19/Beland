import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCreateGroupStore } from "../../stores/useCreateGroupStore";
import { ConfirmationAlert } from "../../components/ui/ConfirmationAlert";
import { BeCoinIcon } from "../../components/icons/BeCoinIcon";
import * as Haptics from "expo-haptics";

// Hooks
import {
  useCatalogFilters,
  useCatalogModals,
  useProductFiltering,
} from "./hooks";

// Components
import {
  SearchBar,
  FilterPanel,
  ProductGrid,
  DeliveryModal,
  ProductAddedModal,
} from "./components";

// Styles
import { containerStyles } from "./styles";

// Types
import { AvailableProduct } from "../../constants/products";

export const CatalogScreen = () => {
  const navigation = useNavigation();
  const { addProduct, setIsCreatingGroup, isCreatingGroup, products } =
    useCreateGroupStore();

  // Verificar si realmente hay productos en el grupo al montar el componente
  useEffect(() => {
    // Si no hay productos pero el estado dice que estamos creando grupo, resetear
    if (isCreatingGroup && products.length === 0) {
      setIsCreatingGroup(false);
    }
  }, [isCreatingGroup, products.length, setIsCreatingGroup]);

  // Limpiar el estado inconsistente cuando se enfoca la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Verificar si el estado de creación de grupo es consistente
      if (isCreatingGroup && products.length === 0) {
        console.log("Limpiando estado inconsistente de creación de grupo");
        setIsCreatingGroup(false);
      }
    }, [isCreatingGroup, products.length, setIsCreatingGroup])
  );

  // Hooks para manejo de estado
  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    resetFilters,
  } = useCatalogFilters();

  const {
    showDeliveryModal,
    showProductAddedModal,
    selectedProduct,
    openDeliveryModal,
    closeDeliveryModal,
    openProductAddedModal,
    closeProductAddedModal,
  } = useCatalogModals();

  // Estado para el alert de confirmación
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);

  const { categories, brands, filteredProducts } = useProductFiltering(
    searchText,
    filters
  );

  // Función para agregar producto
  const handleAddProduct = (product: AvailableProduct) => {
    if (isCreatingGroup) {
      // Si estamos creando un grupo, agregar directamente al store
      const newProduct = {
        id: product.id,
        name: product.name,
        quantity: 1,
        estimatedPrice: product.basePrice,
        totalPrice: product.basePrice,
        category: product.category,
        basePrice: product.basePrice,
      };
      addProduct(newProduct);

      // Feedback háptico de éxito
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Mostrar modal personalizado de confirmación
      openProductAddedModal(product);
    } else {
      // Comportamiento normal: mostrar modal de opciones
      openDeliveryModal(product);
    }
  };

  // Funciones para modales
  const handleContinueAddingProducts = () => {
    closeProductAddedModal();
  };

  const handleContinueCreatingGroup = () => {
    closeProductAddedModal();
    (navigation as any).navigate("Groups", {
      screen: "CreateGroup",
    });
  };

  const handleCreateCircularGroup = () => {
    closeDeliveryModal();

    if (selectedProduct) {
      // Marcar que estamos creando un grupo
      setIsCreatingGroup(true);

      // Agregar el producto al store
      const newProduct = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        quantity: 1,
        estimatedPrice: selectedProduct.basePrice,
        totalPrice: selectedProduct.basePrice,
        category: selectedProduct.category,
        basePrice: selectedProduct.basePrice,
      };
      addProduct(newProduct);
    }

    // Navegar a la pantalla de crear grupo
    (navigation as any).navigate("Groups", {
      screen: "CreateGroup",
    });
  };

  const handleHomeDelivery = () => {
    closeDeliveryModal();
    // Mostrar información de entrega con nuestro alert personalizado
    setShowDeliveryInfo(true);
  };

  const handleShowRoute = () => {
    setShowDeliveryInfo(false);
    setShowRouteInfo(true);
  };

  // Funciones para navegación
  const handleBackToGroup = () => {
    // Feedback háptico
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate("Groups", {
      screen: "CreateGroup",
    });
  };

  const handleCancelGroup = () => {
    // Feedback háptico
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelConfirmation(true);
  };

  const confirmCancelGroup = () => {
    setIsCreatingGroup(false);
    // También limpiar los productos del store
    useCreateGroupStore.getState().clearGroup();
    setShowCancelConfirmation(false);
    (navigation as any).goBack();
  };

  return (
    <SafeAreaView style={containerStyles.container}>
      {/* Header */}
      <View
        style={[
          containerStyles.headerContainer,
          isCreatingGroup && containerStyles.headerCreatingGroup,
        ]}
      >
        <View style={containerStyles.headerRow}>
          <View style={containerStyles.headerLeft}>
            <View style={containerStyles.headerTitles}>
              <Text
                style={[
                  containerStyles.headerTitle,
                  isCreatingGroup && { color: "#FFFFFF" },
                ]}
              >
                {isCreatingGroup ? "Agregando al grupo" : "Catálogo"}
              </Text>
              <Text
                style={[
                  containerStyles.headerSubtitle,
                  isCreatingGroup && { color: "rgba(255, 255, 255, 0.9)" },
                ]}
              >
                {isCreatingGroup
                  ? `${products.length} producto${
                      products.length !== 1 ? "s" : ""
                    } agregado${products.length !== 1 ? "s" : ""}`
                  : "Productos circulares disponibles"}
              </Text>
            </View>
          </View>
          {!isCreatingGroup ? (
            <View style={containerStyles.coinsContainer}>
              <BeCoinIcon width={20} height={20} />
              <Text style={containerStyles.coinsText}>470</Text>
            </View>
          ) : (
            <View style={containerStyles.groupActions}>
              <TouchableOpacity
                style={containerStyles.groupActionButton}
                onPress={handleBackToGroup}
              >
                <Text style={containerStyles.groupActionIcon}>👥</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  containerStyles.groupActionButton,
                  containerStyles.cancelButton,
                ]}
                onPress={handleCancelGroup}
              >
                <Text style={containerStyles.groupActionIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={containerStyles.container}
        contentContainerStyle={containerStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar searchQuery={searchText} onSearchChange={setSearchText} />

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            brands={brands}
          />
        )}

        {/* Toggle Filters Button */}
        <TouchableOpacity
          style={{ marginBottom: 16, alignSelf: "flex-end" }}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ color: "#FF6B35", fontWeight: "600" }}>
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
        </TouchableOpacity>

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          onAddToCart={handleAddProduct}
        />
      </ScrollView>

      {/* Delivery Modal */}
      <DeliveryModal
        visible={showDeliveryModal}
        onClose={closeDeliveryModal}
        onSelectPickup={handleCreateCircularGroup}
        onSelectDelivery={handleHomeDelivery}
      />

      {/* Product Added Modal */}
      <ProductAddedModal
        visible={showProductAddedModal}
        onContinueAdding={handleContinueAddingProducts}
        onContinueGroup={handleContinueCreatingGroup}
      />

      {/* Alerta de confirmación para cancelar grupo */}
      <ConfirmationAlert
        visible={showCancelConfirmation}
        title="¿Cancelar creación del grupo?"
        message="Se perderán todos los productos agregados al carrito. Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="Continuar comprando"
        type="danger"
        icon="🛒"
        onConfirm={confirmCancelGroup}
        onCancel={() => setShowCancelConfirmation(false)}
      />

      {/* Alerta de información de entrega */}
      <ConfirmationAlert
        visible={showDeliveryInfo}
        title="Entrega a domicilio"
        message={`El producto "${selectedProduct?.name}" será entregado en tu domicilio.\n\nRuta: Desde el local hasta tu casa.\nTiempo estimado: 30-45 minutos.`}
        confirmText="Ver ruta"
        cancelText="Entendido"
        type="info"
        icon="🚚"
        onConfirm={handleShowRoute}
        onCancel={() => setShowDeliveryInfo(false)}
      />

      {/* Alerta de información de ruta */}
      <ConfirmationAlert
        visible={showRouteInfo}
        title="Funcionalidad en desarrollo"
        message="Aquí se mostraría el mapa interactivo con la ruta de entrega en tiempo real."
        confirmText="Entendido"
        cancelText="Volver"
        type="info"
        icon="🗺️"
        onConfirm={() => setShowRouteInfo(false)}
        onCancel={() => setShowRouteInfo(false)}
      />
    </SafeAreaView>
  );
};
