import { WalletData, FRSData } from "../types";

export const useWalletData = () => {
  const walletData: WalletData = {
    balance: 470,
    estimatedValue: "$52000",
  };

  const frsData: FRSData = {
    title: "FRS",
    rating: "★★★★★",
    amount: "$ 1000",
    rate: "$ 6.500",
    details: "1.2367 ARS",
  };

  return {
    walletData,
    frsData,
  };
};
