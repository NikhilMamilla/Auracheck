import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const FAQ = () => {
  const { theme, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // FAQ categories
  const categories = [
    { id: 'general', label: 'General' },
    { id: 'account', label: 'Account' },
    { id: 'mood', label: 'Mood Tracking' },
    { id: 'sleep', label: 'Sleep Tracking' },
    { id: 'community', label: 'Community' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'technical', label: 'Technical Support' }
  ];
  
  // FAQ questions and answers
  const faqData = {
    general: [
      {
        id: 'gen1',
        question: 'What is AuraCheck?',
        answer: 'AuraCheck is a mental wellness platform designed to help you track your mood, sleep, and stress levels. Our goal is to provide tools and community support to improve your overall mental well-being.'
      },
      {
        id: 'gen2',
        question: 'Is AuraCheck free to use?',
        answer: 'AuraCheck offers a free basic plan with essential features. We also offer a premium subscription with additional features such as advanced analytics, extended history, and specialized tracking tools.'
      },
      {
        id: 'gen3',
        question: 'How can AuraCheck help with my mental health?',
        answer: 'AuraCheck helps you identify patterns in your mood, sleep, and stress levels. By tracking these metrics regularly, you can gain insights into what affects your mental wellness, develop better habits, and get support from our community of users on similar journeys.'
      },
      {
        id: 'gen4',
        question: 'Can AuraCheck replace therapy or medical treatment?',
        answer: 'No, AuraCheck is not a substitute for professional medical advice, diagnosis, or treatment. While our tools can complement your mental health journey, we always recommend consulting with healthcare professionals for any mental health concerns.'
      }
    ],
    account: [
      {
        id: 'acc1',
        question: 'How do I create an account?',
        answer: 'To create an account, click on the "Sign Up" button on our homepage. You can register using your email, or sign up with Google or Apple accounts for quicker access.'
      },
      {
        id: 'acc2',
        question: 'How do I reset my password?',
        answer: 'Click on "Login" and then select "Forgot Password". Enter your email address, and we\'ll send you instructions to reset your password.'
      },
      {
        id: 'acc3',
        question: 'Can I delete my account?',
        answer: 'Yes. Go to Privacy Settings in your profile and select "Request Account Deletion". Your data will be removed from our systems within 30 days of your request.'
      },
      {
        id: 'acc4',
        question: 'Can I change my username?',
        answer: 'Yes, you can change your username in the Profile section of your account settings. Usernames must be unique and between 3-20 characters.'
      }
    ],
    mood: [
      {
        id: 'mood1',
        question: 'How often should I track my mood?',
        answer: 'For best results, we recommend tracking your mood at least once daily. However, you can track as often as you find helpful, including multiple times throughout the day.'
      },
      {
        id: 'mood2',
        question: 'What do the mood scores mean?',
        answer: 'Our mood scale ranges from 1 to 10, where 1 represents feeling very low and 10 represents feeling excellent. The middle range (4-7) represents neutral to moderately positive moods.'
      },
      {
        id: 'mood3',
        question: 'How can I view my mood patterns?',
        answer: 'Go to the Mood Tracker section of your dashboard to see your mood history. You\'ll find daily, weekly, and monthly views, along with insights about your patterns and potential triggers.'
      },
      {
        id: 'mood4',
        question: 'Can I add notes to my mood entries?',
        answer: 'Yes, we encourage adding notes to your mood entries. This can help you identify specific events, thoughts, or activities that may influence your mood.'
      }
    ],
    sleep: [
      {
        id: 'sleep1',
        question: 'How does sleep tracking work?',
        answer: 'You can manually log your sleep hours, quality, and any notes about your sleep experience. If you use a compatible fitness tracker or smartwatch, you can also connect it to automatically import your sleep data.'
      },
      {
        id: 'sleep2',
        question: 'What sleep metrics does AuraCheck track?',
        answer: 'AuraCheck tracks sleep duration, quality rating, sleep schedule consistency, and allows you to note factors that may have affected your sleep, such as caffeine, screen time, or exercise.'
      },
      {
        id: 'sleep3',
        question: 'How can I improve my sleep based on the data?',
        answer: 'AuraCheck analyzes your sleep patterns and provides personalized recommendations to improve your sleep hygiene. We also offer guided meditations and sleep stories to help you fall asleep easier.'
      }
    ],
    community: [
      {
        id: 'comm1',
        question: 'How does the community feature work?',
        answer: 'Our community feature allows you to connect with others on similar wellness journeys. You can join groups based on specific interests or challenges, share experiences, and provide mutual support.'
      },
      {
        id: 'comm2',
        question: 'Is the community moderated?',
        answer: 'Yes, our community is actively moderated to ensure a supportive and safe environment. We have community guidelines that all members must follow, and our moderators help maintain a positive atmosphere.'
      },
      {
        id: 'comm3',
        question: 'Can I create my own group?',
        answer: 'Yes, premium users can create custom groups focused on specific mental wellness topics or interests. As a group creator, you can set privacy levels and moderation preferences.'
      },
      {
        id: 'comm4',
        question: 'How can I stay anonymous in the community?',
        answer: 'You can use a username instead of your real name and adjust your privacy settings to control what information is visible to others. You can participate in communities without sharing your personal tracking data.'
      }
    ],
    privacy: [
      {
        id: 'priv1',
        question: 'How is my mental health data protected?',
        answer: 'We take data security very seriously. All your data is encrypted both in transit and at rest. We employ industry-standard security measures and regular security audits to protect your information.'
      },
      {
        id: 'priv2',
        question: 'Who can see my mood tracking data?',
        answer: 'By default, your tracking data is private and only visible to you. You can choose to share certain aspects with healthcare providers, trusted contacts, or anonymously with the community through your privacy settings.'
      },
      {
        id: 'priv3',
        question: 'Does AuraCheck sell my data?',
        answer: 'No, we do not sell your personal data to third parties. We may use anonymized, aggregated data for research purposes or to improve our services, but only if you opt in to this in your privacy settings.'
      },
      {
        id: 'priv4',
        question: 'Can I download or delete all my data?',
        answer: 'Yes, you can request a complete export of your data at any time from your privacy settings. You can also request complete deletion of your data from our systems.'
      }
    ],
    technical: [
      {
        id: 'tech1',
        question: 'Which devices is AuraCheck compatible with?',
        answer: 'AuraCheck works on most modern web browsers, and we have native apps for iOS and Android devices. For sleep tracking, we integrate with popular fitness trackers including Fitbit, Garmin, and Apple Watch.'
      },
      {
        id: 'tech2',
        question: 'Why isn\'t the app working properly on my device?',
        answer: 'Please ensure your app and device are updated to the latest versions. If problems persist, try clearing the app cache or reinstalling the app. For specific issues, please contact our support team with details about your device and the problem you\'re experiencing.'
      },
      {
        id: 'tech3',
        question: 'Can I use AuraCheck offline?',
        answer: 'The mobile apps have limited offline functionality, allowing you to log entries when not connected to the internet. These entries will sync with your account once you\'re back online.'
      },
      {
        id: 'tech4',
        question: 'How do I report a bug or request a feature?',
        answer: 'You can report bugs or suggest features through the "Feedback" option in your settings menu, or by contacting our support team at support@auracheck.com.'
      }
    ]
  };
  
  // Toggle question expansion
  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  
  // Filter questions based on search query
  const getFilteredQuestions = () => {
    if (!searchQuery.trim()) {
      return faqData[activeCategory] || [];
    }
    
    const query = searchQuery.toLowerCase();
    
    // Search across all categories
    return Object.values(faqData)
      .flat()
      .filter(item => 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query)
      );
  };
  
  const filteredQuestions = getFilteredQuestions();
  
  return (
    <div className={`p-6 ${theme.background}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
            Frequently Asked Questions
          </h1>
          <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} max-w-2xl mx-auto`}>
            Find answers to common questions about AuraCheck and how to make the most of your mental wellness journey.
          </p>
          
          {/* Search bar */}
          <div className="mt-6 relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Categories navigation - only show when not searching */}
        {!searchQuery && (
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 min-w-max pb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* FAQ listing */}
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((item) => (
              <div key={item.id} className={`transition-all duration-200 ${expandedQuestions[item.id] ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                <button
                  onClick={() => toggleQuestion(item.id)}
                  className="flex justify-between items-start w-full px-6 py-4 text-left"
                >
                  <h3 className={`font-medium pr-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.question}
                  </h3>
                  <span className={`flex-shrink-0 ml-2 ${expandedQuestions[item.id] ? 'transform rotate-180' : ''} transition-transform duration-200`}>
                    <svg className={`w-5 h-5 ${expandedQuestions[item.id] ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </button>{expandedQuestions[item.id] && (
  <div className={`px-6 pb-4 ${theme.textMuted || 'text-gray-600 dark:text-gray-300'}`}>
    <p className="whitespace-pre-line">{item.answer}</p>
    
    {/* Additional helpful links or related info */}
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Was this helpful?</p>
      <div className="mt-2 flex space-x-2">
        <button className="px-4 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
          Yes
        </button>
        <button className="px-4 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          No
        </button>
      </div>
    </div>
  </div>
)}
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className={`mt-2 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No results found</h3>
              <p className={`mt-1 ${theme.textMuted || 'text-gray-500 dark:text-gray-400'}`}>
                We couldn't find any questions matching your search. Try different keywords or browse by category.
              </p>
              <div className="mt-6">
                <button 
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Still need help section */}
        <div className={`mt-12 rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} p-6 shadow-sm text-center`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Still Have Questions?
          </h2>
          <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mb-6 max-w-xl mx-auto`}>
            If you couldn't find the answer you were looking for, our support team is here to help you with any questions about AuraCheck.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a 
              href="#" 
              className="px-6 py-3 rounded-full font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 transform hover:scale-105"
            >
              Contact Support
            </a>
            <a 
              href="#" 
              className="px-6 py-3 rounded-full font-medium border border-indigo-500 text-indigo-600 dark:text-indigo-400 transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              View Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;