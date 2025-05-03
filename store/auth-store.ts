import { create } from 'zustand';
import { signIn, signUp, logOut, createUserProfile, auth, getAuthToken } from '../firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useCoinsStore } from './coins-store';

interface User {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  phoneNumber?: string;
  isGuest?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isInitialized: boolean;
  token: string | null;
  login: (user: User | null) => void;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
  completeOnboarding: () => void;
  refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let unsubscribeAuth: (() => void) | null = null;

  const initializeAuth = async () => {
    try {
      // Try to restore token
      const storedToken = await AsyncStorage.getItem('@auth_token');
      if (storedToken) {
        set({ token: storedToken });
      }

      // Set up auth state listener
      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const token = await getAuthToken();
            if (token) {
              await AsyncStorage.setItem('@auth_token', token);
            }

            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              phoneNumber: firebaseUser.phoneNumber || undefined,
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              token, 
              isInitialized: true 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              token: null,
              isInitialized: true 
            });
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            token: null,
            isInitialized: true,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isInitialized: true });
    }
  };

  // Initialize auth state
  initializeAuth();

  return {
    user: null,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    isInitialized: false,
    token: null,
    
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
        const currentUser = get().user;
        if (!currentUser) return;
        
        const logoutSuccess = await logOut();
        if (!logoutSuccess) return;
        
        // Clean up subscriptions and state
        useCoinsStore.getState().cleanup();
        
        await AsyncStorage.multiRemove([
          '@auth_token',
          'theme-store',
          'auth-state',
          'user-preferences',
          '@coins',
          '@profile'
        ]);

        if (unsubscribeAuth) {
          unsubscribeAuth();
          unsubscribeAuth = null;
        }

        set({ 
          user: null, 
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          token: null
        });

      } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to log out. Please try again.');
      }
    },
    
    refreshToken: async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          await AsyncStorage.setItem('@auth_token', token);
          set({ token });
        }
        return token;
      } catch (error) {
        console.error('Token refresh error:', error);
        return null;
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
