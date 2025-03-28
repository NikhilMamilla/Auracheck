// src/components/dashboard/widgets/QuickEntry.js
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUserData } from '../../../context/UserDataContext';
import { useTheme } from '../../../context/ThemeContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

// Entry types
const ENTRY_TYPES = {
  MOOD: 'mood',
  SLEEP: 'sleep',
  STRESS: 'stress',
  ACTIVITY: 'activity',
  JOURNAL: 'journal'
};

const QuickEntry = ({ 
  types = [ENTRY_TYPES.MOOD, ENTRY_TYPES.SLEEP, ENTRY_TYPES.STRESS], 
  compact = false,
  onEntrySubmitted = null
}) => {
  const { currentUser } = useAuth();
  const { 
    addMoodEntry, 
    addSleepEntry, 
    addStressEntry,
    addJournalEntry,
    loading 
  } = useUserData();
  const { theme } = useTheme();
  
  // State for entry values
  const [entryValues, setEntryValues] = useState({
    [ENTRY_TYPES.MOOD]: 5,
    [ENTRY_TYPES.SLEEP]: 7,
    [ENTRY_TYPES.STRESS]: 5,
    [ENTRY_TYPES.ACTIVITY]: '',
    [ENTRY_TYPES.JOURNAL]: {
      title: '',
      content: '',
      mood: 5
    }
  });
  
  // State for active tab (only used in compact mode)
  const [activeTab, setActiveTab] = useState(types[0] || ENTRY_TYPES.MOOD);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState({
    [ENTRY_TYPES.MOOD]: false,
    [ENTRY_TYPES.SLEEP]: false,
    [ENTRY_TYPES.STRESS]: false,
    [ENTRY_TYPES.ACTIVITY]: false,
    [ENTRY_TYPES.JOURNAL]: false
  });
  
  // Success states
  const [entrySuccess, setEntrySuccess] = useState({
    [ENTRY_TYPES.MOOD]: false,
    [ENTRY_TYPES.SLEEP]: false,
    [ENTRY_TYPES.STRESS]: false,
    [ENTRY_TYPES.ACTIVITY]: false,
    [ENTRY_TYPES.JOURNAL]: false
  });
  
  // Get mood emoji
  const getMoodEmoji = (value) => {
    if (value >= 9) return '😄';
    if (value >= 7) return '🙂';
    if (value >= 5) return '😐';
    if (value >= 3) return '☹️';
    return '😢';
  };
  
  // Get stress emoji
  const getStressEmoji = (value) => {
    if (value <= 2) return '😌';
    if (value <= 4) return '🙂';
    if (value <= 6) return '😐';
    if (value <= 8) return '😟';
    return '😫';
  };
  
  // Get sleep quality text
  const getSleepDurationQuality = (hours) => {
    if (hours < 5) return 'Too Little';
    if (hours < 6) return 'Poor';
    if (hours < 7) return 'Fair';
    if (hours <= 9) return 'Optimal';
    return 'Too Much';
  };
  
  // Handle value changes
  const handleValueChange = (type, value) => {
    if (type === ENTRY_TYPES.JOURNAL) {
      setEntryValues(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          ...value
        }
      }));
    } else {
      setEntryValues(prev => ({
        ...prev,
        [type]: value
      }));
    }
    
    // Reset success state when value changes
    if (entrySuccess[type]) {
      setEntrySuccess(prev => ({
        ...prev,
        [type]: false
      }));
    }
  };
  
  // Submit entry
  const handleSubmit = async (type) => {
    if (!currentUser) return;
    
    // Set submitting state
    setIsSubmitting(prev => ({
      ...prev,
      [type]: true
    }));
    
    try {
      switch (type) {
        case ENTRY_TYPES.MOOD:
          await addMoodEntry(entryValues[type]);
          break;
        case ENTRY_TYPES.SLEEP:
          await addSleepEntry(entryValues[type]);
          break;
        case ENTRY_TYPES.STRESS:
          await addStressEntry(entryValues[type]);
          break;
        case ENTRY_TYPES.JOURNAL:
          const journalEntry = {
            title: entryValues[type].title || 'Quick entry',
            content: entryValues[type].content,
            mood: entryValues[type].mood
          };
          await addJournalEntry(journalEntry);
          // Reset journal fields
          setEntryValues(prev => ({
            ...prev,
            [type]: {
              title: '',
              content: '',
              mood: 5
            }
          }));
          break;
        default:
          break;
      }
      
      // Update last activity in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        lastActive: serverTimestamp()
      });
      
      // Set success state
      setEntrySuccess(prev => ({
        ...prev,
        [type]: true
      }));
      
      // Call onEntrySubmitted callback if provided
      if (onEntrySubmitted) {
        onEntrySubmitted(type, entryValues[type]);
      }
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setEntrySuccess(prev => ({
          ...prev,
          [type]: false
        }));
      }, 3000);
    } catch (error) {
      console.error(`Error submitting ${type} entry:`, error);
    } finally {
      // Reset submitting state
      setIsSubmitting(prev => ({
        ...prev,
        [type]: false
      }));
    }
  };
  
  // Render mood entry form
  const renderMoodEntry = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor="quickMood" className={`block font-medium ${theme.text}`}>
          How are you feeling right now?
        </label>
        <span className="text-2xl">{getMoodEmoji(entryValues[ENTRY_TYPES.MOOD])}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="range"
          id="quickMood"
          min="1"
          max="10"
          step="1"
          value={entryValues[ENTRY_TYPES.MOOD]}
          onChange={(e) => handleValueChange(ENTRY_TYPES.MOOD, parseInt(e.target.value))}
          className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
        />
        <span className={`${theme.text} font-bold text-xl min-w-[2rem] text-center`}>
          {entryValues[ENTRY_TYPES.MOOD]}
        </span>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Bad</span>
        <span>Neutral</span>
        <span>Great</span>
      </div>
      
      <button
        onClick={() => handleSubmit(ENTRY_TYPES.MOOD)}
        disabled={isSubmitting[ENTRY_TYPES.MOOD] || loading}
        className={`mt-2 w-full py-2 rounded-lg ${
          entrySuccess[ENTRY_TYPES.MOOD]
            ? 'bg-green-500 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        } transition-colors ${
          isSubmitting[ENTRY_TYPES.MOOD] || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting[ENTRY_TYPES.MOOD]
          ? 'Saving...'
          : entrySuccess[ENTRY_TYPES.MOOD]
            ? 'Saved!'
            : 'Log Mood'
        }
      </button>
    </div>
  );
  
  // Render sleep entry form
  const renderSleepEntry = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor="quickSleep" className={`block font-medium ${theme.text}`}>
          How many hours did you sleep?
        </label>
        <span className="text-2xl">💤</span>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="range"
          id="quickSleep"
          min="0"
          max="12"
          step="0.5"
          value={entryValues[ENTRY_TYPES.SLEEP]}
          onChange={(e) => handleValueChange(ENTRY_TYPES.SLEEP, parseFloat(e.target.value))}
          className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
        />
        <span className={`${theme.text} font-bold text-xl min-w-[2.5rem] text-center`}>
          {entryValues[ENTRY_TYPES.SLEEP]}
        </span>
      </div>
      
      <div className={`text-sm ${theme.text} text-center`}>
        Quality: {getSleepDurationQuality(entryValues[ENTRY_TYPES.SLEEP])}
      </div>
      
      <button
        onClick={() => handleSubmit(ENTRY_TYPES.SLEEP)}
        disabled={isSubmitting[ENTRY_TYPES.SLEEP] || loading}
        className={`mt-2 w-full py-2 rounded-lg ${
          entrySuccess[ENTRY_TYPES.SLEEP]
            ? 'bg-green-500 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        } transition-colors ${
          isSubmitting[ENTRY_TYPES.SLEEP] || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting[ENTRY_TYPES.SLEEP]
          ? 'Saving...'
          : entrySuccess[ENTRY_TYPES.SLEEP]
            ? 'Saved!'
            : 'Log Sleep'
        }
      </button>
    </div>
  );
  
  // Render stress entry form
  const renderStressEntry = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor="quickStress" className={`block font-medium ${theme.text}`}>
          What's your current stress level?
        </label>
        <span className="text-2xl">{getStressEmoji(entryValues[ENTRY_TYPES.STRESS])}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="range"
          id="quickStress"
          min="1"
          max="10"
          step="1"
          value={entryValues[ENTRY_TYPES.STRESS]}
          onChange={(e) => handleValueChange(ENTRY_TYPES.STRESS, parseInt(e.target.value))}
          className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
        />
        <span className={`${theme.text} font-bold text-xl min-w-[2rem] text-center`}>
          {entryValues[ENTRY_TYPES.STRESS]}
        </span>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Calm</span>
        <span>Moderate</span>
        <span>Stressed</span>
      </div>
      
      <button
        onClick={() => handleSubmit(ENTRY_TYPES.STRESS)}
        disabled={isSubmitting[ENTRY_TYPES.STRESS] || loading}
        className={`mt-2 w-full py-2 rounded-lg ${
          entrySuccess[ENTRY_TYPES.STRESS]
            ? 'bg-green-500 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        } transition-colors ${
          isSubmitting[ENTRY_TYPES.STRESS] || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting[ENTRY_TYPES.STRESS]
          ? 'Saving...'
          : entrySuccess[ENTRY_TYPES.STRESS]
            ? 'Saved!'
            : 'Log Stress'
        }
      </button>
    </div>
  );
  
  // Render journal quick entry
  const renderJournalEntry = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor="quickJournalTitle" className={`block font-medium ${theme.text}`}>
          Quick Journal Entry
        </label>
        <span className="text-2xl">📝</span>
      </div>
      
      <input
        type="text"
        id="quickJournalTitle"
        placeholder="Title (optional)"
        value={entryValues[ENTRY_TYPES.JOURNAL].title}
        onChange={(e) => handleValueChange(ENTRY_TYPES.JOURNAL, { title: e.target.value })}
        className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      />
      
      <textarea
        id="quickJournalContent"
        placeholder="What's on your mind today?"
        value={entryValues[ENTRY_TYPES.JOURNAL].content}
        onChange={(e) => handleValueChange(ENTRY_TYPES.JOURNAL, { content: e.target.value })}
        rows="4"
        className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      ></textarea>
      
      <div className="flex items-center gap-2">
        <span className={`text-sm ${theme.text}`}>Mood:</span>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={entryValues[ENTRY_TYPES.JOURNAL].mood}
          onChange={(e) => handleValueChange(ENTRY_TYPES.JOURNAL, { mood: parseInt(e.target.value) })}
          className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
        />
        <span className="text-xl">
          {getMoodEmoji(entryValues[ENTRY_TYPES.JOURNAL].mood)}
        </span>
      </div>
      
      <button
        onClick={() => handleSubmit(ENTRY_TYPES.JOURNAL)}
        disabled={isSubmitting[ENTRY_TYPES.JOURNAL] || !entryValues[ENTRY_TYPES.JOURNAL].content || loading}
        className={`mt-2 w-full py-2 rounded-lg ${
          entrySuccess[ENTRY_TYPES.JOURNAL]
            ? 'bg-green-500 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        } transition-colors ${
          isSubmitting[ENTRY_TYPES.JOURNAL] || !entryValues[ENTRY_TYPES.JOURNAL].content || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting[ENTRY_TYPES.JOURNAL]
          ? 'Saving...'
          : entrySuccess[ENTRY_TYPES.JOURNAL]
            ? 'Saved!'
            : 'Save Entry'
        }
      </button>
    </div>
  );
  
  // Render compact mode (tabbed interface)
  const renderCompactMode = () => (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        {types.map(type => (
          <button
            key={type}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === type 
                ? `${theme.textBold} border-b-2 border-indigo-500` 
                : `${theme.text} hover:${theme.textBold}`
            }`}
            onClick={() => setActiveTab(type)}
          >
            {type === ENTRY_TYPES.MOOD && 'Mood'}
            {type === ENTRY_TYPES.SLEEP && 'Sleep'}
            {type === ENTRY_TYPES.STRESS && 'Stress'}
            {type === ENTRY_TYPES.JOURNAL && 'Journal'}
          </button>
        ))}
      </div>
      
      {activeTab === ENTRY_TYPES.MOOD && renderMoodEntry()}
      {activeTab === ENTRY_TYPES.SLEEP && renderSleepEntry()}
      {activeTab === ENTRY_TYPES.STRESS && renderStressEntry()}
      {activeTab === ENTRY_TYPES.JOURNAL && renderJournalEntry()}
    </div>
  );
  
  // Render expanded mode (all forms visible)
  const renderExpandedMode = () => (
    <div className="space-y-6">
      {types.includes(ENTRY_TYPES.MOOD) && (
        <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
          {renderMoodEntry()}
        </div>
      )}
      
      {types.includes(ENTRY_TYPES.SLEEP) && (
        <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
          {renderSleepEntry()}
        </div>
      )}
      
      {types.includes(ENTRY_TYPES.STRESS) && (
        <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
          {renderStressEntry()}
        </div>
      )}
      
      {types.includes(ENTRY_TYPES.JOURNAL) && (
        <div className={`p-4 rounded-lg ${theme.background} border ${theme.border}`}>
          {renderJournalEntry()}
        </div>
      )}
    </div>
  );
  
  return (
    <div className={theme.card}>
      <div className="p-4">
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Quick Entry</h2>
        
        {compact ? renderCompactMode() : renderExpandedMode()}
      </div>
    </div>
  );
};

// Export entry types for easy reference
export const QuickEntryTypes = ENTRY_TYPES;

export default QuickEntry;