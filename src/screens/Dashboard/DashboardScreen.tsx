import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/layout/AppHeader";
import { RecyclingCard, RewardsCard, ActivitySection } from "./components";
import { useDashboardNavigation, useDashboardData } from "./hooks";
import { containerStyles } from "./styles";

export const DashboardScreen = () => {
  const { handleMenuPress, handleViewHistory, handleCoinsPress } =
    useDashboardNavigation();
  const { userStats, activities } = useDashboardData();

  return (
    <SafeAreaView style={containerStyles.container} edges={["bottom"]}>
      <ScrollView style={containerStyles.scrollView}>
        {/* Header */}
        <AppHeader
          userName={userStats.userName}
          coinsAmount={userStats.coinsAmount}
          onMenuPress={handleMenuPress}
          onCoinsPress={handleCoinsPress}
        />

        {/* Contenido principal */}
        <View style={containerStyles.content}>
          {/* Tarjeta de Reciclaje */}
          <RecyclingCard bottlesRecycled={userStats.bottlesRecycled} />

          {/* Recompensas */}
          <RewardsCard />

          {/* Última actividad */}
          <ActivitySection
            activities={activities}
            onViewHistory={handleViewHistory}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
