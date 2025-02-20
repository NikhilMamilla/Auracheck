import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './shared/ThemeToggle';

const LandingPage = () => {
    const navigate = useNavigate();
    const { theme, isDark } = useTheme();

    const handleGetStarted = () => {
        navigate('/signup', { state: { flow: ['questionnaire'] } });
    };

    const handleContinueJourney = () => {
        navigate('/login', { state: { flow: ['questionnaire'] } });
    };

    const handleTryAnonymously = () => {
        navigate('/questionnaire', { state: { isAnonymous: true } });
    };

    return (
        <div className={`min-h-screen overflow-x-hidden ${theme.background}`} role="main">
            {/* Background Design with Gradient Colors */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-200"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300"></div>
            </div>

            {/* Content */}
            <div className="relative min-h-screen">
                {/* Navigation */}
                <nav className={`${theme.nav} sticky top-0 z-50 backdrop-blur-sm bg-opacity-90`} role="navigation">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                AuraCheck
                            </div>

                            <div className="flex items-center space-x-4">
                                <ThemeToggle />
                                <button 
                                    onClick={handleGetStarted}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                                    aria-label="Get Started"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 max-w-4xl">
                        <h1 className={`text-4xl sm:text-5xl font-bold ${theme.textBold} mb-6 leading-tight`}>
                            Nurture Your Mental Well-being with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                                AuraCheck
                            </span>
                        </h1>
                        <p className={`text-lg sm:text-xl ${theme.text} max-w-2xl mx-auto leading-relaxed`}>
                            Your personal space for mental wellness. Track your journey and find peace of mind.
                        </p>
                    </div>

                    {/* Feature Cards - Three Column Layout */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
                        {/* Begin Journey Card */}
                        <button 
                            onClick={handleGetStarted}
                            className={`p-6 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                                isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'
                            }`}
                            aria-label="Begin your journey"
                        >
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className={`text-xl font-semibold ${theme.textBold} mb-2`}>Begin Journey</h3>
                            <p className={theme.text}>Start your personal wellness journey today</p>
                        </button>

                        {/* Continue Journey Card */}
                        <button 
                            onClick={handleContinueJourney}
                            className={`p-6 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                                isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'
                            }`}
                            aria-label="Continue your journey"
                        >
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                            <h3 className={`text-xl font-semibold ${theme.textBold} mb-2`}>Continue Journey</h3>
                            <p className={theme.text}>Return to your wellness journey</p>
                        </button>

                        {/* Try Anonymously Card */}
                        <button 
                            onClick={handleTryAnonymously}
                            className={`p-6 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                                isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'
                            }`}
                            aria-label="Try anonymously"
                        >
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className={`text-xl font-semibold ${theme.textBold} mb-2`}>Try Anonymously</h3>
                            <p className={theme.text}>Explore features without an account</p>
                        </button>
                    </div>

                    {/* Feature Info Section */}
                    <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-5xl w-full px-4 text-center">
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}>
                            <h3 className={`text-xl font-bold ${theme.textBold} mb-2`}>AI-Powered Analysis</h3>
                            <p className={theme.text}>Get personalized insights about your mental well-being</p>
                        </div>
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}>
                            <h3 className={`text-xl font-bold ${theme.textBold} mb-2`}>Private & Secure</h3>
                            <p className={theme.text}>Your data is protected and confidential</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
