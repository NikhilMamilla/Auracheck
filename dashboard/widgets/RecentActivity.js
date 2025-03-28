// src/components/dashboard/widgets/RecentActivity.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUserData } from '../../../context/UserDataContext';
import { useTheme } from '../../../context/ThemeContext';

// Activity types
const ACTIVITY_TYPES = {
  MOOD: 'mood',
  SLEEP: 'sleep',
  STRESS: 'stress',
  JOURNAL: 'journal',
  COMMUNITY: 'community'
};

const RecentActivity = ({ 
  types = Object.values(ACTIVITY_TYPES),
  maxItems = 5,
  showTimestamp = true,
  onActivityClick = null
}) => {
  const { currentUser } = useAuth();
  const { 
    moodData, 
    sleepData, 
    stressData, 
    journalEntries,
    communityData,
    loading 
  } = useUserData();
  const { theme } = useTheme();
  
  // State for combined activities
  const [activities, setActivities] = useState([]);
  
  // Combine and sort activities when data changes
  useEffect(() => {
    if (loading) return;
    
    // Create combined list of activities
    const allActivities = [];
    
    // Add mood entries
    if (types.includes(ACTIVITY_TYPES.MOOD) && moodData && moodData.length > 0) {
      moodData.forEach(entry => {
        allActivities.push({
          type: ACTIVITY_TYPES.MOOD,
          timestamp: new Date(entry.timestamp),
          data: entry
        });
      });
    }
    
    // Add sleep entries
    if (types.includes(ACTIVITY_TYPES.SLEEP) && sleepData && sleepData.length > 0) {
      sleepData.forEach(entry => {
        allActivities.push({
          type: ACTIVITY_TYPES.SLEEP,
          timestamp: new Date(entry.timestamp),
          data: entry
        });
      });
    }
    
    // Add stress entries
    if (types.includes(ACTIVITY_TYPES.STRESS) && stressData && stressData.length > 0) {
      stressData.forEach(entry => {
        allActivities.push({
          type: ACTIVITY_TYPES.STRESS,
          timestamp: new Date(entry.timestamp),
          data: entry
        });
      });
    }
    
    // Add journal entries
    if (types.includes(ACTIVITY_TYPES.JOURNAL) && journalEntries && journalEntries.length > 0) {
      journalEntries.forEach(entry => {
        allActivities.push({
          type: ACTIVITY_TYPES.JOURNAL,
          timestamp: new Date(entry.timestamp),
          data: entry
        });
      });
    }
    
    // Add community activities
    if (types.includes(ACTIVITY_TYPES.COMMUNITY) && communityData) {
      // Add posts
      if (communityData.posts && communityData.posts.length > 0) {
        communityData.posts.forEach(post => {
          allActivities.push({
            type: ACTIVITY_TYPES.COMMUNITY,
            subtype: 'post',
            timestamp: new Date(post.timestamp),
            data: post
          });
        });
      }
      
      // Add comments
      if (communityData.comments && communityData.comments.length > 0) {
        communityData.comments.forEach(comment => {
          allActivities.push({
            type: ACTIVITY_TYPES.COMMUNITY,
            subtype: 'comment',
            timestamp: new Date(comment.timestamp),
            data: comment
          });
        });
      }
      
      // Add group joins
      if (communityData.joinedGroups && communityData.joinedGroups.length > 0) {
        communityData.joinedGroups.forEach(group => {
          if (group.joinedAt) {
            allActivities.push({
              type: ACTIVITY_TYPES.COMMUNITY,
              subtype: 'join',
              timestamp: new Date(group.joinedAt),
              data: group
            });
          }
        });
      }
    }
    
    // Sort activities by timestamp (newest first)
    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    
    // Limit to maxItems
    const limitedActivities = allActivities.slice(0, maxItems);
    
    setActivities(limitedActivities);
  }, [moodData, sleepData, stressData, journalEntries, communityData, types, maxItems, loading]);
  
  // Format timestamp relative to now
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Format date and time
  const formatDateTime = (timestamp) => {
    const options = { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: 'numeric'
    };
    return timestamp.toLocaleDateString(undefined, options);
  };
  
  // Get mood emoji
  const getMoodEmoji = (score) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '☹️';
    return '😢';
  };
  
  // Get stress emoji
  const getStressEmoji = (level) => {
    if (level <= 2) return '😌';
    if (level <= 4) return '🙂';
    if (level <= 6) return '😐';
    if (level <= 8) return '😟';
    return '😫';
  };
  
  // Get sleep quality
  const getSleepDurationQuality = (hours) => {
    if (hours < 5) return 'Too Little';
    if (hours < 6) return 'Poor';
    if (hours < 7) return 'Fair';
    if (hours <= 9) return 'Optimal';
    return 'Too Much';
  };
  
  // Get activity icon
  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case ACTIVITY_TYPES.MOOD:
        return getMoodEmoji(activity.data.score);
      case ACTIVITY_TYPES.SLEEP:
        return '💤';
      case ACTIVITY_TYPES.STRESS:
        return getStressEmoji(activity.data.level);
      case ACTIVITY_TYPES.JOURNAL:
        return '📓';
      case ACTIVITY_TYPES.COMMUNITY:
        if (activity.subtype === 'post') return '📢';
        if (activity.subtype === 'comment') return '💬';
        if (activity.subtype === 'join') return '👥';
        return '👥';
      default:
        return '📋';
    }
  };
  
  // Get activity title
  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case ACTIVITY_TYPES.MOOD:
        return `Mood: ${activity.data.score}/10`;
      case ACTIVITY_TYPES.SLEEP:
        return `Sleep: ${activity.data.hours} hours`;
      case ACTIVITY_TYPES.STRESS:
        return `Stress: ${activity.data.level}/10`;
      case ACTIVITY_TYPES.JOURNAL:
        return activity.data.title || 'Journal Entry';
      case ACTIVITY_TYPES.COMMUNITY:
        if (activity.subtype === 'post') return 'Posted in community';
        if (activity.subtype === 'comment') return 'Commented on post';
        if (activity.subtype === 'join') return `Joined ${activity.data.name || 'a group'}`;
        return 'Community activity';
      default:
        return 'Activity';
    }
  };
  
  // Get activity description
  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case ACTIVITY_TYPES.MOOD:
        return activity.data.notes || '';
      case ACTIVITY_TYPES.SLEEP:
        return getSleepDurationQuality(activity.data.hours);
      case ACTIVITY_TYPES.STRESS:
        return activity.data.notes || '';
      case ACTIVITY_TYPES.JOURNAL:
        // Truncate journal content
        return activity.data.content ? 
          (activity.data.content.length > 100 ? 
            `${activity.data.content.substring(0, 100)}...` : 
            activity.data.content) : 
          '';
      case ACTIVITY_TYPES.COMMUNITY:
        if (activity.subtype === 'post') return activity.data.content ? 
          (activity.data.content.length > 100 ? 
            `${activity.data.content.substring(0, 100)}...` : 
            activity.data.content) : 
          '';
        if (activity.subtype === 'comment') return activity.data.content ? 
          (activity.data.content.length > 100 ? 
            `${activity.data.content.substring(0, 100)}...` : 
            activity.data.content) : 
          '';
        if (activity.subtype === 'join') return `You joined ${activity.data.name || 'a group'}`;
        return '';
      default:
        return '';
    }
  };
  
  // Handle activity click
  const handleActivityClick = (activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };
  
  return (
    <div className={theme.card}>
      <div className="p-4">
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Recent Activity</h2>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div 
                key={`${activity.type}-${activity.timestamp.getTime()}-${index}`}
                className={`p-3 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
                onClick={() => handleActivityClick(activity)}
              >
                <div className="flex">
                  <div className="text-2xl mr-3 flex-shrink-0">
                    {getActivityIcon(activity)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <div className={`font-medium ${theme.textBold} truncate`}>
                        {getActivityTitle(activity)}
                      </div>
                      
                      {showTimestamp && (
                        <div className={`text-xs ${theme.text} ml-2 whitespace-nowrap`}>
                          {formatRelativeTime(activity.timestamp)}
                        </div>
                      )}
                    </div>
                    
                    {getActivityDescription(activity) && (
                      <div className={`${theme.text} text-sm mt-1 line-clamp-2`}>
                        {getActivityDescription(activity)}
                      </div>
                    )}
                    
                    {showTimestamp && (
                      <div className={`text-xs ${theme.text} mt-1`}>
                        {formatDateTime(activity.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-4 ${theme.text}`}>
            <p>No recent activity to display.</p>
            <p className="mt-2 text-sm">Start tracking your mood, sleep, and stress to see your activity here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export activity types for easy reference
export const ActivityTypes = ACTIVITY_TYPES;

export default RecentActivity;