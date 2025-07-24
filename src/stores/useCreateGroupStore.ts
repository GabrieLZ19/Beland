import { create } from "zustand";
import { Product, Participant } from "../types";

interface CreateGroupState {
  // Datos del grupo
  groupName: string;
  description: string;
  location: string;
  deliveryTime: string;
  participants: Participant[];
  products: Product[];

  // Estados auxiliares
  isCreatingGroup: boolean;

  // Acciones para el grupo
  setGroupName: (name: string) => void;
  setDescription: (description: string) => void;
  setLocation: (location: string) => void;
  setDeliveryTime: (time: string) => void;

  // Acciones para participantes
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, participant: Partial<Participant>) => void;

  // Acciones para productos
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;

  // Acciones de control
  setIsCreatingGroup: (isCreating: boolean) => void;
  clearGroup: () => void;
  resetToInitialState: () => void;
}

const initialState = {
  groupName: "",
  description: "",
  location: "",
  deliveryTime: "",
  participants: [],
  products: [],
  isCreatingGroup: false,
};

export const useCreateGroupStore = create<CreateGroupState>((set, get) => ({
  ...initialState,

  // Acciones para el grupo
  setGroupName: (name: string) => set({ groupName: name }),
  setDescription: (description: string) => set({ description }),
  setLocation: (location: string) => set({ location }),
  setDeliveryTime: (time: string) => set({ deliveryTime: time }),

  // Acciones para participantes
  addParticipant: (participant: Participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),

  removeParticipant: (id: string) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    })),

  updateParticipant: (id: string, participantUpdate: Partial<Participant>) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...participantUpdate } : p
      ),
    })),

  // Acciones para productos
  addProduct: (product: Product) =>
    set((state) => {
      // Verificar si el producto ya existe
      const existingProductIndex = state.products.findIndex(
        (p) => p.id === product.id
      );

      if (existingProductIndex >= 0) {
        // Si existe, aumentar la cantidad
        const updatedProducts = [...state.products];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity:
            updatedProducts[existingProductIndex].quantity + product.quantity,
          totalPrice:
            (updatedProducts[existingProductIndex].quantity +
              product.quantity) *
            (updatedProducts[existingProductIndex].estimatedPrice || 0),
        };
        return { products: updatedProducts };
      } else {
        // Si no existe, agregarlo
        return { products: [...state.products, product] };
      }
    }),

  removeProduct: (id: string) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  updateProductQuantity: (id: string, quantity: number) =>
    set((state) => {
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, eliminar el producto
        return {
          products: state.products.filter((p) => p.id !== id),
        };
      }

      return {
        products: state.products.map((p) =>
          p.id === id
            ? {
                ...p,
                quantity,
                totalPrice: quantity * (p.estimatedPrice || 0),
              }
            : p
        ),
      };
    }),

  // Acciones de control
  setIsCreatingGroup: (isCreating: boolean) =>
    set({ isCreatingGroup: isCreating }),

  clearGroup: () => set(initialState),

  resetToInitialState: () => set(initialState),
}));
