import React from "react";
import { View, Text } from "react-native";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { headerStyles } from "../styles";

interface RewardsHeaderProps {
  userBalance: number;
  formatBalance: (balance: number) => string;
}

export const RewardsHeader: React.FC<RewardsHeaderProps> = ({
  userBalance,
  formatBalance,
}) => {
  return (
    <View style={headerStyles.header}>
      <View style={headerStyles.headerTextContainer}>
        <Text style={headerStyles.headerTitle}>Premios</Text>
        <Text style={headerStyles.headerSubtitle}>
          Canjea tus BeCoins por increíbles recompensas
        </Text>
      </View>
      <View style={headerStyles.coinsDisplay}>
        <BeCoinIcon width={20} height={20} />
        <Text style={headerStyles.coinsText}>{formatBalance(userBalance)}</Text>
      </View>
    </View>
  );
};
