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
  updateProfile,
  setPersistence,
  browserLocalPersistence
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
  
  // Set persistence to LOCAL
  useEffect(() => {
    const setPersistenceType = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("Firebase persistence set to LOCAL");
      } catch (error) {
        console.error("Error setting persistence:", error);
      }
    };
    
    setPersistenceType();
  }, []);
  
  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);
        console.log("Redirect result:", result);
        
        if (result?.user) {
          console.log("User successfully authenticated via redirect:", result.user);
          await handleGoogleAuthUser(result.user);
        } else {
          console.log("No redirect result found or user is null");
        }
      } catch (err) {
        console.error("Redirect result error:", err);
        setError(`Redirect result error: ${err.message}`);
      }
    };
    
    checkRedirectResult();
  }, []);

  // Helper function to process Google Auth user data
  async function handleGoogleAuthUser(user) {
    try {
      console.log("Handling Google user:", user.uid);
      // Check if user document exists, if not create it
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.log("Creating new user document for:", user.email);
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
        console.log("User document created successfully");
      } else {
        console.log("Updating existing user document");
        // Update last login
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
        console.log("Last login updated successfully");
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
      console.log("Starting email/password signup for:", email);
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created in Firebase Auth");
      
      // Set display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      console.log("Display name set:", displayName);
      
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
      console.log("User document created in Firestore");
      
      return userCredential;
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
      throw err;
    }
  }

  async function login(email, password) {
    try {
      console.log("Starting email/password login for:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful");
      
      // Update last login timestamp
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
      });
      console.log("Last login timestamp updated");
      
      return userCredential;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      console.log("Logging out user");
      await signOut(auth);
      setUserData(null);
      console.log("User logged out successfully");
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
      throw err;
    }
  }

  function resetPassword(email) {
    console.log("Sending password reset email to:", email);
    return sendPasswordResetEmail(auth, email);
  }

  async function signInWithGoogle() {
    try {
      console.log("Starting Google sign-in process...");
      const provider = new GoogleAuthProvider();
      
      // Log the current URL for debugging
      console.log("Current URL:", window.location.href);
      
      // Always use redirect for Firebase hosting
      console.log("Using signInWithRedirect for Google auth");
      await signInWithRedirect(auth, provider);
      // This line won't execute immediately due to redirect
      return null;
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
      console.log("Updating user profile");
      
      // Update Firebase Auth profile if needed
      if (profileData.displayName || profileData.photoURL) {
        await updateProfile(currentUser, {
          displayName: profileData.displayName || currentUser.displayName,
          photoURL: profileData.photoURL || currentUser.photoURL
        });
        console.log("Auth profile updated");
      }
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, profileData);
      console.log("Firestore profile updated");
      
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
      console.log("Fetching user data for:", uid);
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData(data);
        console.log("User data fetched successfully");
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
    console.log("Setting up auth state change listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed, user:", user ? user.email : "null");
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
