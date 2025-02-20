import React, { createContext, useContext, useState, useEffect } from 'react';

const UserDataContext = createContext();

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserData = async (newData) => {
    try {
      setLoading(true);
      setError(null);
      
      // const newPredictions = await AIService.predictWellness(newData); // Remove this line
      
      setUserData(newData);
      // setPredictions(newPredictions); // Remove this line
    } catch (err) {
      setError('Failed to process user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserDataContext.Provider value={{
      userData,
      predictions,
      loading,
      error,
      updateUserData
    }}>
      {children}
    </UserDataContext.Provider>
  );
};
