import { create } from 'zustand';
import { Product } from '../types';

interface UserStore {
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  recentlyViewed: [],
  addRecentlyViewed: (product) => set((state) => {
    // Bring product to the front of the array and remove duplicates. Keep max 5.
    const filtered = state.recentlyViewed.filter(p => p.id !== product.id);
    return { recentlyViewed: [product, ...filtered].slice(0, 5) };
  })
}));
