import { create } from 'zustand';

export interface CartItem {
  id: string; // variant or product id
  name: string;
  category?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      };
    }
    return { items: [...state.items, item] };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity <= 0 
      ? state.items.filter((i) => i.id !== id)
      : state.items.map((i) => i.id === id ? { ...i, quantity } : i)
  })),
  clearCart: () => set({ items: [] })
}));
