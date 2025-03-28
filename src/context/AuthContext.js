import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Handle the redirect authentication here
          await handleGoogleAuthUser(result.user);
        }
      } catch (err) {
        console.error("Redirect result error:", err);
        setError(err.message);
      }
    };
    
    checkRedirectResult();
  }, []);

  // Helper function to process Google Auth user data
  async function handleGoogleAuthUser(user) {
    try {
      // Check if user document exists, if not create it
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          mood_entries: [],
          sleep_entries: [],
          journal_entries: [],
          stress_entries: [],
          activity_impact: [],
          joinedGroups: [],
          settings: {
            language: 'en',
            notificationsEnabled: true,
            theme: 'light',
            privacy: {
              shareAnonymousData: true,
              receiveEmails: true,
              showScoreInCommunity: false
            }
          }
        });
      } else {
        // Update last login
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
      }
      
      return true;
    } catch (err) {
      console.error("Error handling Google user:", err);
      throw err;
    }
  }

  // Enhanced signup function to store user name
  async function signup(email, password, displayName) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        mood_entries: [],
        sleep_entries: [],
        journal_entries: [],
        stress_entries: [],
        activity_impact: [],
        joinedGroups: [],
        settings: {
          language: 'en',
          notificationsEnabled: true,
          theme: 'light',
          privacy: {
            shareAnonymousData: true,
            receiveEmails: true,
            showScoreInCommunity: false
          }
        }
      });
      
      return userCredential;
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
      throw err;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
      });
      
      return userCredential;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUserData(null);
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
      throw err;
    }
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      
      // Determine if this is a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile || window.location.hostname !== 'localhost') {
        // Use redirect method for mobile or production environment
        await signInWithRedirect(auth, provider);
        return null; // This function won't return a credential directly when using redirect
      } else {
        // Use popup for desktop development environment
        const userCredential = await signInWithPopup(auth, provider);
        await handleGoogleAuthUser(userCredential.user);
        return userCredential;
      }
    } catch (err) {
      console.error("Google Sign-in error:", err);
      setError(`Google Sign-in failed: ${err.message}`);
      throw err;
    }
  }

  // Update user profile information
  async function updateUserProfile(profileData) {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      // Update Firebase Auth profile if needed
      if (profileData.displayName || profileData.photoURL) {
        await updateProfile(currentUser, {
          displayName: profileData.displayName || currentUser.displayName,
          photoURL: profileData.photoURL || currentUser.photoURL
        });
      }
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, profileData);
      
      // Update local user data state
      if (userData) {
        setUserData({
          ...userData,
          ...profileData
        });
      }
      
      return true;
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message);
      throw err;
    }
  }

  // Fetch user data from Firestore
  async function fetchUserData(uid) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData(data);
        return data;
      } else {
        console.log('No user document found!');
        setUserData(null);
        return null;
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
      throw err;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore when auth state changes
        try {
          await fetchUserData(user.uid);
        } catch (err) {
          console.error('Error in auth state change:', err);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    resetPassword,
    signInWithGoogle,
    updateUserProfile,
    fetchUserData,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
