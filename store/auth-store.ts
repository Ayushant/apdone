import { create } from 'zustand';
import { signIn, signUp, logOut, createUserProfile, auth } from '../firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useCoinsStore } from './coins-store';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber?: string;
  isGuest?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (user: User | null) => void;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Auth state listener setup
  let unsubscribeAuth: (() => void) | null = null;
  
  unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        phoneNumber: firebaseUser.phoneNumber || undefined,
      };
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
      useCoinsStore.getState().cleanup();
    }
  });

  return {
    user: null,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    
    login: (user) => {
      set({ user, isAuthenticated: true });
    },
    
    signup: async (email: string, password: string, userData: Partial<User>) => {
      try {
        const user = await signUp(email, password);
        if (user) {
          await createUserProfile(user.uid, {
            ...userData,
            coins: 0,
          });
        }
      } catch (error) {
        console.error('Signup error:', error);
        throw error;
      }
    },
    
    logout: async () => {
      try {
        const currentUser = useAuthStore.getState().user;
        
        // Clean up store subscriptions first
        useCoinsStore.getState().cleanup();
        
        // Clear AsyncStorage
        await AsyncStorage.multiRemove([
          'theme-store',
          'auth-state',
          'user-preferences',
          '@coins',
          '@profile'
        ]);

        // Handle mobile-specific logout
        if (Platform.OS !== 'web' && !currentUser?.isGuest) {
          try {
            const { GoogleSignin } = require('@react-native-google-signin/google-signin');
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
              await GoogleSignin.signOut();
            }
          } catch (err) {
            console.error('Google Sign out error:', err);
          }
        }

        // Handle Firebase logout for non-guest users
        if (!currentUser?.isGuest) {
          await logOut();
        }

        // Clean up auth listener
        if (unsubscribeAuth) {
          unsubscribeAuth();
          unsubscribeAuth = null;
        }

        // Reset all state
        set({ 
          user: null, 
          isAuthenticated: false,
          hasCompletedOnboarding: false
        });

      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    
    loginAsGuest: () => {
      const guestUser: User = {
        uid: `guest_${Date.now()}`,
        email: '',
        displayName: 'Guest Player',
        photoURL: 'https://ui-avatars.com/api/?name=Guest+Player&background=random',
        isGuest: true
      };
      set({ user: guestUser, isAuthenticated: true });
      useCoinsStore.getState().resetCoins();
    },
    
    completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  };
});
