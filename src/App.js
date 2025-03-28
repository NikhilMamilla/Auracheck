import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPassword from './components/auth/ResetPassword';
import Greeting from './components/onboarding/Greeting';
import Questionnaire from './components/onboarding/Questionnaire';
import GeminiChatbot from './components/GeminiChatbot';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserDataProvider } from './context/UserDataContext';

function App() {
    const { currentUser } = useAuth();

    const RequireAuth = ({ children }) => {
        return currentUser ? children : <Navigate to="/login" />;
    };

    return (
        <AuthProvider>
            <ThemeProvider>
                <UserDataProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/greeting" element={
                            <RequireAuth>
                                <Greeting />
                            </RequireAuth>
                        } />
                        <Route path="/questionnaire" element={
                            <RequireAuth>
                                <Questionnaire />
                            </RequireAuth>
                        } />
                        <Route path="/dashboard" element={
                            <RequireAuth>
                                <Dashboard />
                            </RequireAuth>
                        } />
                        <Route path="/profile" element={
                            <RequireAuth>
                                <Profile />
                            </RequireAuth>
                        } />
                    </Routes>
                    <GeminiChatbot />
                </UserDataProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
