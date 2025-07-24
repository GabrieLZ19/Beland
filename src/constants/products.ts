/**
 * Constantes para productos circulares disponibles
 */

import { convertPesoToUSD } from "./currency";

export interface AvailableProduct {
  id: string;
  name: string;
  basePrice: number;
  category: string;
}

export const AVAILABLE_PRODUCTS: AvailableProduct[] = [
  {
    id: "1",
    name: "Empanadas (docena)",
    basePrice: convertPesoToUSD(4800), // ~$13.71
    category: "Comida",
  },
  {
    id: "2",
    name: "Pizza Grande",
    basePrice: convertPesoToUSD(6500), // ~$18.57
    category: "Comida",
  },
  {
    id: "3",
    name: "Gaseosas (6 unidades)",
    basePrice: convertPesoToUSD(3600), // ~$10.29
    category: "Bebidas",
  },
  {
    id: "4",
    name: "Cerveza Artesanal (6 unidades)",
    basePrice: convertPesoToUSD(7200), // ~$20.57
    category: "Bebidas",
  },
  {
    id: "5",
    name: "Picada Grande",
    basePrice: convertPesoToUSD(5500), // ~$15.71
    category: "Comida",
  },
  {
    id: "6",
    name: "Vino (2 botellas)",
    basePrice: convertPesoToUSD(3250), // ~$9.29
    category: "Bebidas",
  },
  {
    id: "7",
    name: "Postres Variados",
    basePrice: convertPesoToUSD(4200), // ~$12.00
    category: "Dulces",
  },
  {
    id: "8",
    name: "Agua Saborizada (12 unidades)",
    basePrice: convertPesoToUSD(2800), // ~$8.00
    category: "Bebidas",
  },
];

export const PRODUCT_CATEGORIES = {
  COMIDA: "Comida",
  BEBIDAS: "Bebidas",
  DULCES: "Dulces",
} as const;
