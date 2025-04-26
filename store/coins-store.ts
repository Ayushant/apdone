import { create } from 'zustand';

interface CoinsState {
  coins: number;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  resetCoins: () => void;
}

export const useCoinsStore = create<CoinsState>((set) => ({
  coins: 0,
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  removeCoins: (amount) => set((state) => ({ coins: Math.max(0, state.coins - amount) })),
  resetCoins: () => set({ coins: 0 }),
}));
