import React from "react";
import { View, ScrollView, Alert, Text } from "react-native";
import { Card } from "../../components/ui/Card";
import { colors } from "../../styles/colors";
import { Reward } from "./types";

// Hooks
import {
  useRewardCategories,
  useRewardsFiltering,
  useUserBalance,
} from "./hooks";

// Components
import { RewardsHeader, CategoryFilter, RewardsGrid } from "./components";

// Styles
import { containerStyles } from "./styles";

export const RewardsScreen = () => {
  // Hooks personalizados
  const { selectedCategory, selectCategory } = useRewardCategories();
  const { filteredRewards } = useRewardsFiltering(selectedCategory);
  const { userBalance, canAffordReward, spendCoins, formatBalance } =
    useUserBalance();

  // Función para manejar el canje de recompensas
  const handleClaimReward = (reward: Reward) => {
    if (!reward.available) {
      Alert.alert(
        "Recompensa agotada",
        "Esta recompensa ya no está disponible."
      );
      return;
    }

    if (!canAffordReward(reward)) {
      Alert.alert(
        "Saldo insuficiente",
        `Necesitas ${
          reward.cost
        } BeCoins para canjear esta recompensa. Tu saldo actual es ${formatBalance(
          userBalance
        )} BeCoins.`
      );
      return;
    }

    Alert.alert(
      "Confirmar canje",
      `¿Deseas canjear "${reward.title}" por ${reward.cost} BeCoins?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => {
            spendCoins(reward.cost);
            Alert.alert(
              "¡Canje exitoso!",
              `Has canjeado "${
                reward.title
              }". Tu nuevo saldo es ${formatBalance(
                userBalance - reward.cost
              )} BeCoins.`
            );
          },
        },
      ]
    );
  };

  const getSectionTitle = () => {
    return selectedCategory === "Todos"
      ? "Todas las recompensas"
      : selectedCategory;
  };

  return (
    <View style={containerStyles.container}>
      {/* Header fijo */}
      <RewardsHeader userBalance={userBalance} formatBalance={formatBalance} />

      <ScrollView
        style={containerStyles.scrollView}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {/* Filtro de categorías */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={selectCategory}
        />

        {/* Banner destacado */}
        <View style={containerStyles.featuredSection}>
          <Card
            style={containerStyles.featuredCard}
            backgroundColor={colors.belandOrange + "25"}
          >
            <View style={containerStyles.featuredContent}>
              <View style={containerStyles.featuredText}>
                <Text style={containerStyles.featuredTitle}>
                  ¡Ofertas especiales!
                </Text>
                <Text style={containerStyles.featuredSubtitle}>
                  Descuentos exclusivos por reciclar
                </Text>
              </View>
              <View style={containerStyles.featuredBadge}>
                <Text style={containerStyles.featuredBadgeText}>NUEVO</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Grilla de recompensas */}
        <RewardsGrid
          rewards={filteredRewards}
          canAffordReward={canAffordReward}
          onClaimReward={handleClaimReward}
          sectionTitle={getSectionTitle()}
        />

        <View style={containerStyles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};
