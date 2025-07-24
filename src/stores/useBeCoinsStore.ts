import { create } from "zustand";
import { persist } from "zustand/middleware";

// Constantes para BeCoins
export const BECOIN_VALUE_USD = 0.05; // 5 centavos de dólar por BeCoin
export const INITIAL_BECOIN_BALANCE = 300; // Balance inicial para usuarios

interface BeCoinsState {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: BeCoinsTransaction[];
}

export interface BeCoinsTransaction {
  id: string;
  type: "earned" | "spent" | "refund";
  amount: number;
  description: string;
  category: "reward" | "catalog" | "group_payment" | "initial" | "bonus";
  timestamp: Date;
  relatedId?: string; // ID del grupo, producto o premio relacionado
}

interface BeCoinsActions {
  // Acciones de balance
  spendBeCoins: (
    amount: number,
    description: string,
    category: BeCoinsTransaction["category"],
    relatedId?: string
  ) => boolean;
  earnBeCoins: (
    amount: number,
    description: string,
    category: BeCoinsTransaction["category"],
    relatedId?: string
  ) => void;
  refundBeCoins: (
    amount: number,
    description: string,
    relatedId?: string
  ) => void;

  // Utilidades
  hasEnoughBeCoins: (amount: number) => boolean;
  getBeCoinsInUSD: (amount?: number) => number;
  getUSDInBeCoins: (usdAmount: number) => number;
  getTransactionHistory: () => BeCoinsTransaction[];

  // Reset (para testing)
  resetBalance: () => void;

  // Acciones específicas
  payWithBeCoins: (
    usdAmount: number,
    description: string,
    relatedId?: string
  ) => boolean;
  redeemReward: (
    beCoinsCost: number,
    rewardName: string,
    rewardId: string
  ) => boolean;
  purchaseWithBeCoins: (
    beCoinsCost: number,
    productName: string,
    productId: string
  ) => boolean;
}

type BeCoinsStore = BeCoinsState & BeCoinsActions;

const generateTransactionId = () => {
  return `becoin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useBeCoinsStore = create<BeCoinsStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      balance: INITIAL_BECOIN_BALANCE,
      totalEarned: INITIAL_BECOIN_BALANCE,
      totalSpent: 0,
      transactions: [
        {
          id: generateTransactionId(),
          type: "earned",
          amount: INITIAL_BECOIN_BALANCE,
          description: "Balance inicial de BeCoins",
          category: "initial",
          timestamp: new Date(),
        },
      ],

      // Acciones principales
      spendBeCoins: (
        amount: number,
        description: string,
        category: BeCoinsTransaction["category"],
        relatedId?: string
      ) => {
        const state = get();

        if (amount <= 0) {
          console.warn("La cantidad a gastar debe ser mayor a 0");
          return false;
        }

        if (state.balance < amount) {
          console.warn(
            `Balance insuficiente. Balance actual: ${state.balance}, Intentando gastar: ${amount}`
          );
          return false;
        }

        const transaction: BeCoinsTransaction = {
          id: generateTransactionId(),
          type: "spent",
          amount,
          description,
          category,
          timestamp: new Date(),
          relatedId,
        };

        set((state) => ({
          balance: state.balance - amount,
          totalSpent: state.totalSpent + amount,
          transactions: [transaction, ...state.transactions],
        }));

        return true;
      },

      earnBeCoins: (
        amount: number,
        description: string,
        category: BeCoinsTransaction["category"],
        relatedId?: string
      ) => {
        if (amount <= 0) {
          console.warn("La cantidad a ganar debe ser mayor a 0");
          return;
        }

        const transaction: BeCoinsTransaction = {
          id: generateTransactionId(),
          type: "earned",
          amount,
          description,
          category,
          timestamp: new Date(),
          relatedId,
        };

        set((state) => ({
          balance: state.balance + amount,
          totalEarned: state.totalEarned + amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      refundBeCoins: (
        amount: number,
        description: string,
        relatedId?: string
      ) => {
        if (amount <= 0) {
          console.warn("La cantidad a reembolsar debe ser mayor a 0");
          return;
        }

        const transaction: BeCoinsTransaction = {
          id: generateTransactionId(),
          type: "refund",
          amount,
          description,
          category: "group_payment",
          timestamp: new Date(),
          relatedId,
        };

        set((state) => ({
          balance: state.balance + amount,
          totalSpent: Math.max(0, state.totalSpent - amount),
          transactions: [transaction, ...state.transactions],
        }));
      },

      // Utilidades
      hasEnoughBeCoins: (amount: number) => {
        return get().balance >= amount;
      },

      getBeCoinsInUSD: (amount?: number) => {
        const beCoins = amount ?? get().balance;
        return beCoins * BECOIN_VALUE_USD;
      },

      getUSDInBeCoins: (usdAmount: number) => {
        return Math.ceil(usdAmount / BECOIN_VALUE_USD);
      },

      getTransactionHistory: () => {
        return get().transactions;
      },

      resetBalance: () => {
        set({
          balance: INITIAL_BECOIN_BALANCE,
          totalEarned: INITIAL_BECOIN_BALANCE,
          totalSpent: 0,
          transactions: [
            {
              id: generateTransactionId(),
              type: "earned",
              amount: INITIAL_BECOIN_BALANCE,
              description: "Balance reiniciado",
              category: "initial",
              timestamp: new Date(),
            },
          ],
        });
      },

      // Acciones específicas
      payWithBeCoins: (
        usdAmount: number,
        description: string,
        relatedId?: string
      ) => {
        const beCoinsNeeded = get().getUSDInBeCoins(usdAmount);
        return get().spendBeCoins(
          beCoinsNeeded,
          `${description} (${usdAmount.toFixed(2)} USD)`,
          "group_payment",
          relatedId
        );
      },

      redeemReward: (
        beCoinsCost: number,
        rewardName: string,
        rewardId: string
      ) => {
        return get().spendBeCoins(
          beCoinsCost,
          `Canje de premio: ${rewardName}`,
          "reward",
          rewardId
        );
      },

      purchaseWithBeCoins: (
        beCoinsCost: number,
        productName: string,
        productId: string
      ) => {
        return get().spendBeCoins(
          beCoinsCost,
          `Compra con BeCoins: ${productName}`,
          "catalog",
          productId
        );
      },
    }),
    {
      name: "becoins-storage",
      version: 1,
    }
  )
);
