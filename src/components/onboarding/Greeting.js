import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../shared/ThemeToggle';

const Greeting = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, isDark } = useTheme();
    const [name, setName] = useState('');
    const [showQuestions, setShowQuestions] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);

    const nextSteps = (location.state && location.state.flow) || ['dashboard'];
    const isAnonymous = (location.state && location.state.isAnonymous) || false;

    useEffect(() => {
        if (currentUser && currentUser.displayName) {
            setName(currentUser.displayName);
        }
        const timer = setTimeout(() => {
            setShowQuestions(true);
            setTimeout(() => setAnimationComplete(true), 800);
        }, 1500);
        return () => clearTimeout(timer);
    }, [currentUser]);

    const handleContinue = () => {
        const nextStep = nextSteps[0] || 'dashboard';
        navigate(`/${nextStep}`, {
            state: {
                flow: nextSteps.slice(1),
                isAnonymous
            }
        });
    };

    return (
        <div className={`min-h-screen ${theme.background} relative overflow-hidden flex items-center justify-center`}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className={`absolute top-0 left-10 w-96 h-96 ${isDark ? 'bg-blue-500/30' : 'bg-blue-300/40'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float`}></div>
                    <div className={`absolute bottom-0 right-10 w-96 h-96 ${isDark ? 'bg-purple-500/30' : 'bg-purple-300/40'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float delay-150`}></div>
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${isDark ? 'bg-pink-500/30' : 'bg-pink-300/40'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float delay-300`}></div>
                </div>
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl w-full mx-4 perspective-1000">
                <div className={`${theme.card} rounded-2xl shadow-2xl transform transition-all duration-700 ${showQuestions ? 'rotate-y-180' : ''}`}>
                    {/* Initial Greeting Card - Front */}
                    <div className={`p-10 transition-all duration-700 ${showQuestions ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                        <div className="text-center space-y-6">
                            <div className="inline-block p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-4xl mb-6">👋</div>
                            <h1 className={`text-5xl font-bold ${theme.textBold} mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                                Welcome to AuraCheck {name ? `, ${name}` : ''}
                            </h1>
                            <p className={`text-2xl ${theme.text} max-w-2xl mx-auto leading-relaxed`}>
                                Your journey to better mental wellness begins here
                            </p>
                        </div>
                    </div>

                    {/* Questions Introduction Card - Back */}
                    <div className={`absolute inset-0 p-10 transition-all duration-700 rotate-y-180 ${showQuestions ? 'opacity-100 visible transform rotate-y-180' : 'opacity-0 invisible'}`}>
                        <div className="text-center mb-10">
                            <h2 className={`text-4xl font-bold ${theme.textBold} mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                                Let's Personalize Your Experience
                            </h2>
                            <p className={`text-xl ${theme.text} max-w-2xl mx-auto leading-relaxed mb-10`}>
                                We'll create a unique wellness journey tailored just for you
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {/* Feature Cards */}
                            <div className={`transform transition-all duration-500 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
                                    <div className="text-4xl mb-4">✨</div>
                                    <h3 className={`text-xl font-semibold ${theme.textBold} mb-2`}>Wellness Patterns</h3>
                                    <p className={`${theme.text}`}>Discover insights about your mental well-being journey</p>
                                </div>
                            </div>

                            <div className={`transform transition-all duration-500 delay-150 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
                                    <div className="text-4xl mb-4">🌱</div>
                                    <h3 className={`text-xl font-semibold ${theme.textBold} mb-2`}>Growth Garden</h3>
                                    <p className={`${theme.text}`}>Nurture your personal wellness garden</p>
                                </div>
                            </div>

                            <div className={`transform transition-all duration-500 delay-300 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
                                    <div className="text-4xl mb-4">🎯</div>
                                    <h3 className={`text-xl font-semibold ${theme.textBold} mb-2`}>Smart Insights</h3>
                                    <p className={`${theme.text}`}>Get personalized recommendations</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className={`w-full max-w-md mx-auto block py-4 px-8 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 ${animationComplete ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'} hover:shadow-lg active:scale-98 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
                            disabled={!animationComplete}
                        >
                            Begin Your Journey
                        </button>
                    </div>
                </div>
            </div>

            {/* Brand Watermark */}
            <div className="absolute bottom-6 left-6 z-50">
                <span className={`text-sm ${theme.text} opacity-70`}>AuraCheck</span>
            </div>
        </div>
    );
};

export default Greeting;