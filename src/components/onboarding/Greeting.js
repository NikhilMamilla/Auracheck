import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../shared/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Greeting = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, isDark } = useTheme();
    const [name, setName] = useState('');
    const [showQuestions, setShowQuestions] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [typedText, setTypedText] = useState('');
    const fullText = "Your journey to better mental wellness begins here";
    const typingSpeed = 40; // milliseconds per character
    const typingRef = useRef(null);

    const nextSteps = (location.state && location.state.flow) || ['dashboard'];
    const isAnonymous = (location.state && location.state.isAnonymous) || false;

    // Handle typing animation effect
    useEffect(() => {
        if (!showQuestions && typedText.length < fullText.length) {
            typingRef.current = setTimeout(() => {
                setTypedText(fullText.substring(0, typedText.length + 1));
            }, typingSpeed);
        }
        return () => clearTimeout(typingRef.current);
    }, [typedText, showQuestions]);

    // Handle user info and animation sequence
    useEffect(() => {
        const firstNameOnly = currentUser?.displayName?.split(' ')[0];
        if (firstNameOnly) {
            setName(firstNameOnly);
        }
        
        const mainTimer = setTimeout(() => {
            setShowQuestions(true);
            setTimeout(() => setAnimationComplete(true), 800);
        }, 3000); // Extended for typing animation to complete
        
        return () => {
            clearTimeout(mainTimer);
            clearTimeout(typingRef.current);
        };
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

    // Particle animation for background
    const Particles = () => {
        const particles = [];
        const count = 20;
        
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 6 + 2;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 5;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            particles.push(
                <div 
                    key={i}
                    className={`absolute rounded-full ${isDark ? 'bg-white' : 'bg-purple-500'} opacity-10`}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${posX}%`,
                        top: `${posY}%`,
                        animation: `float ${duration}s linear infinite`,
                        animationDelay: `${delay}s`
                    }}
                />
            );
        }
        
        return <>{particles}</>;
    };

    return (
        <div className={`min-h-screen ${theme.background} relative overflow-hidden flex items-center justify-center px-4 py-8`}>
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                {/* Gradient Orbs - Adjusted sizes for mobile */}
                <div className={`absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 ${isDark ? 'bg-blue-500/20' : 'bg-blue-300/30'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float`}></div>
                <div className={`absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 ${isDark ? 'bg-purple-500/20' : 'bg-purple-300/30'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-delayed`}></div>
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 ${isDark ? 'bg-pink-500/20' : 'bg-pink-300/30'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow`}></div>
                
                {/* Particle Effect */}
                <Particles />
                
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            </div>

            {/* Theme Toggle with improved styling */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Main Content with enhanced animations */}
            <div className="relative z-10 max-w-4xl w-full mx-auto perspective-1000">
                <AnimatePresence mode="wait">
                    {!showQuestions ? (
                        <motion.div
                            key="greeting"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, rotateY: 90 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`${theme.card} rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-6 md:p-10`}
                        >
                            <div className="text-center space-y-4 md:space-y-6">
                                {/* Animated emoji */}
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: [0, 15, 0, -15, 0] }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="inline-block p-4 md:p-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-4xl md:text-5xl mb-4 md:mb-8 shadow-lg"
                                >
                                    👋
                                </motion.div>
                                
                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className={`text-3xl md:text-5xl font-bold ${theme.textBold} mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                                >
                                    {name ? (
                                        <>Welcome to <span className="font-extrabold">AuraCheck</span>, {name}!</>
                                    ) : (
                                        <>Welcome to <span className="font-extrabold">AuraCheck</span>!</>
                                    )}
                                </motion.h1>
                                
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 1 }}
                                    className={`text-lg md:text-2xl ${theme.text} max-w-2xl mx-auto leading-relaxed`}
                                >
                                    {typedText}
                                    <span className="animate-blink ml-1">|</span>
                                </motion.p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="questions"
                            initial={{ opacity: 0, rotateY: -90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`${theme.card} rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-6 md:p-10`}
                        >
                            <div className="text-center mb-6 md:mb-10">
                                <motion.h2 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={`text-2xl md:text-4xl font-bold ${theme.textBold} mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                                >
                                    Let's Personalize Your Experience
                                </motion.h2>
                                
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className={`text-base md:text-xl ${theme.text} max-w-2xl mx-auto leading-relaxed mb-6 md:mb-10`}
                                >
                                    We'll create a unique wellness journey tailored just for you
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
                                {/* Feature Cards with improved visual effects */}
                                {[
                                    {
                                        icon: "✨",
                                        title: "Wellness Patterns",
                                        description: "Discover insights about your mental well-being journey",
                                        delay: 0
                                    },
                                    {
                                        icon: "🌱",
                                        title: "Growth Garden",
                                        description: "Nurture your personal wellness garden with daily practice",
                                        delay: 0.15
                                    },
                                    {
                                        icon: "🎯",
                                        title: "Smart Insights",
                                        description: "Get personalized recommendations based on your progress",
                                        delay: 0.3
                                    }
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: feature.delay + 0.5 }}
                                        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                                    >
                                        <div className={`${isDark ? 'bg-gray-800/80' : 'bg-white'} p-4 md:p-6 rounded-lg md:rounded-xl shadow-md md:shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} h-full group transition-all duration-300`}>
                                            <div className="text-4xl md:text-5xl mb-3 md:mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-3">{feature.icon}</div>
                                            <h3 className={`text-lg md:text-xl font-semibold ${theme.textBold} mb-1 md:mb-2 group-hover:text-blue-500 transition-colors`}>{feature.title}</h3>
                                            <p className={`${theme.text} text-sm md:text-base leading-relaxed`}>{feature.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                                className="px-4 md:px-0"
                            >
                                <button
                                    onClick={handleContinue}
                                    className={`w-full max-w-md mx-auto block py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl text-white font-semibold text-base md:text-lg 
                                    bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                                    transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                                    relative overflow-hidden group`}
                                    disabled={!animationComplete}
                                >
                                    <span className="relative z-10">Begin Your Journey</span>
                                    <span className="absolute inset-0 h-full w-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Enhanced Brand Watermark */}
            <div className="absolute bottom-4 left-4 z-50">
                <span className={`text-xs md:text-sm ${theme.text} opacity-70 font-medium tracking-wider`}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Aura</span>Check
                </span>
            </div>
        </div>
    );
};

export default Greeting;
