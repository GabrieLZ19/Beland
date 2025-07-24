import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { GroupsStackParamList } from "../types/navigation";
import { Group } from "../types";
import { useGroups } from "../hooks/useGroups";
import { GroupContentManager } from "../components/forms/GroupContentManager";
import { PaymentModeManager } from "../components/forms/PaymentModeManager";
import { colors } from "../styles/colors";
import { commonStyles } from "../styles/commonStyles";
import { CURRENT_USER_ID } from "../constants/user";

type GroupManagementScreenProps = StackScreenProps<
  GroupsStackParamList,
  "GroupManagement"
>;

type TabType = "content" | "payment";

export const GroupManagementScreen: React.FC<GroupManagementScreenProps> = ({
  route,
  navigation,
}) => {
  const { groupId } = route.params;
  const { getGroupById, refreshKey } = useGroups();
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("content");

  // Determinar si el usuario actual es el administrador del grupo
  const isGroupAdmin = currentGroup?.createdBy === CURRENT_USER_ID;

  useEffect(() => {
    const group = getGroupById(groupId);
    if (group) {
      setCurrentGroup(group);
    } else {
      Alert.alert("Error", "Grupo no encontrado", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  }, [groupId, getGroupById, navigation, refreshKey]); // Agregar refreshKey como dependencia

  const handleGroupUpdated = (updatedGroup: Group) => {
    setCurrentGroup(updatedGroup);
    // También actualizar los datos desde el storage para asegurar consistencia
    setTimeout(() => {
      const freshGroup = getGroupById(groupId);
      if (freshGroup) {
        setCurrentGroup(freshGroup);
      }
    }, 100);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <Text style={styles.groupName}>{currentGroup?.name}</Text>
        <Text style={styles.groupLocation}>{currentGroup?.location}</Text>
        <Text style={styles.groupDelivery}>
          🕐 {currentGroup?.deliveryTime}
        </Text>
      </View>

      <View style={styles.groupStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {currentGroup?.totalParticipants}
          </Text>
          <Text style={styles.statLabel}>Participantes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${currentGroup?.totalAmount.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${currentGroup?.myConsumption.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Tu parte</Text>
        </View>
      </View>
    </View>
  );

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "content" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("content")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "content" && styles.activeTabButtonText,
          ]}
        >
          Contenido
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "payment" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("payment")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "payment" && styles.activeTabButtonText,
          ]}
        >
          Pagos
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    if (!currentGroup) return null;

    switch (activeTab) {
      case "content":
        return (
          <GroupContentManager
            group={currentGroup}
            onGroupUpdated={handleGroupUpdated}
            isReadOnly={!isGroupAdmin}
          />
        );
      case "payment":
        return (
          <PaymentModeManager
            group={currentGroup}
            onGroupUpdated={handleGroupUpdated}
            isReadOnly={!isGroupAdmin}
          />
        );
      default:
        return null;
    }
  };

  if (!currentGroup) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando grupo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderTabButtons()}
        <View style={styles.tabContent}>{renderTabContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    alignSelf: "flex-start" as const,
    marginBottom: 16,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500" as const,
  },
  headerInfo: {
    marginBottom: 20,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "white",
    marginBottom: 4,
  },
  groupLocation: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  groupDelivery: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  groupStats: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
  },
  statItem: {
    alignItems: "center" as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "white",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  tabContainer: {
    flexDirection: "row" as const,
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center" as const,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  disabledTabButton: {
    backgroundColor: "#F5F5F5",
    opacity: 0.6,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.textSecondary,
  },
  activeTabButtonText: {
    color: "white",
    fontWeight: "600" as const,
  },
  disabledTabButtonText: {
    color: "#999999",
    fontWeight: "400" as const,
  },
  tabContent: {
    flex: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
};
