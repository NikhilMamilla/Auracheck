import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  addDoc, 
  serverTimestamp, 
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const Community = () => {
  const { currentUser } = useAuth();
  const { userData, communityData, joinCommunityGroup, leaveCommunityGroup, loading } = useUserData();
  const { theme, isDark } = useTheme();
  
  // States for community data
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [featuredGroups, setFeaturedGroups] = useState([]);
  const [activeView, setActiveView] = useState('myGroups'); // 'myGroups', 'explore', 'group'
  const [activeGroup, setActiveGroup] = useState(null); // Currently selected group
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    category: 'general',
    isPrivate: false
  });
  
  // Loading states
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const messagesEndRef = React.useRef(null);
  
  // Group categories
  const groupCategories = [
    { id: 'general', label: 'General Support' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'stress', label: 'Stress Management' },
    { id: 'sleep', label: 'Sleep Health' },
    { id: 'mindfulness', label: 'Mindfulness' },
    { id: 'motivation', label: 'Motivation' },
    { id: 'wellness', label: 'General Wellness' }
  ];
  
  // Fetch all available groups
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      setError(null);
      
      try {
        const groupsQuery = query(
          collection(db, 'groups'),
          where('isPrivate', '==', false), // Only public groups for now
          orderBy('memberCount', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(groupsQuery);
        
        let groupsData = [];
        querySnapshot.forEach((doc) => {
          groupsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setGroups(groupsData);
        
        // Set featured groups (top 5 most active)
        setFeaturedGroups(groupsData.slice(0, 5));
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load community groups. Please try again later.');
      } finally {
        setIsLoadingGroups(false);
      }
    };
    
    fetchGroups();
  }, []);
  
  // Update joined groups when userData changes
  useEffect(() => {
    if (!userData || !userData.joinedGroups) return;
    
    const fetchJoinedGroups = async () => {
      try {
        const joinedGroupsData = [];
        
        for (const groupId of userData.joinedGroups) {
          const groupDoc = await getDoc(doc(db, 'groups', groupId));
          
          if (groupDoc.exists()) {
            joinedGroupsData.push({
              id: groupDoc.id,
              ...groupDoc.data()
            });
          }
        }
        
        setJoinedGroups(joinedGroupsData);
      } catch (err) {
        console.error('Error fetching joined groups:', err);
      }
    };
    
    fetchJoinedGroups();
  }, [userData]);
  
  // Fetch group details when a group is selected
  useEffect(() => {
    if (!activeGroup) return;
    
    // Fetch group members
    const fetchGroupMembers = async () => {
      try {
        const membersQuery = query(
          collection(db, 'users'),
          where('joinedGroups', 'array-contains', activeGroup.id),
          limit(50)
        );
        
        const querySnapshot = await getDocs(membersQuery);
        
        let membersData = [];
        querySnapshot.forEach((doc) => {
          // Only get necessary user data, keep privacy in mind
          const userData = doc.data();
          membersData.push({
            uid: doc.id,
            displayName: userData.displayName || 'Anonymous User',
            photoURL: userData.photoURL || null,
            joinDate: userData.createdAt || null
          });
        });
        
        setGroupMembers(membersData);
      } catch (err) {
        console.error('Error fetching group members:', err);
      }
    };
    
    fetchGroupMembers();
    
    // Set up real-time listener for group messages
    setIsLoadingMessages(true);
    
    const messagesQuery = query(
      collection(db, 'groups', activeGroup.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setGroupMessages(messages);
      setIsLoadingMessages(false);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setIsLoadingMessages(false);
    });
    
    // Clean up listener
    return () => unsubscribe();
  }, [activeGroup]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && groupMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groupMessages]);
  
  // Handle group selection
  const handleSelectGroup = (group) => {
    setActiveGroup(group);
    setActiveView('group');
  };
  
  // Handle back button in group view
  const handleBackToGroups = () => {
    setActiveGroup(null);
    setActiveView('myGroups');
    setGroupMembers([]);
    setGroupMessages([]);
  };
  
  // Handle joining a group
  const handleJoinGroup = async (groupId) => {
    if (!currentUser) return;
    
    setIsJoiningGroup(true);
    
    try {
      // First, update user's joinedGroups array
      await joinCommunityGroup(groupId);
      
      // Then, update group's members count
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        await updateDoc(groupRef, {
          memberCount: (groupDoc.data().memberCount || 0) + 1
        });
      }
      
      // Update local state
      const groupToJoin = groups.find(g => g.id === groupId);
      if (groupToJoin) {
        setJoinedGroups(prev => [...prev, groupToJoin]);
      }
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group. Please try again.');
    } finally {
      setIsJoiningGroup(false);
    }
  };
  
  // Handle leaving a group
  const handleLeaveGroup = async (groupId) => {
    if (!currentUser || !window.confirm('Are you sure you want to leave this group?')) return;
    
    try {
      // First, update user's joinedGroups array
      await leaveCommunityGroup(groupId);
      
      // Then, update group's members count
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        await updateDoc(groupRef, {
          memberCount: Math.max((groupDoc.data().memberCount || 0) - 1, 0)
        });
      }
      
      // Update local state
      setJoinedGroups(prev => prev.filter(g => g.id !== groupId));
      
      // If we're currently viewing this group, go back to the list
      if (activeGroup && activeGroup.id === groupId) {
        handleBackToGroups();
      }
    } catch (err) {
      console.error('Error leaving group:', err);
      setError('Failed to leave group. Please try again.');
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!currentUser || !activeGroup || !newMessage.trim()) return;
    
    try {
      // Add message to Firestore
      await addDoc(collection(db, 'groups', activeGroup.id, 'messages'), {
        text: newMessage.trim(),
        userId: currentUser.uid,
        displayName: userData?.displayName || 'Anonymous User',
        photoURL: userData?.photoURL || null,
        timestamp: serverTimestamp()
      });
      
      // Clear input
      setNewMessage('');
      
      // Update group's lastActivity
      await updateDoc(doc(db, 'groups', activeGroup.id), {
        lastActivity: serverTimestamp()
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Handle message input change
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };
  
  // Handle message submit on enter
  const handleMessageKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle new group form change
  const handleNewGroupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGroupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle creating a new group
  const handleCreateGroup = async () => {
    if (!currentUser) return;
    
    // Validate form
    if (!newGroupData.name.trim() || !newGroupData.description.trim()) {
      setError('Please provide a group name and description.');
      return;
    }
    
    try {
      // Create group in Firestore
      const newGroupRef = await addDoc(collection(db, 'groups'), {
        name: newGroupData.name.trim(),
        description: newGroupData.description.trim(),
        category: newGroupData.category,
        isPrivate: newGroupData.isPrivate,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        memberCount: 1
      });
      
      // Join the group
      await joinCommunityGroup(newGroupRef.id);
      
      // Get the new group data
      const newGroupDoc = await getDoc(newGroupRef);
      const newGroup = {
        id: newGroupRef.id,
        ...newGroupDoc.data()
      };
      
      // Update local state
      setGroups(prev => [newGroup, ...prev]);
      setJoinedGroups(prev => [newGroup, ...prev]);
      
      // Reset form and close it
      setNewGroupData({
        name: '',
        description: '',
        category: 'general',
        isPrivate: false
      });
      setIsCreatingGroup(false);
      
      // Select the new group
      handleSelectGroup(newGroup);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, show full date
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Filter groups by search term
  const filterGroups = (groupsList) => {
    if (!searchTerm.trim()) return groupsList;
    
    const term = searchTerm.toLowerCase().trim();
    return groupsList.filter(group => 
      group.name.toLowerCase().includes(term) || 
      group.description.toLowerCase().includes(term) ||
      (group.category && groupCategories.find(c => c.id === group.category)?.label.toLowerCase().includes(term))
    );
  };
  
  // Get category label from id
  const getCategoryLabel = (categoryId) => {
    const category = groupCategories.find(c => c.id === categoryId);
    return category ? category.label : 'General';
  };
  
  // Check if user has joined a group
  const hasJoinedGroup = (groupId) => {
    return userData?.joinedGroups?.includes(groupId);
  };
  
  // Render group creation form
  const renderCreateGroupForm = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${theme.textBold}`}>Create a New Group</h2>
          <button
            onClick={() => setIsCreatingGroup(false)}
            className={`p-2 rounded-full ${theme.background} hover:bg-gray-200 dark:hover:bg-gray-700`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="groupName" className={`block font-medium ${theme.text} mb-1`}>
              Group Name*
            </label>
            <input
              type="text"
              id="groupName"
              name="name"
              value={newGroupData.name}
              onChange={handleNewGroupChange}
              placeholder="Enter group name"
              className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              required
            />
          </div>
          
          <div>
            <label htmlFor="groupDescription" className={`block font-medium ${theme.text} mb-1`}>
              Description*
            </label>
            <textarea
              id="groupDescription"
              name="description"
              value={newGroupData.description}
              onChange={handleNewGroupChange}
              placeholder="What is this group about?"
              rows="3"
              className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="groupCategory" className={`block font-medium ${theme.text} mb-1`}>
              Category
            </label>
            <select
              id="groupCategory"
              name="category"
              value={newGroupData.category}
              onChange={handleNewGroupChange}
              className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              {groupCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="groupPrivate"
              name="isPrivate"
              checked={newGroupData.isPrivate}
              onChange={handleNewGroupChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="groupPrivate" className={`ml-2 ${theme.text}`}>
              Private Group (Only visible to members)
            </label>
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleCreateGroup}
              className={`w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors`}
            >
              Create Group
            </button>
            <p className={`mt-2 text-xs ${theme.text} text-center`}>
              By creating a group, you agree to moderate content according to our community guidelines.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render group list card
  const renderGroupCard = (group) => {
    const isJoined = hasJoinedGroup(group.id);
    
    return (
      <div 
        key={group.id} 
        className={`${theme.card} rounded-lg p-4 border ${theme.border} hover:border-indigo-300 transition-colors`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 
              className={`font-medium ${theme.textBold} text-lg cursor-pointer hover:text-indigo-500`}
              onClick={() => handleSelectGroup(group)}
            >
              {group.name}
            </h3>
            <div className={`text-sm ${theme.text} flex items-center mt-1`}>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {group.memberCount || 0} members
              </span>
              <span className="mx-2">•</span>
              <span>{getCategoryLabel(group.category)}</span>
            </div>
          </div>
          
          <button
            onClick={() => isJoined ? handleLeaveGroup(group.id) : handleJoinGroup(group.id)}
            disabled={isJoiningGroup}
            className={`px-3 py-1 rounded-lg text-sm font-medium 
              ${isJoined 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-700/30 dark:text-red-400 dark:hover:bg-red-700/40' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-700/30 dark:text-indigo-400 dark:hover:bg-indigo-700/40'}`}
          >
            {isJoined ? 'Leave' : 'Join'}
          </button>
        </div>
        
        <p className={`text-sm ${theme.text} mt-2 line-clamp-2`}>
          {group.description}
        </p>
        
        {group.lastActivity && (
          <div className={`text-xs ${theme.text} mt-2`}>
            Last activity: {formatTimestamp(group.lastActivity)}
          </div>
        )}
      </div>
    );
  };
  
  // Render my groups view
  const renderMyGroups = () => {
    const filteredJoinedGroups = filterGroups(joinedGroups);
    
    return (
      <div className="space-y-6">
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className={`text-lg font-bold ${theme.textBold}`}>My Groups</h2>
            
            <div className="flex mt-2 sm:mt-0 space-x-2">
              <button
                onClick={() => setActiveView('explore')}
                className={`px-3 py-1 rounded-lg text-sm ${theme.button}`}
              >
                Explore Groups
              </button>
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="px-3 py-1 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Create Group
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search your groups..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`pl-10 pr-4 py-2 w-full rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        </div>
        
        {isCreatingGroup && renderCreateGroupForm()}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div>
            {filteredJoinedGroups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredJoinedGroups.map(group => renderGroupCard(group))}
              </div>
            ) : (
              <div className={`${theme.card} rounded-xl p-6 text-center`}>
                {searchTerm ? (
                  <p className={theme.text}>No groups match your search.</p>
                ) : (
                  <div>
                    <p className={`${theme.text} mb-4`}>You haven't joined any groups yet.</p>
                    <button
                      onClick={() => setActiveView('explore')}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Explore Groups
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render explore groups view
  const renderExplore = () => {
    const filteredAllGroups = filterGroups(groups);
    
    return (
      <div className="space-y-6">
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className={`text-lg font-bold ${theme.textBold}`}>Explore Groups</h2>
            
            <div className="flex mt-2 sm:mt-0 space-x-2">
              <button
                onClick={() => setActiveView('myGroups')}
                className={`px-3 py-1 rounded-lg text-sm ${theme.button}`}
              >
                My Groups
              </button>
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="px-3 py-1 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Create Group
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search all groups..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`pl-10 pr-4 py-2 w-full rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {groupCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSearchTerm(category.label)}
                className={`px-3 py-1 rounded-full text-xs ${theme.background} ${theme.text} border ${theme.border} hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900 dark:hover:text-indigo-300`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        {isCreatingGroup && renderCreateGroupForm()}
        
        {/* Featured Groups */}
        {!searchTerm && (
          <div className={`${theme.card} rounded-xl p-6`}>
            <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Featured Groups</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {featuredGroups.slice(0, 3).map(group => renderGroupCard(group))}
            </div>
          </div>
        )}
        
        {isLoadingGroups ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div>
            <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>
              {searchTerm ? 'Search Results' : 'All Groups'}
            </h2>
            
            {filteredAllGroups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredAllGroups.map(group => renderGroupCard(group))}
              </div>
            ) : (
              <div className={`${theme.card} rounded-xl p-6 text-center`}>
                <p className={theme.text}>No groups match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render group view
  const renderGroupView = () => {
    if (!activeGroup) return null;
    
    const isJoined = hasJoinedGroup(activeGroup.id);
    
    return (
      <div className="space-y-6">
        {/* Group header */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackToGroups}
              className={`mr-3 p-2 rounded-full ${theme.background} hover:bg-gray-200 dark:hover:bg-gray-700`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className={`text-xl font-bold ${theme.textBold}`}>{activeGroup.name}</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <div className={`${theme.text} flex items-center`}>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {activeGroup.memberCount || 0} members
                </span>
                <span className="mx-2">•</span>
                <span>{getCategoryLabel(activeGroup.category)}</span>
              </div>
              
              <p className={`${theme.text} mt-2`}>
                {activeGroup.description}
              </p>
            </div>
            
            <button
              onClick={() => isJoined ? handleLeaveGroup(activeGroup.id) : handleJoinGroup(activeGroup.id)}
              disabled={isJoiningGroup}
              className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg text-sm font-medium ${
                isJoined 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-700/30 dark:text-red-400 dark:hover:bg-red-700/40' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isJoined ? 'Leave Group' : 'Join Group'}
            </button>
          </div>
        </div>
        
        {/* Group chat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className={`${theme.card} rounded-xl p-6`}>
              <h3 className={`text-lg font-bold ${theme.textBold} mb-4`}>Group Chat</h3>
              
              {isJoined ? (
                <>
                  <div className={`h-96 overflow-y-auto ${theme.background} border ${theme.border} rounded-lg p-4 mb-4`}>
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : groupMessages.length > 0 ? (
                      <div className="space-y-4">
                        {groupMessages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.userId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-xs sm:max-w-sm md:max-w-md rounded-lg px-4 py-2 ${
                                message.userId === currentUser?.uid 
                                  ? 'bg-indigo-100 dark:bg-indigo-900 rounded-br-none' 
                                  : `${theme.background} border ${theme.border} rounded-bl-none`
                              }`}
                            >
                              {message.userId !== currentUser?.uid && (
                                <div className={`text-xs font-medium ${theme.accent} mb-1`}>
                                  {message.displayName}
                                </div>
                              )}
                              <div className={theme.text}>{message.text}</div>
                              <div className={`text-xs ${theme.text} opacity-70 text-right mt-1`}>
                                {message.timestamp ? formatTimestamp(message.timestamp) : 'Sending...'}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef}></div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className={`${theme.text} text-center`}>No messages yet. Be the first to say hello!</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex">
                    <textarea
                      value={newMessage}
                      onChange={handleMessageChange}
                      onKeyDown={handleMessageKeyDown}
                      placeholder="Type a message..."
                      className={`flex-grow p-3 rounded-l-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      rows="2"
                    ></textarea>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`px-4 rounded-r-lg bg-indigo-600 hover:bg-indigo-700 text-white ${!newMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className={`${theme.text} text-center mb-4`}>You need to join this group to participate in the chat.</p>
                  <button
                    onClick={() => handleJoinGroup(activeGroup.id)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Join Group
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Group members */}
          <div>
            <div className={`${theme.card} rounded-xl p-6`}>
              <h3 className={`text-lg font-bold ${theme.textBold} mb-4`}>Members ({activeGroup.memberCount || 0})</h3>
              
              <div className="max-h-96 overflow-y-auto">
                {groupMembers.length > 0 ? (
                  <div className="space-y-3">
                    {groupMembers.map((member) => (
                      <div key={member.uid} className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.displayName} className="h-8 w-8 rounded-full" />
                          ) : (
                            <span className={`text-indigo-600 dark:text-indigo-300 font-medium`}>
                              {member.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`font-medium ${theme.textBold}`}>
                            {member.displayName}
                            {member.uid === currentUser?.uid && <span className="ml-2 text-xs text-indigo-500">(You)</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${theme.text} text-center`}>Loading members...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render logic
  return (
    <div>
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {activeView === 'group' && activeGroup ? (
        renderGroupView()
      ) : activeView === 'explore' ? (
        renderExplore()
      ) : (
        renderMyGroups()
      )}
    </div>
  );
};

export default Community;