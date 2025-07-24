import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WaveBottomGray } from "../../components/icons";
import {
  WalletHeader,
  WalletBalanceCard,
  WalletActions,
  FRSCard,
} from "./components";
import { useWalletData, useWalletActions } from "./hooks";
import { containerStyles } from "./styles";

export const WalletScreen = () => {
  const { walletData, frsData } = useWalletData();
  const { walletActions } = useWalletActions();

  return (
    <SafeAreaView style={containerStyles.container} edges={["bottom"]}>
      <ScrollView style={containerStyles.scrollView}>
        {/* Contenido principal */}
        <View style={containerStyles.content}>
          {/* Título Billetera */}
          <WalletHeader />

          {/* Tarjeta de Saldo */}
          <WalletBalanceCard walletData={walletData} />

          {/* Acciones de Billetera */}
          <WalletActions actions={walletActions} />

          {/* Sección FRS */}
          <FRSCard frsData={frsData} />
        </View>
      </ScrollView>

      {/* Ola de fondo gris */}
      <View style={containerStyles.waveContainer}>
        <WaveBottomGray width={Dimensions.get("window").width} height={120} />
      </View>
    </SafeAreaView>
  );
};
