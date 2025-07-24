/**
 * Lógica de negocio para cálculos de costos de grupos
 */

import { Product, Participant } from "../types";

/**
 * Calcula el costo total estimado de todos los productos
 */
export const getTotalEstimatedCost = (products: Product[]): number => {
  return products.reduce(
    (total, product) => total + product.estimatedPrice * product.quantity,
    0
  );
};

/**
 * Calcula el costo por persona incluyendo al creador del grupo
 */
export const getCostPerPerson = (
  products: Product[],
  participants: Participant[]
): number => {
  const totalParticipants = participants.length + 1; // +1 for the creator
  const totalCost = getTotalEstimatedCost(products);

  return totalParticipants > 0 ? totalCost / totalParticipants : 0;
};

/**
 * Convierte el costo a BeCoins (1 peso = 100 BeCoins aprox)
 */
export const convertToBeCoins = (amount: number): number => {
  return Math.round(amount / 100);
};

/**
 * Formatea un monto en pesos argentinos
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

/**
 * Formatea BeCoins
 */
export const formatBeCoins = (amount: number): string => {
  return `${convertToBeCoins(amount)} BeCoins`;
};
