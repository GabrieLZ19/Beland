import { useState } from "react";
import { Reward } from "../types";

export const useUserBalance = () => {
  const [userBalance, setUserBalance] = useState(470); // Balance inicial del usuario

  const canAffordReward = (reward: Reward) => {
    return userBalance >= reward.cost;
  };

  const spendCoins = (amount: number) => {
    setUserBalance((prev) => Math.max(0, prev - amount));
  };

  const addCoins = (amount: number) => {
    setUserBalance((prev) => prev + amount);
  };

  const formatBalance = (balance: number = userBalance) => {
    return balance.toLocaleString();
  };

  return {
    userBalance,
    setUserBalance,
    canAffordReward,
    spendCoins,
    addCoins,
    formatBalance,
  };
};
