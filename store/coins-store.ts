import { create } from 'zustand';
import { doc, runTransaction, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseConfig';

interface UserData {
  coins?: number;
  achievements?: string[];
  updatedAt?: Date;
}

interface CoinsState {
  coins: number;
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  initializeCoins: (userId: string) => void;
  setCoins: (coins: number) => void;
  addCoins: (amount: number) => Promise<void>;
  removeCoins: (amount: number) => Promise<void>;
  resetCoins: () => Promise<void>;
  cleanup: () => void;
}

export const useCoinsStore = create<CoinsState>((set, get) => ({
  coins: 0,
  isLoading: false,
  error: null,
  unsubscribe: null,

  setCoins: (coins: number) => {
    set({ coins, error: null });
  },

  initializeCoins: (userId: string) => {
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    // Set up real-time listener for coin updates
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        set({ coins: data.coins || 0, error: null });
      }
    }, (error) => {
      console.error('Coins sync error:', error);
      set({ error: error.message });
    });

    set({ unsubscribe });
  },

  addCoins: async (amount: number) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      if (amount <= 0) throw new Error('Amount must be positive');

      set({ isLoading: true, error: null });
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document does not exist');
        }

        const currentCoins = userDoc.data().coins || 0;
        
        // Update in Firestore - local state will update via onSnapshot
        transaction.update(userRef, {
          coins: currentCoins + amount,
          updatedAt: new Date()
        });
      });

    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeCoins: async (amount: number) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      if (amount <= 0) throw new Error('Amount must be positive');

      set({ isLoading: true, error: null });
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document does not exist');
        }

        const currentCoins = userDoc.data().coins || 0;
        if (currentCoins < amount) {
          throw new Error('Insufficient coins');
        }

        // Update in Firestore - local state will update via onSnapshot
        transaction.update(userRef, {
          coins: currentCoins - amount,
          updatedAt: new Date()
        });
      });

    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetCoins: async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      set({ isLoading: true, error: null });
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        // Update in Firestore - local state will update via onSnapshot
        transaction.update(userRef, {
          coins: 0,
          updatedAt: new Date()
        });
      });

    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  cleanup: () => {
    // Clean up Firestore subscription
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }
    
    // Reset state to initial values
    set({ 
      unsubscribe: null, 
      coins: 0, 
      error: null,
      isLoading: false
    });

    // Remove any persisted coins data
    AsyncStorage.removeItem('@coins')
      .catch((err: Error) => console.error('Failed to remove coins data:', err));
  },
}));
