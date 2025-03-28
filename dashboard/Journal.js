import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const Journal = () => {
  const { currentUser } = useAuth();
  const { journalEntries, addJournalEntry, loading } = useUserData();
  const { theme, isDark } = useTheme();
  
  // State for new journal entry
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 3, // 1-5 scale
    tags: []
  });
  
  // State for editing entries
  const [editMode, setEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  
  // State for entry view
  const [viewingEntry, setViewingEntry] = useState(null);
  
  // State for filtering and searching
  const [filters, setFilters] = useState({
    searchTerm: '',
    tags: [],
    startDate: null,
    endDate: null,
    moodRange: [1, 5]
  });
  
  // State for filtered entries
  const [filteredEntries, setFilteredEntries] = useState([]);
  
  // Available tags
  const availableTags = [
    { id: 'work', label: 'Work' },
    { id: 'personal', label: 'Personal' },
    { id: 'health', label: 'Health' },
    { id: 'goals', label: 'Goals' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'reflection', label: 'Reflection' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'challenges', label: 'Challenges' }
  ];
  
  // Apply filters to journal entries
  useEffect(() => {
    if (!journalEntries) return;
    
    // Start with all entries sorted by date (newest first)
    let filtered = [...journalEntries].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Apply search term filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.title && entry.title.toLowerCase().includes(search)) || 
        (entry.content && entry.content.toLowerCase().includes(search))
      );
    }
    
    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(entry => 
        entry.tags && filters.tags.some(tag => entry.tags.includes(tag))
      );
    }
    
    // Apply date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= endDate);
    }
    
    // Apply mood range filter
    if (filters.moodRange) {
      filtered = filtered.filter(entry => 
        (!entry.mood && filters.moodRange[0] <= 3 && filters.moodRange[1] >= 3) || // Default mood is 3
        (entry.mood >= filters.moodRange[0] && entry.mood <= filters.moodRange[1])
      );
    }
    
    setFilteredEntries(filtered);
  }, [journalEntries, filters]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Get mood emoji
  const getMoodEmoji = (mood) => {
    switch(Math.round(mood || 3)) {
      case 1: return '😢'; // Very sad
      case 2: return '☹️'; // Sad
      case 3: return '😐'; // Neutral
      case 4: return '🙂'; // Happy
      case 5: return '😄'; // Very happy
      default: return '😐'; // Default
    }
  };
  
  // Get mood text
  const getMoodText = (mood) => {
    switch(Math.round(mood || 3)) {
      case 1: return 'Very Sad';
      case 2: return 'Sad';
      case 3: return 'Neutral';
      case 4: return 'Happy';
      case 5: return 'Very Happy';
      default: return 'Neutral';
    }
  };
  
  // Handle change in entry title
  const handleTitleChange = (e) => {
    setNewEntry({
      ...newEntry,
      title: e.target.value
    });
  };
  
  // Handle change in entry content
  const handleContentChange = (e) => {
    setNewEntry({
      ...newEntry,
      content: e.target.value
    });
  };
  
  // Handle change in entry mood
  const handleMoodChange = (e) => {
    setNewEntry({
      ...newEntry,
      mood: parseInt(e.target.value)
    });
  };
  
  // Toggle a tag in the entry
  const toggleTag = (tagId) => {
    if (newEntry.tags.includes(tagId)) {
      setNewEntry({
        ...newEntry,
        tags: newEntry.tags.filter(id => id !== tagId)
      });
    } else {
      setNewEntry({
        ...newEntry,
        tags: [...newEntry.tags, tagId]
      });
    }
  };
  
  // Handle search term change
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      searchTerm: e.target.value
    });
  };
  
  // Toggle a tag in the filters
  const toggleFilterTag = (tagId) => {
    if (filters.tags.includes(tagId)) {
      setFilters({
        ...filters,
        tags: filters.tags.filter(id => id !== tagId)
      });
    } else {
      setFilters({
        ...filters,
        tags: [...filters.tags, tagId]
      });
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      tags: [],
      startDate: null,
      endDate: null,
      moodRange: [1, 5]
    });
  };
  
  // Submit new journal entry
  const handleSubmitEntry = async () => {
    try {
      // Validate entry
      if (!newEntry.title.trim() || !newEntry.content.trim()) {
        alert('Please enter both a title and content for your journal entry.');
        return;
      }
      
      // If in edit mode, update existing entry
      if (editMode && editingEntryId) {
        // Find the entry being edited
        const entryToUpdate = journalEntries.find(entry => entry.id === editingEntryId);
        
        if (entryToUpdate) {
          // Create updated entry
          const updatedEntry = {
            ...entryToUpdate,
            title: newEntry.title,
            content: newEntry.content,
            mood: newEntry.mood,
            tags: newEntry.tags,
            updatedAt: new Date().toISOString()
          };
          
          // Get all entries except the one being updated
          const updatedEntries = journalEntries.filter(entry => entry.id !== editingEntryId);
          
          // Add the updated entry
          const allUpdatedEntries = [updatedEntry, ...updatedEntries];
          
          // Update in Firestore
          if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
              journal_entries: allUpdatedEntries,
              lastUpdated: serverTimestamp()
            });
          }
        }
        
        // Exit edit mode
        setEditMode(false);
        setEditingEntryId(null);
      } else {
        // Create new entry with timestamp
        const entry = {
          ...newEntry,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        };
        
        // Call addJournalEntry from UserDataContext
        await addJournalEntry(entry);
      }
      
      // Reset form
      setNewEntry({
        title: '',
        content: '',
        mood: 3,
        tags: []
      });
      
      // Update last activity in Firestore
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error submitting journal entry:', error);
    }
  };
  
  // Start editing an entry
  const startEditingEntry = (entry) => {
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || 3,
      tags: entry.tags || []
    });
    setEditMode(true);
    setEditingEntryId(entry.id);
    setViewingEntry(null);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setNewEntry({
      title: '',
      content: '',
      mood: 3,
      tags: []
    });
    setEditMode(false);
    setEditingEntryId(null);
  };
  
  // View a journal entry
  const viewEntry = (entry) => {
    setViewingEntry(entry);
    setEditMode(false);
  };
  
  // Return to entry list
  const closeEntryView = () => {
    setViewingEntry(null);
  };
  
  // Delete a journal entry
  const deleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Get all entries except the one being deleted
      const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
      
      // Update in Firestore
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          journal_entries: updatedEntries,
          lastUpdated: serverTimestamp()
        });
      }
      
      // Close entry view if the deleted entry was being viewed
      if (viewingEntry && viewingEntry.id === entryId) {
        setViewingEntry(null);
      }
      
      // Cancel editing if the deleted entry was being edited
      if (editMode && editingEntryId === entryId) {
        cancelEditing();
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };
  
  // Estimate reading time for an entry
  const estimateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime === 0 ? 1 : readingTime; // Minimum 1 minute
  };
  
  // Render journal entry list
  const renderEntryList = () => {
    return (
      <div className="space-y-6">
        {/* Search and filters */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className={`text-lg font-bold ${theme.textBold}`}>Your Journal</h2>
            
            <button
              onClick={() => {
                setViewingEntry(null);
                setEditMode(false);
                setEditingEntryId(null);
                setNewEntry({
                  title: '',
                  content: '',
                  mood: 3,
                  tags: []
                });
                window.scrollTo(0, 0);
              }}
              className={`mt-2 sm:mt-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors`}
            >
              New Entry
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className={`sr-only`}>Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className={`block w-full pl-10 pr-3 py-2 border ${theme.border} rounded-md leading-5 ${theme.background} ${theme.text} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Search journal entries..."
                  type="search"
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleFilterTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.tags.includes(tag.id)
                        ? 'bg-indigo-500 text-white'
                        : `${theme.background} ${theme.text} border ${theme.border}`
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className={`px-3 py-1 text-sm ${theme.text} hover:${theme.accent}`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Journal entries list */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'Entry' : 'Entries'}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className={`p-4 rounded-lg ${theme.background} ${theme.border} border cursor-pointer hover:border-indigo-300 transition-colors`}
                  onClick={() => viewEntry(entry)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${theme.textBold} text-lg`}>
                        {entry.title}
                      </h3>
                      <p className={`${theme.text} text-sm mb-2`}>
                        {formatDate(entry.timestamp)} • {estimateReadingTime(entry.content)} min read
                      </p>
                    </div>
                    <span className="text-xl">
                      {getMoodEmoji(entry.mood)}
                    </span>
                  </div>
                  
                  <p className={`${theme.text} line-clamp-2`}>
                    {entry.content}
                  </p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map(tagId => {
                        const tag = availableTags.find(t => t.id === tagId);
                        return tag ? (
                          <span 
                            key={tagId} 
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {tag.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              {filters.searchTerm || filters.tags.length > 0 ? 
                'No entries match your search criteria.' : 
                'You have no journal entries yet. Start writing to see entries here.'}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render single entry view
  const renderEntryView = () => {
    if (!viewingEntry) return null;
    
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={closeEntryView}
            className={`px-3 py-1 rounded-lg ${theme.background} ${theme.text} border ${theme.border}`}
          >
            ← Back
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => startEditingEntry(viewingEntry)}
              className={`px-3 py-1 rounded-lg ${theme.background} ${theme.text} border ${theme.border}`}
            >
              Edit
            </button>
            <button
              onClick={() => deleteEntry(viewingEntry.id)}
              className={`px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white`}
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${theme.textBold}`}>
              {viewingEntry.title}
            </h1>
            <p className={`${theme.text} text-sm`}>
              {formatDate(viewingEntry.timestamp)} at {formatTime(viewingEntry.timestamp)}
              {viewingEntry.updatedAt && (
                <span> • Updated: {formatDate(viewingEntry.updatedAt)}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center">
            <span className="text-2xl mr-2">
              {getMoodEmoji(viewingEntry.mood)}
            </span>
            <span className={`${theme.text}`}>
              {getMoodText(viewingEntry.mood)}
            </span>
          </div>
        </div>
        
        {viewingEntry.tags && viewingEntry.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {viewingEntry.tags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return tag ? (
                <span 
                  key={tagId} 
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {tag.label}
                </span>
              ) : null;
            })}
          </div>
        )}
        
        <div className={`${theme.text} whitespace-pre-line`}>
          {viewingEntry.content}
        </div>
      </div>
    );
  };
  
  // Render journal entry form
  const renderEntryForm = () => {
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>
          {editMode ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="entryTitle" className={`block font-medium ${theme.text} mb-1`}>
              Title
            </label>
            <input
              type="text"
              id="entryTitle"
              placeholder="Title your entry..."
              value={newEntry.title}
              onChange={handleTitleChange}
              className={`w-full p-3 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          
          <div>
            <label htmlFor="entryContent" className={`block font-medium ${theme.text} mb-1`}>
              Content
            </label>
            <textarea
              id="entryContent"
              placeholder="Write your thoughts..."
              value={newEntry.content}
              onChange={handleContentChange}
              rows="10"
              className={`w-full p-3 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="entryMood" className={`block font-medium ${theme.text} mb-1`}>
              Mood
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="entryMood"
                min="1"
                max="5"
                step="1"
                value={newEntry.mood}
                onChange={handleMoodChange}
                className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
              />
              <span className="text-2xl">
                {getMoodEmoji(newEntry.mood)}
              </span>
            </div>
            <div className={`text-sm ${theme.text} mt-1`}>
              {getMoodText(newEntry.mood)}
            </div>
          </div>
          
          <div>
            <label className={`block font-medium ${theme.text} mb-1`}>
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    newEntry.tags.includes(tag.id)
                      ? 'bg-indigo-500 text-white'
                      : `${theme.background} ${theme.text} border ${theme.border}`
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            {editMode && (
              <button
                onClick={cancelEditing}
                className={`px-4 py-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border}`}
              >
                Cancel
              </button>
            )}
            
            <button
              onClick={handleSubmitEntry}
              className={`px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors`}
            >
              {editMode ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render logic
  return (
    <div className="space-y-6">
      {/* If viewing an entry, show entry view */}
      {viewingEntry && renderEntryView()}
      
      {/* If not viewing an entry, show form if editing or creating, otherwise show entry list */}
      {!viewingEntry && (editMode || (!editMode && !editingEntryId && !viewingEntry)) && renderEntryForm()}
      
      {/* If not viewing an entry and not in edit mode, show entry list */}
      {!viewingEntry && !editMode && renderEntryList()}
    </div>
  );
};

export default Journal;