import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Group, Participant, Product } from "../../types";
import { useGroupManagement } from "../../hooks/useGroupManagement";
import { generateId } from "../../utils/validation";
import { colors } from "../../styles/colors";
import { formStyles } from "../../styles/formStyles";

interface GroupContentManagerProps {
  group: Group;
  onGroupUpdated: (updatedGroup: Group) => void;
  isReadOnly?: boolean;
}

export const GroupContentManager: React.FC<GroupContentManagerProps> = ({
  group,
  onGroupUpdated,
  isReadOnly = false,
}) => {
  const {
    addParticipant,
    removeParticipant,
    addProduct,
    removeProduct,
    updateProductQuantity,
    loading,
    error,
  } = useGroupManagement();

  // Estados para agregar nuevos elementos
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Funciones para participantes
  const handleAddParticipant = async () => {
    if (!newParticipantName.trim() || !newParticipantEmail.trim()) {
      Alert.alert(
        "Error",
        "Por favor completa todos los campos del participante"
      );
      return;
    }

    const newParticipant: Participant = {
      id: generateId(),
      name: newParticipantName.trim(),
      email: newParticipantEmail.trim(),
    };

    const updatedGroup = await addParticipant(group.id, newParticipant);
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
      setNewParticipantName("");
      setNewParticipantEmail("");
      setShowAddParticipant(false);
    }
  };

  const handleRemoveParticipant = async (
    participantId: string,
    participantName: string
  ) => {
    // No permitir eliminar al creador
    if (participantId === "creator") {
      Alert.alert("Error", "No puedes eliminar al creador del grupo");
      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar a ${participantName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const updatedGroup = await removeParticipant(
              group.id,
              participantId
            );
            if (updatedGroup) {
              onGroupUpdated(updatedGroup);
            }
          },
        },
      ]
    );
  };

  // Funciones para productos
  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductPrice.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos del producto");
      return;
    }

    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "El precio debe ser un número válido mayor a 0");
      return;
    }

    const newProduct: Product = {
      id: generateId(),
      name: newProductName.trim(),
      estimatedPrice: price,
      quantity: 1,
      totalPrice: price,
    };

    const updatedGroup = await addProduct(group.id, newProduct);
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
      setNewProductName("");
      setNewProductPrice("");
      setShowAddProduct(false);
    }
  };

  const handleRemoveProduct = async (
    productId: string,
    productName: string
  ) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar "${productName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const updatedGroup = await removeProduct(group.id, productId);
            if (updatedGroup) {
              onGroupUpdated(updatedGroup);
            }
          },
        },
      ]
    );
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      Alert.alert("Error", "La cantidad debe ser al menos 1");
      return;
    }

    const updatedGroup = await updateProductQuantity(
      group.id,
      productId,
      newQuantity
    );
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
    }
  };

  const renderParticipantItem = ({ item }: { item: Participant }) => (
    <View style={formStyles.participantOption}>
      <View style={formStyles.participantInfo}>
        <Text style={formStyles.participantName}>{item.name}</Text>
        <Text style={formStyles.participantEmail}>{item.email}</Text>
      </View>

      {item.id !== "creator" && !isReadOnly && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveParticipant(item.id, item.name)}
          disabled={loading}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>
            ${item.estimatedPrice.toFixed(2)} c/u
          </Text>
        </View>

        {!isReadOnly && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveProduct(item.id, item.name)}
            disabled={loading}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quantityControls}>
        {!isReadOnly ? (
          <>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={loading}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.quantityText}>Cantidad: {item.quantity}</Text>
        )}

        <Text style={styles.totalPrice}>
          Total: ${(item.estimatedPrice * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={formStyles.container}>
      {/* Sección de Participantes */}
      <View style={formStyles.section}>
        <View style={styles.sectionHeader}>
          <Text style={formStyles.sectionTitle}>
            Participantes ({group.participantsList.length})
          </Text>
          {!isReadOnly && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddParticipant(!showAddParticipant)}
            >
              <Text style={styles.addButtonText}>
                {showAddParticipant ? "✕" : "+"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={group.participantsList}
          renderItem={renderParticipantItem}
          keyExtractor={(item) => `${group.id}-participant-${item.id}`}
          scrollEnabled={false}
        />

        {showAddParticipant && !isReadOnly && (
          <View style={styles.addForm}>
            <TextInput
              style={formStyles.textInput}
              placeholder="Nombre del participante"
              value={newParticipantName}
              onChangeText={setNewParticipantName}
            />
            <TextInput
              style={[formStyles.textInput, { marginTop: 8 }]}
              placeholder="Email del participante"
              value={newParticipantEmail}
              onChangeText={setNewParticipantEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.addFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddParticipant(false);
                  setNewParticipantName("");
                  setNewParticipantEmail("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddParticipant}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Sección de Productos */}
      <View style={formStyles.section}>
        <View style={styles.sectionHeader}>
          <Text style={formStyles.sectionTitle}>
            Productos ({group.products.length})
          </Text>
          {!isReadOnly && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddProduct(!showAddProduct)}
            >
              <Text style={styles.addButtonText}>
                {showAddProduct ? "✕" : "+"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={group.products}
          renderItem={renderProductItem}
          keyExtractor={(item) => `${group.id}-product-${item.id}`}
          scrollEnabled={false}
        />

        {showAddProduct && !isReadOnly && (
          <View style={styles.addForm}>
            <TextInput
              style={formStyles.textInput}
              placeholder="Nombre del producto"
              value={newProductName}
              onChangeText={setNewProductName}
            />
            <TextInput
              style={[formStyles.textInput, { marginTop: 8 }]}
              placeholder="Precio estimado"
              value={newProductPrice}
              onChangeText={setNewProductPrice}
              keyboardType="numeric"
            />
            <View style={styles.addFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddProduct(false);
                  setNewProductName("");
                  setNewProductPrice("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddProduct}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {error && (
        <View style={formStyles.errorContainer}>
          <Text style={formStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  removeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  productCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quantityControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  quantityButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center" as const,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.primary,
    flex: 1,
    textAlign: "right" as const,
  },
  addForm: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addFormButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500" as const,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
};
