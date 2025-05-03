import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  getIdToken,
  setPersistence,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCsnf51uNNjdTIT0S0DjofvUvEXuhWZsZo",
  authDomain: "new-app22.firebaseapp.com",
  projectId: "new-app22",
  storageBucket: "new-app22.firebasestorage.app",
  messagingSenderId: "129879073128",
  appId: "1:129879073128:android:1b9bc5d83ed6c7de3f76dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with proper persistence
const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Sign In
GoogleSignin.configure({
  webClientId: '745093990275-fc6bol73j7e77q0sp7kg1f7luoe0kuc6.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID',  // Only needed for iOS
});

// Token management
export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await getIdToken(user, true); // Force refresh token
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// API request wrapper with token
export const authenticatedFetch = async (url, options = {}) => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'omit', // Don't send cookies
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response;
};

// Collection References
export const usersCollection = collection(db, 'users');
export const scoresCollection = collection(db, 'scores');
export const achievementsCollection = collection(db, 'achievements');

// Authentication helpers
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdToken(userCredential.user);
    await AsyncStorage.setItem('@auth_token', token);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logOut = async () => {
  try {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (!confirmed) return false;
    }
    
    if (Platform.OS !== 'web' && await GoogleSignin.isSignedIn()) {
      await GoogleSignin.signOut();
    }
    
    await AsyncStorage.removeItem('@auth_token');
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Google Sign-in
export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await getIdToken(result.user);
      await AsyncStorage.setItem('@auth_token', token);
      return result.user;
    } else {
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseToken = await getIdToken(userCredential.user);
      await AsyncStorage.setItem('@auth_token', firebaseToken);
      return userCredential.user;
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Firestore CRUD Operations
export const createDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef;
  } catch (error) {
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
    return docRef;
  } catch (error) {
    throw error;
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    throw error;
  }
};

export const subscribeToDocument = (collectionName, docId, callback) => {
  return onSnapshot(doc(db, collectionName, docId), (doc) => {
    callback(doc.exists() ? doc.data() : null);
  });
};

// Example query function
export const queryCollection = async (
  collectionName,
  conditions = [],
  sortBy = null,
  limitTo = null
) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply where conditions
    conditions.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator, value));
    });
    
    // Apply sorting
    if (sortBy) {
      q = query(q, orderBy(sortBy.field, sortBy.direction));
    }
    
    // Apply limit
    if (limitTo) {
      q = query(q, limit(limitTo));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// User Profile Management
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      coins: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return userRef;
  } catch (error) {
    throw error;
  }
};

export const subscribeToUserProfile = (userId, callback) => {
  let unsubscribe = null;

  const setupSubscription = async () => {
    const token = await getAuthToken();
    if (!token) return;

    const userRef = doc(db, 'users', userId);
    unsubscribe = onSnapshot(userRef, 
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      },
      (error) => {
        console.error('Profile subscription error:', error);
        if (error.code === 'permission-denied') {
          // Attempt token refresh and resubscribe
          getIdToken(auth.currentUser, true)
            .then(() => setupSubscription())
            .catch(console.error);
        }
      }
    );
  };

  setupSubscription();
  return () => unsubscribe?.();
};

export { app, auth, db };