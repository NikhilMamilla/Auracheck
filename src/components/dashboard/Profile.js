import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

const Profile = () => {
  const { currentUser, logout, resetPassword } = useAuth();
  const { userData, updateUserData, updateUserProfile, loading } = useUserData();
  const { theme, isDark, toggleTheme } = useTheme();
  
  // State for profile sections
  const [activeSection, setActiveSection] = useState('profile'); // 'profile', 'account', 'privacy', 'notifications', 'danger'
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    displayName: '',
    photoURL: '',
    email: ''
  });
  
  // State for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    shareAnonymousData: true,
    receiveEmails: true,
    showScoreInCommunity: false
  });
  
  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    notificationsEnabled: true,
    reminderFrequency: 'daily',
    journalReminders: true,
    communityMessages: true,
    emailNotifications: true
  });
  
  // State for user stats
  const [userStats, setUserStats] = useState({
    moodEntries: 0,
    sleepEntries: 0,
    stressEntries: 0,
    journalEntries: 0,
    joinedGroups: 0,
    streakDays: 0,
    memberSince: null
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for account deletion
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // State for profile image
  const [profileImage, setProfileImage] = useState(null);
  
  // Loading and error states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Clear success and error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);
  
  // Initialize profile data from user data
  useEffect(() => {
    if (currentUser && userData) {
      setProfileData({
        displayName: userData.displayName || currentUser.displayName || '',
        photoURL: userData.photoURL || currentUser.photoURL || '',
        email: currentUser.email || ''
      });
      
      // Set privacy settings
      if (userData.settings && userData.settings.privacy) {
        setPrivacySettings({
          shareAnonymousData: userData.settings.privacy.shareAnonymousData ?? true,
          receiveEmails: userData.settings.privacy.receiveEmails ?? true,
          showScoreInCommunity: userData.settings.privacy.showScoreInCommunity ?? false
        });
      }
      
      // Set notification settings
      if (userData.settings) {
        setNotificationSettings({
          notificationsEnabled: userData.settings.notificationsEnabled ?? true,
          reminderFrequency: userData.settings.reminderFrequency || 'daily',
          journalReminders: userData.settings.journalReminders ?? true,
          communityMessages: userData.settings.communityMessages ?? true,
          emailNotifications: userData.settings.emailNotifications ?? true
        });
      }
      
      // Calculate user stats
      calculateUserStats();
    }
  }, [currentUser, userData]);
  
  // Calculate user statistics
  const calculateUserStats = () => {
    if (!userData) return;
    
    const stats = {
      moodEntries: userData.mood_entries?.length || 0,
      sleepEntries: userData.sleep_entries?.length || 0,
      stressEntries: userData.stress_entries?.length || 0,
      journalEntries: userData.journal_entries?.length || 0,
      joinedGroups: userData.joinedGroups?.length || 0,
      streakDays: calculateStreakDays(),
      memberSince: userData.createdAt || null
    };
    
    setUserStats(stats);
  };
  
  // Calculate streak days
  const calculateStreakDays = () => {
    if (!userData || !userData.mood_entries || userData.mood_entries.length === 0) {
      return 0;
    }
    
    // Get all dates with entries
    const entriesByDate = {};
    
    // Process mood entries
    userData.mood_entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      entriesByDate[dateKey] = true;
    });
    
    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split('T')[0];
    
    let streakCount = 0;
    let currentDate = new Date(today);
    
    // Check if there's an entry for today
    if (entriesByDate[todayKey]) {
      streakCount = 1;
      
      // Check previous days
      let keepChecking = true;
      while (keepChecking) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (entriesByDate[dateKey]) {
          streakCount++;
        } else {
          keepChecking = false;
        }
      }
    }
    
    return streakCount;
  };
  
  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle privacy settings change
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle notification settings change
  const handleNotificationChange = (e) => {
    const { name, type, checked, value } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle password change fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Save profile data
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Process image upload if a new image was selected
      let photoURL = profileData.photoURL;
      
      if (profileImage) {
        try {
          // Create a reference to the storage location
          const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
          
          // Upload the file
          await uploadBytes(storageRef, profileImage);
          
          // Get download URL
          photoURL = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error("Failed to upload profile image");
        }
      }
      
      // Update profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: photoURL
      });
      
      // Get a reference to the user's document
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Check if the document exists
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          displayName: profileData.displayName,
          photoURL: photoURL,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create a new document
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: profileData.displayName,
          photoURL: photoURL,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        photoURL: photoURL
      }));
      
      // Reset profile image
      setProfileImage(null);
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save privacy settings
  const handleSavePrivacy = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get a reference to the user's document
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Check if the document exists
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          'settings.privacy': privacySettings,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create a new document
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          settings: {
            privacy: privacySettings
          },
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
      
      setSuccess('Privacy settings updated successfully!');
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError('Failed to update privacy settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save notification settings
  const handleSaveNotifications = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get a reference to the user's document
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Check if the document exists
      const docSnap = await getDoc(userDocRef);
      
      const settings = {
        notificationsEnabled: notificationSettings.notificationsEnabled,
        reminderFrequency: notificationSettings.reminderFrequency,
        journalReminders: notificationSettings.journalReminders,
        communityMessages: notificationSettings.communityMessages,
        emailNotifications: notificationSettings.emailNotifications
      };
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          settings: {
            ...docSnap.data().settings,
            ...settings
          },
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create a new document
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          settings: settings,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
      
      setSuccess('Notification settings updated successfully!');
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('Failed to update notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Change email
  const handleChangeEmail = async () => {
    if (!currentUser || !profileData.email) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Check if email has changed
      if (profileData.email !== currentUser.email) {
        // Update email in Firebase Auth
        await updateEmail(currentUser, profileData.email);
        
        // Update email in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Check if the document exists
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          await updateDoc(userDocRef, {
            email: profileData.email,
            lastUpdated: serverTimestamp()
          });
        } else {
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: profileData.email,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
        }
        
        setSuccess('Email updated successfully!');
      } else {
        setSuccess('No change in email address.');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      
      if (err.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in to change your email.');
      } else {
        setError('Failed to update email. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    if (!currentUser) return;
    
    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match.');
        setIsChangingPassword(false);
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsChangingPassword(false);
        return;
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, passwordData.newPassword);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Password changed successfully!');
    } catch (err) {
      console.error('Error changing password:', err);
      
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect.');
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Reset password via email
  const handleResetPassword = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await resetPassword(currentUser.email);
      setSuccess('Password reset email sent. Check your inbox.');
    } catch (err) {
      console.error('Error sending reset email:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete account
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    if (deleteConfirmation !== currentUser.email) {
      setError('Please enter your email address to confirm account deletion.');
      return;
    }
    
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Delete user data from Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Delete profile image if exists
      if (profileData.photoURL && profileData.photoURL.includes('profile_images')) {
        try {
          const imageRef = ref(storage, `profile_images/${currentUser.uid}`);
          await deleteObject(imageRef);
        } catch (imageErr) {
          console.error('Error deleting profile image:', imageErr);
          // Continue with account deletion even if image deletion fails
        }
      }
      
      // Delete user's posts and comments from community
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', currentUser.uid)
      );
      
      const userPostsSnapshot = await getDocs(userPostsQuery);
      
      const deletePromises = [];
      userPostsSnapshot.forEach(docSnap => {
        deletePromises.push(deleteDoc(doc(db, 'posts', docSnap.id)));
      });
      
      // Delete user's comments
      const userCommentsQuery = query(
        collection(db, 'comments'),
        where('userId', '==', currentUser.uid)
      );
      
      const userCommentsSnapshot = await getDocs(userCommentsQuery);
      
      userCommentsSnapshot.forEach(docSnap => {
        deletePromises.push(deleteDoc(doc(db, 'comments', docSnap.id)));
      });
      
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      
      // Finally delete user document
      await deleteDoc(userDocRef);
      
      // Delete user from Firebase Auth
      await deleteUser(currentUser);
      
      setSuccess('Account deleted successfully. Redirecting...');
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Error deleting account:', err);
      
      if (err.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in to delete your account.');
      } else {
        setError('Failed to delete account. Please try again.');
      }
      
      setIsDeleting(false);
    }
  };
  
  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      setSuccess('Logging out...');
      // Redirect to login page will happen automatically due to auth state change
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again.');
    }
  };
  
  // Render profile section
  const renderProfileSection = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Personal Information</h2>
        
        <div className="space-y-6">
          {/* Profile Image */}
          <div>
            <label className={`block font-medium ${theme.text} mb-2`}>Profile Image</label>
            <div className="flex items-center">
              <div className="mr-4">
                {profileData.photoURL ? (
                  <img src={profileData.photoURL} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="text-2xl font-medium text-indigo-600 dark:text-indigo-300">
                      {profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  id="profileImage" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label 
                  htmlFor="profileImage" 
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  Upload Image
                </label>
                
                {profileImage && (
                  <div className={`mt-2 text-sm ${theme.text}`}>
                    Selected: {profileImage.name}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className={`block font-medium ${theme.text} mb-2`}>
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleProfileChange}
              className={`w-full p-3 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Enter your name"
            />
          </div>
          
          {/* Email Address */}
          <div>
            <label htmlFor="email" className={`block font-medium ${theme.text} mb-2`}>
              Email Address
            </label>
            <div className="flex">
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className={`flex-grow p-3 rounded-l-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="Enter your email"
              />
              <button
                onClick={handleChangeEmail}
                disabled={isSaving || profileData.email === currentUser?.email}
                className={`px-4 py-2 rounded-r-lg bg-indigo-600 hover:bg-indigo-700 text-white ${
                  (isSaving || profileData.email === currentUser?.email) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Update
              </button>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render account section
  const renderAccountSection = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Account Settings</h2>
        
        <div className="space-y-6">
          {/* Password Change */}
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <h3 className={`font-medium ${theme.textBold} mb-3`}>Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className={`block text-sm font-medium ${theme.text} mb-1`}>
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className={`block text-sm font-medium ${theme.text} mb-1`}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme.text} mb-1`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={handleResetPassword}
                  className={`text-sm text-indigo-600 dark:text-indigo-400 hover:underline`}
                >
                  Forgot password?
                </button>
                
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className={`px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white ${
                    (isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${theme.textBold}`}>Dark Mode</h3>
                <p className={`text-sm ${theme.text} mt-1`}>
                  {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                </p>
              </div>
              
              <button
                onClick={toggleTheme}
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                  isDark ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Toggle Dark Mode</span>
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Sign Out */}
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${theme.textBold}`}>Sign Out</h3>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Sign out from all devices
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render privacy section
  const renderPrivacySection = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Privacy Settings</h2>
        
        <div className="space-y-6">
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="shareAnonymousData"
                  name="shareAnonymousData"
                  type="checkbox"
                  checked={privacySettings.shareAnonymousData}
                  onChange={handlePrivacyChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="shareAnonymousData" className={`font-medium ${theme.textBold}`}>
                  Share Anonymous Data
                </label>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Allow AuraCheck to use your anonymous data to improve the app and recommendations
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="receiveEmails"
                  name="receiveEmails"
                  type="checkbox"
                  checked={privacySettings.receiveEmails}
                  onChange={handlePrivacyChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="receiveEmails" className={`font-medium ${theme.textBold}`}>
                  Receive Emails
                </label>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Receive emails about your account, updates, and recommendations
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="showScoreInCommunity"
                  name="showScoreInCommunity"
                  type="checkbox"
                  checked={privacySettings.showScoreInCommunity}
                  onChange={handlePrivacyChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="showScoreInCommunity" className={`font-medium ${theme.textBold}`}>
                  Show Mental Health Score in Community
                </label>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Display your mental health score next to your name in community discussions
                </p>
              </div>
            </div>
          </div>
          
          {/* Data Export */}
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${theme.textBold}`}>Export Your Data</h3>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Download all your personal data in JSON format
                </p>
              </div>
              
              <button
                onClick={() => {
                  try {
                    // Create JSON data
                    const dataStr = JSON.stringify(userData, null, 2);
                    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
                    
                    // Create download link
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', `auracheck_data_${Date.now()}.json`);
                    linkElement.click();
                    
                    setSuccess('Data exported successfully!');
                  } catch (err) {
                    console.error('Error exporting data:', err);
                    setError('Failed to export data. Please try again.');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Export Data
              </button>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSavePrivacy}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render notification section
  const renderNotificationSection = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Notification Settings</h2>
        
        <div className="space-y-6">
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="notificationsEnabled"
                  name="notificationsEnabled"
                  type="checkbox"
                  checked={notificationSettings.notificationsEnabled}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="notificationsEnabled" className={`font-medium ${theme.textBold}`}>
                  Enable Notifications
                </label>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Receive push notifications from AuraCheck
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <h3 className={`font-medium ${theme.textBold} mb-3`}>Reminder Frequency</h3>
            <select
              id="reminderFrequency"
              name="reminderFrequency"
              value={notificationSettings.reminderFrequency}
              onChange={handleNotificationChange}
              className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={!notificationSettings.notificationsEnabled}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="none">None</option>
            </select>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="journalReminders"
                  name="journalReminders"
                  type="checkbox"
                  checked={notificationSettings.journalReminders}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={!notificationSettings.notificationsEnabled}
                />
              </div>
              <div className="ml-3">
                <label htmlFor="journalReminders" className={`font-medium ${theme.textBold}`}>
                  Journal Reminders
                </label>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Receive reminders to complete your journal entries
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="communityMessages"
                  name="communityMessages"
                  type="checkbox"
                  checked={notificationSettings.communityMessages}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={!notificationSettings.notificationsEnabled}
                />
              </div>
              <div className="ml-3">
                <label htmlFor="communityMessages" className={`font-medium ${theme.textBold}`}>
                  Community Messages
                </label>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Receive notifications for new messages in your community groups
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="emailNotifications" className={`font-medium ${theme.textBold}`}>
                  Email Notifications
                </label>
                <p className={`text-sm ${theme.text} mt-1`}>
                  Receive notifications via email in addition to app notifications
                </p>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveNotifications}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render danger zone section
  const renderDangerZone = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6 border-red-500 border`}>
        <h2 className={`text-lg font-bold text-red-600 dark:text-red-400 mb-4`}>Danger Zone</h2>
        
        <div className="space-y-6">
          <div className={`p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700`}>
            <h3 className={`font-medium text-red-600 dark:text-red-400 mb-3`}>Delete Account</h3>
            <p className={`text-sm text-red-600 dark:text-red-400`}>
              This action is irreversible. All your data, including mood entries, journal entries, and community posts will be permanently deleted.
            </p>
            
            <div className="mt-4">
              <label htmlFor="deleteConfirmation" className={`block text-sm font-medium text-red-600 dark:text-red-400 mb-1`}>
                To confirm, type your email address below:
              </label>
              <input
                type="email"
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={currentUser?.email}
                className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== currentUser?.email}
                className={`px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white ${
                  (isDeleting || deleteConfirmation !== currentUser?.email) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render user stats
  const renderUserStats = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6 mb-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Your Stats</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className={`text-sm ${theme.text}`}>Streak</div>
            <div className={`text-2xl font-bold ${theme.accent} flex items-center`}>
              {userStats.streakDays} days
              {userStats.streakDays > 0 && <span className="ml-2">🔥</span>}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className={`text-sm ${theme.text}`}>Mood Entries</div>
            <div className={`text-2xl font-bold ${theme.accent}`}>{userStats.moodEntries}</div>
          </div>
          
          <div className={`p-3 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className={`text-sm ${theme.text}`}>Journal Entries</div>
            <div className={`text-2xl font-bold ${theme.accent}`}>{userStats.journalEntries}</div>
          </div>
          
          <div className={`p-3 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className={`text-sm ${theme.text}`}>Sleep Entries</div>
            <div className={`text-2xl font-bold ${theme.accent}`}>{userStats.sleepEntries}</div>
          </div>
          
          <div className={`p-3 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className={`text-sm ${theme.text}`}>Stress Entries</div>
            <div className={`text-2xl font-bold ${theme.accent}`}>{userStats.stressEntries}</div>
          </div>
          
          <div className={`p-3 rounded-lg ${theme.background} border ${theme.border}`}>
            <div className={`text-sm ${theme.text}`}>Groups Joined</div>
            <div className={`text-2xl font-bold ${theme.accent}`}>{userStats.joinedGroups}</div>
          </div>
        </div>
        
        <div className={`mt-4 text-sm ${theme.text} text-center`}>
          Member since: {userStats.memberSince ? formatDate(userStats.memberSince) : 'N/A'}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-lg">
          {success}
        </div>
      )}
      
      {/* User stats */}
      {renderUserStats()}
      
      {/* Section Tabs */}
      <div className={`${theme.card} rounded-xl p-4`}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'profile' ? 'bg-indigo-600 text-white' : theme.button
            }`}
          >
            Profile
          </button>
          
          <button
            onClick={() => setActiveSection('account')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'account' ? 'bg-indigo-600 text-white' : theme.button
            }`}
          >
            Account
          </button>
          
          <button
            onClick={() => setActiveSection('privacy')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'privacy' ? 'bg-indigo-600 text-white' : theme.button
            }`}
          >
            Privacy
          </button>
          
          <button
            onClick={() => setActiveSection('notifications')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'notifications' ? 'bg-indigo-600 text-white' : theme.button
            }`}
          >
            Notifications
          </button>
          
          <button
            onClick={() => setActiveSection('danger')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'danger' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
            }`}
          >
            Danger Zone
          </button>
        </div>
      </div>
      
      {/* Active Section Content */}
      {activeSection === 'profile' && renderProfileSection()}
      {activeSection === 'account' && renderAccountSection()}
      {activeSection === 'privacy' && renderPrivacySection()}
      {activeSection === 'notifications' && renderNotificationSection()}
      {activeSection === 'danger' && renderDangerZone()}
    </div>
  );
};

export default Profile;