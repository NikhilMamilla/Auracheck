import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const UserDataContext = createContext();

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [stressData, setStressData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [communityData, setCommunityData] = useState({
    joinedGroups: [],
    posts: [],
    comments: []
  });
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up real-time listeners for user data
  useEffect(() => {
    if (!currentUser) {
      // Reset all data when user logs out
      setUserData(null);
      setMoodData([]);
      setSleepData([]);
      setJournalEntries([]);
      setStressData([]);
      setActivityData([]);
      setCommunityData({
        joinedGroups: [],
        posts: [],
        comments: []
      });
      setPredictions(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Create reference to user document
    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(userDocRef, 
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          
          // Update state with user data
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: data.displayName || currentUser.displayName || 'User',
            photoURL: data.photoURL || currentUser.photoURL,
            createdAt: data.createdAt,
            lastLogin: data.lastLogin,
            settings: data.settings || {
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
          
          // Update specific data types
          if (data.mood_entries) setMoodData(data.mood_entries);
          if (data.sleep_entries) setSleepData(data.sleep_entries);
          if (data.journal_entries) setJournalEntries(data.journal_entries);
          if (data.stress_entries) setStressData(data.stress_entries);
          if (data.activity_impact) setActivityData(data.activity_impact);
          
          // Update community data
          setCommunityData({
            joinedGroups: data.joinedGroups || [],
            posts: data.posts || [],
            comments: data.comments || []
          });
          
          // Update AI predictions if available
          if (data.predictions) setPredictions(data.predictions);
        } else {
          // If user document doesn't exist, create it with initial data
          const initialUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'User',
            photoURL: currentUser.photoURL || '',
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
          };
          
          setDoc(userDocRef, initialUserData)
            .then(() => {
              setUserData(initialUserData);
              setLoading(false);
            })
            .catch(err => {
              console.error("Error creating user document:", err);
              setError("Failed to initialize user data");
              setLoading(false);
            });
        }
        
        setLoading(false);
      },
      (err) => {
        console.error("Error in user data listener:", err);
        setError("Failed to sync with database");
        setLoading(false);
      }
    );
    
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser]);

  // Update user data in Firestore
  const updateUserData = async (newData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      // Create reference to user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Update document in Firestore
      await updateDoc(userDocRef, {
        ...newData,
        lastUpdated: serverTimestamp()
      });
      
      // No need to manually update state as the onSnapshot listener will do this
      return true;
    } catch (err) {
      console.error("Error updating user data:", err);
      setError('Failed to update user data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add a mood entry
  const addMoodEntry = async (score) => {
    try {
      if (!currentUser) return false;
      
      const newEntry = {
        score,
        timestamp: new Date().toISOString()
      };
      
      const updatedMoodData = [...moodData, newEntry];
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        mood_entries: updatedMoodData,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error adding mood entry:", err);
      setError('Failed to save mood data');
      return false;
    }
  };

  // Add a sleep entry
  const addSleepEntry = async (hours) => {
    try {
      if (!currentUser) return false;
      
      const newEntry = {
        hours,
        timestamp: new Date().toISOString()
      };
      
      const updatedSleepData = [...sleepData, newEntry];
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        sleep_entries: updatedSleepData,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error adding sleep entry:", err);
      setError('Failed to save sleep data');
      return false;
    }
  };

  // Add a journal entry
  const addJournalEntry = async (entry) => {
    try {
      if (!currentUser) return false;
      
      const newEntry = {
        id: Date.now().toString(),
        ...entry,
        timestamp: new Date().toISOString()
      };
      
      const updatedJournalEntries = [newEntry, ...journalEntries];
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        journal_entries: updatedJournalEntries,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error adding journal entry:", err);
      setError('Failed to save journal entry');
      return false;
    }
  };

  // Add a stress level entry
  const addStressEntry = async (level) => {
    try {
      if (!currentUser) return false;
      
      const newEntry = {
        level,
        timestamp: new Date().toISOString()
      };
      
      const updatedStressData = [...stressData, newEntry];
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        stress_entries: updatedStressData,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error adding stress entry:", err);
      setError('Failed to save stress data');
      return false;
    }
  };

  // Join a community group
  const joinCommunityGroup = async (groupId) => {
    try {
      if (!currentUser) return false;
      
      const updatedJoinedGroups = [...communityData.joinedGroups, groupId];
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        joinedGroups: updatedJoinedGroups,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error joining community group:", err);
      setError('Failed to join community group');
      return false;
    }
  };

  // Leave a community group
  const leaveCommunityGroup = async (groupId) => {
    try {
      if (!currentUser) return false;
      
      const updatedJoinedGroups = communityData.joinedGroups.filter(id => id !== groupId);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        joinedGroups: updatedJoinedGroups,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error leaving community group:", err);
      setError('Failed to leave community group');
      return false;
    }
  };

  // Update user settings
  const updateUserSettings = async (settings) => {
    try {
      if (!currentUser) return false;
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        settings,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error updating user settings:", err);
      setError('Failed to update settings');
      return false;
    }
  };

  // Update user language preference
  const updateLanguage = async (language) => {
    try {
      if (!currentUser || !userData) return false;
      
      const updatedSettings = {
        ...userData.settings,
        language
      };
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'settings.language': language,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error("Error updating language:", err);
      setError('Failed to update language preference');
      return false;
    }
  };

  return (
    <UserDataContext.Provider value={{
      userData,
      moodData,
      sleepData,
      journalEntries,
      stressData,
      activityData,
      communityData,
      predictions,
      loading,
      error,
      updateUserData,
      addMoodEntry,
      addSleepEntry,
      addJournalEntry,
      addStressEntry,
      joinCommunityGroup,
      leaveCommunityGroup,
      updateUserSettings,
      updateLanguage
    }}>
      {children}
    </UserDataContext.Provider>
  );
};
