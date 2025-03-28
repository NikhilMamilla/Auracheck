import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const Resources = () => {
  const { currentUser } = useAuth();
  const { userData, loading } = useUserData();
  const { theme, isDark } = useTheme();
  
  // State for resources
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedResources, setSavedResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('browse'); // 'browse', 'saved', 'resource'
  const [activeResource, setActiveResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local emergency resources
  const emergencyResources = [
    {
      id: 'crisis',
      title: 'Crisis Text Line',
      description: 'Text HOME to 741741 for free 24/7 crisis counseling.',
      phone: '741741',
      website: 'https://www.crisistextline.org/'
    },
    {
      id: 'suicide',
      title: 'National Suicide Prevention Lifeline',
      description: '24/7, free and confidential support for people in distress.',
      phone: '988',
      website: 'https://988lifeline.org/'
    },
    {
      id: 'domestic',
      title: 'National Domestic Violence Hotline',
      description: 'Talk with someone who is trained to help.',
      phone: '1-800-799-7233',
      website: 'https://www.thehotline.org/'
    }
  ];
  
  // Fetch resources from Firestore
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get all resource categories
        const categoriesSnapshot = await getDocs(collection(db, 'resourceCategories'));
        const categoriesData = [];
        
        categoriesSnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setCategories(categoriesData);
        
        // Get all resources
        const resourcesQuery = query(
          collection(db, 'resources'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const resourcesSnapshot = await getDocs(resourcesQuery);
        const resourcesData = [];
        
        resourcesSnapshot.forEach((doc) => {
          resourcesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setResources(resourcesData);
        
        // Get saved resources if user is logged in
        if (currentUser && userData && userData.savedResources) {
          setSavedResources(userData.savedResources || []);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [currentUser, userData]);
  
  // Handle saving a resource
  const handleSaveResource = async (resourceId) => {
    if (!currentUser) return;
    
    try {
      // Update user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userDocRef, {
        savedResources: arrayUnion(resourceId),
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      setSavedResources(prev => [...prev, resourceId]);
    } catch (err) {
      console.error('Error saving resource:', err);
      setError('Failed to save resource. Please try again.');
    }
  };
  
  // Handle removing a saved resource
  const handleRemoveSavedResource = async (resourceId) => {
    if (!currentUser) return;
    
    try {
      // Update user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userDocRef, {
        savedResources: arrayRemove(resourceId),
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      setSavedResources(prev => prev.filter(id => id !== resourceId));
    } catch (err) {
      console.error('Error removing saved resource:', err);
      setError('Failed to remove saved resource. Please try again.');
    }
  };
  
  // Handle resource selection
  const handleSelectResource = (resource) => {
    setActiveResource(resource);
    setActiveView('resource');
    window.scrollTo(0, 0);
  };
  
  // Handle back button in resource view
  const handleBackToResources = () => {
    setActiveResource(null);
    setActiveView('browse');
  };
  
  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter resources based on category and search term
  const getFilteredResources = () => {
    let filtered = [...resources];
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(resource => 
        resource.categories && resource.categories.includes(activeCategory)
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(term) || 
        resource.summary.toLowerCase().includes(term) ||
        (resource.content && resource.content.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };
  
  // Get saved resources data
  const getSavedResourcesData = () => {
    return resources.filter(resource => savedResources.includes(resource.id));
  };
  
  // Check if a resource is saved
  const isResourceSaved = (resourceId) => {
    return savedResources.includes(resourceId);
  };
  
  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Render browse resources view
  const renderBrowseResources = () => {
    const filteredResources = getFilteredResources();
    
    return (
      <div className="space-y-6">
        {/* Header and search */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className={`text-2xl font-bold ${theme.textBold}`}>Mental Health Resources</h1>
            
            <div className="flex mt-2 sm:mt-0 space-x-2">
              <button
                onClick={() => setActiveView('browse')}
                className={`px-3 py-1 rounded-lg text-sm ${activeView === 'browse' ? 'bg-indigo-600 text-white' : theme.button}`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveView('saved')}
                className={`px-3 py-1 rounded-lg text-sm ${activeView === 'saved' ? 'bg-indigo-600 text-white' : theme.button}`}
              >
                Saved ({savedResources.length})
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
              placeholder="Search resources..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`pl-10 pr-4 py-2 w-full rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-full text-xs ${
                activeCategory === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : `${theme.background} ${theme.text} border ${theme.border}`
              }`}
            >
              All Resources
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-1 rounded-full text-xs ${
                  activeCategory === category.id 
                    ? 'bg-indigo-600 text-white' 
                    : `${theme.background} ${theme.text} border ${theme.border}`
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Emergency resources */}
        <div className={`${theme.card} rounded-xl p-6 border-l-4 border-red-500`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Emergency Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyResources.map(resource => (
              <div key={resource.id} className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
                <h3 className={`font-medium ${theme.textBold}`}>{resource.title}</h3>
                <p className={`${theme.text} text-sm my-2`}>{resource.description}</p>
                <div className="flex flex-col space-y-2 mt-3">
                  <a 
                    href={`tel:${resource.phone}`} 
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {resource.phone}
                  </a>
                  <a 
                    href={resource.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Resource list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div>
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(resource => (
                  <div 
                    key={resource.id} 
                    className={`${theme.card} rounded-xl p-6 border ${theme.border} hover:border-indigo-300 transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <h2 
                        className={`text-lg font-bold ${theme.textBold} cursor-pointer hover:text-indigo-500`}
                        onClick={() => handleSelectResource(resource)}
                      >
                        {resource.title}
                      </h2>
                      
                      <button
                        onClick={() => isResourceSaved(resource.id) 
                          ? handleRemoveSavedResource(resource.id) 
                          : handleSaveResource(resource.id)
                        }
                        className={`p-2 rounded-full ${theme.background} hover:bg-gray-200 dark:hover:bg-gray-700`}
                        aria-label={isResourceSaved(resource.id) ? "Unsave resource" : "Save resource"}
                      >
                        {isResourceSaved(resource.id) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    {resource.categories && resource.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.categories.map(categoryId => (
                          <span 
                            key={categoryId} 
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {getCategoryName(categoryId)}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className={`${theme.text} mt-3 line-clamp-3`}>
                      {resource.summary}
                    </p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handleSelectResource(resource)}
                        className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                      >
                        Read more
                      </button>
                      
                      {resource.createdAt && (
                        <span className={`text-xs ${theme.text}`}>
                          {formatDate(resource.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${theme.card} rounded-xl p-6 text-center`}>
                <p className={theme.text}>
                  {searchTerm || activeCategory !== 'all' 
                    ? 'No resources match your search criteria.' 
                    : 'No resources available at the moment.'}
                </p>
                
                {(searchTerm || activeCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActiveCategory('all');
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render saved resources view
  const renderSavedResources = () => {
    const savedResourcesData = getSavedResourcesData();
    
    return (
      <div className="space-y-6">
        {/* Header and search */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className={`text-2xl font-bold ${theme.textBold}`}>Saved Resources</h1>
            
            <div className="flex mt-2 sm:mt-0 space-x-2">
              <button
                onClick={() => setActiveView('browse')}
                className={`px-3 py-1 rounded-lg text-sm ${activeView === 'browse' ? 'bg-indigo-600 text-white' : theme.button}`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveView('saved')}
                className={`px-3 py-1 rounded-lg text-sm ${activeView === 'saved' ? 'bg-indigo-600 text-white' : theme.button}`}
              >
                Saved ({savedResources.length})
              </button>
            </div>
          </div>
        </div>
        
        {/* Saved resources list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div>
            {savedResourcesData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedResourcesData.map(resource => (
                  <div 
                    key={resource.id} 
                    className={`${theme.card} rounded-xl p-6 border ${theme.border} hover:border-indigo-300 transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <h2 
                        className={`text-lg font-bold ${theme.textBold} cursor-pointer hover:text-indigo-500`}
                        onClick={() => handleSelectResource(resource)}
                      >
                        {resource.title}
                      </h2>
                      
                      <button
                        onClick={() => handleRemoveSavedResource(resource.id)}
                        className={`p-2 rounded-full ${theme.background} hover:bg-gray-200 dark:hover:bg-gray-700`}
                        aria-label="Unsave resource"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </button>
                    </div>
                    
                    {resource.categories && resource.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.categories.map(categoryId => (
                          <span 
                            key={categoryId} 
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {getCategoryName(categoryId)}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className={`${theme.text} mt-3 line-clamp-3`}>
                      {resource.summary}
                    </p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handleSelectResource(resource)}
                        className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                      >
                        Read more
                      </button>
                      
                      {resource.createdAt && (
                        <span className={`text-xs ${theme.text}`}>
                          {formatDate(resource.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${theme.card} rounded-xl p-6 text-center`}>
                <p className={theme.text}>You haven't saved any resources yet.</p>
                <button
                  onClick={() => setActiveView('browse')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Browse Resources
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render resource detail view
  const renderResourceDetail = () => {
    if (!activeResource) return null;
    
    return (
      <div className={`${theme.card} rounded-xl p-6`}>
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackToResources}
            className={`mr-3 p-2 rounded-full ${theme.background} hover:bg-gray-200 dark:hover:bg-gray-700`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className={`text-xl font-bold ${theme.textBold}`}>{activeResource.title}</h1>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-1">
            {activeResource.categories && activeResource.categories.map(categoryId => (
              <span 
                key={categoryId} 
                className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {getCategoryName(categoryId)}
              </span>
            ))}
          </div>
          
          <button
            onClick={() => isResourceSaved(activeResource.id) 
              ? handleRemoveSavedResource(activeResource.id) 
              : handleSaveResource(activeResource.id)
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
              isResourceSaved(activeResource.id)
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : `${theme.background} ${theme.text} border ${theme.border}`
            }`}
          >
            {isResourceSaved(activeResource.id) ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <span>Saved</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Save</span>
              </>
            )}
          </button>
        </div>
        
        {activeResource.summary && (
          <div className={`${theme.text} font-medium my-4`}>
            {activeResource.summary}
          </div>
        )}
        
        {activeResource.content && (
          <div className={`${theme.text} mt-6 prose dark:prose-invert max-w-none`} 
            dangerouslySetInnerHTML={{ __html: activeResource.content }}
          />
        )}
        
        {activeResource.links && activeResource.links.length > 0 && (
          <div className="mt-8">
            <h2 className={`text-lg font-bold ${theme.textBold} mb-3`}>Additional Resources</h2>
            <div className="space-y-2">
              {activeResource.links.map((link, index) => (
                <a 
                  key={index}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {activeResource.createdAt && (
          <div className={`text-xs ${theme.text} mt-8`}>
            Last updated: {formatDate(activeResource.createdAt)}
          </div>
        )}
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
      
      {activeView === 'resource' && activeResource 
        ? renderResourceDetail()
        : activeView === 'saved'
          ? renderSavedResources()
          : renderBrowseResources()
      }
    </div>
  );
};

export default Resources;