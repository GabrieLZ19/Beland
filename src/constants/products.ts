/**
 * Constantes para productos circulares disponibles
 */

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
    basePrice: 4800,
    category: "Comida",
  },
  {
    id: "2",
    name: "Pizza Grande",
    basePrice: 6500,
    category: "Comida",
  },
  {
    id: "3",
    name: "Gaseosas (6 unidades)",
    basePrice: 3600,
    category: "Bebidas",
  },
  {
    id: "4",
    name: "Cerveza Artesanal (6 unidades)",
    basePrice: 7200,
    category: "Bebidas",
  },
  {
    id: "5",
    name: "Picada Grande",
    basePrice: 5500,
    category: "Comida",
  },
  {
    id: "6",
    name: "Vino (2 botellas)",
    basePrice: 3250,
    category: "Bebidas",
  },
  {
    id: "7",
    name: "Postres Variados",
    basePrice: 4200,
    category: "Dulces",
  },
  {
    id: "8",
    name: "Agua Saborizada (12 unidades)",
    basePrice: 2800,
    category: "Bebidas",
  },
];

export const PRODUCT_CATEGORIES = {
  COMIDA: "Comida",
  BEBIDAS: "Bebidas",
  DULCES: "Dulces",
} as const;
