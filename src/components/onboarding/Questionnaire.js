import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ThemeToggle from '../shared/ThemeToggle';
import { motion } from 'framer-motion';

const questions = [
    {
        id: 'age',
        question: "What's your age?",
        description: "Your age helps us provide age-appropriate recommendations",
        type: 'number',
        min: 18,
        max: 100,
        placeholder: 'Enter your age (18-100)',
        icon: '👤'
    },
    {
        id: 'sleep',
        question: 'How many hours do you usually sleep per day?',
        description: "Understanding your sleep pattern helps us assess your rest cycle",
        type: 'number',
        min: 0,
        max: 24,
        placeholder: 'Enter sleep hours (0-24)',
        icon: '😴'
    },
    {
        id: 'employment',
        question: 'What is your employment status?',
        description: "Your work life can impact your mental wellness",
        type: 'select',
        options: [
            { id: 1, label: 'Full Time' },
            { id: 2, label: 'Part Time' },
            { id: 3, label: 'Student' },
            { id: 4, label: 'Retired' }
        ],
        icon: '💼'
    },
    {
        id: 'physical_health',
        question: 'In the past month, how many days did you experience physical health issues?',
        description: "Physical health often correlates with mental well-being",
        type: 'number',
        min: 0,
        max: 31,
        placeholder: 'Enter number of days (0-31)',
        icon: '🏃‍♂️'
    },
    {
        id: 'mental_health',
        question: 'In the past month, how many days did you feel mentally unwell?',
        description: "This helps us understand your current mental state",
        type: 'number',
        min: 0,
        max: 31,
        placeholder: 'Enter number of days (0-31)',
        icon: '🧠'
    },
    {
        id: 'stress',
        question: 'On a scale of 1-10, how would you rate your current stress level?',
        description: "1 being very low stress, 10 being extremely stressed",
        type: 'slider',
        min: 1,
        max: 10,
        placeholder: 'Enter stress level (1-10)',
        icon: '😰'
    },
    {
        id: 'habits',
        question: 'Do you have any of these habits?',
        description: "Understanding your lifestyle helps us provide better guidance",
        type: 'multiselect',
        options: [
            { id: 'smoking', label: 'Smoking' },
            { id: 'drinking', label: 'Regular Drinking' },
            { id: 'none', label: 'None of the above' }
        ],
        icon: '🔄'
    }
];

const Questionnaire = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [direction, setDirection] = useState('next');
    const { theme, isDark } = useTheme();

    const currentQ = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;
    
    // Set initial value for slider
    useEffect(() => {
        if (currentQ.type === 'slider' && !answers[currentQ.id]) {
            setAnswers(prev => ({
                ...prev,
                [currentQ.id]: 5 // Default middle value
            }));
        }
    }, [currentQuestion, currentQ.id, currentQ.type, answers]);

    const handleInputChange = (value) => {
        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: value
        }));
        setError('');
    };

    const validateAnswer = () => {
        const currentAnswer = answers[currentQ.id];

        if (currentQ.type === 'number') {
            const num = Number(currentAnswer);
            if (isNaN(num) || num < currentQ.min || num > currentQ.max) {
                setError(`Please enter a number between ${currentQ.min} and ${currentQ.max}`);
                return false;
            }
        } else if (currentQ.type === 'select' && !currentAnswer) {
            setError('Please select an option');
            return false;
        } else if (currentQ.type === 'multiselect') {
            // Check if at least one option is selected
            const hasSelection = currentQ.options.some(option => 
                answers[option.id] === 1
            );
            
            if (!hasSelection) {
                setError('Please select at least one option');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateAnswer()) {
            setDirection('next');
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setDirection('prev');
        setCurrentQuestion(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        if (!validateAnswer()) return;

        try {
            setLoading(true);
            setError(null);

            // Save answers to Firestore
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, {
                questionnaire_answers: answers,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { merge: true });

            // Navigate to dashboard
            navigate('/dashboard', {
                state: { answers }
            });
        } catch (error) {
            setError('Failed to save your answers. Please try again.');
            console.error('Error saving questionnaire answers:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Animation variants
    const variants = {
        enter: (direction) => {
            return {
                x: direction === 'next' ? 500 : -500,
                opacity: 0
            };
        },
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => {
            return {
                x: direction === 'next' ? -500 : 500,
                opacity: 0
            };
        }
    };

    // Render slider component
    const renderSlider = () => {
        return (
            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className={`text-xs ${theme.text}`}>{i + 1}</span>
                    ))}
                </div>
                <input
                    type="range"
                    min={currentQ.min}
                    max={currentQ.max}
                    value={answers[currentQ.id] || 5}
                    onChange={(e) => handleInputChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="mt-4 text-center">
                    <span className={`text-2xl font-bold ${theme.textBold}`}>{answers[currentQ.id] || 5}</span>
                    <p className={`${theme.text} mt-2`}>
                        {answers[currentQ.id] <= 3 ? 'Low stress levels' : 
                         answers[currentQ.id] <= 7 ? 'Moderate stress levels' : 
                         'High stress levels'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${theme.background}`}>
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300"></div>
                <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float delay-500"></div>
            </div>

            {/* Center the content */}
            <div className="min-h-screen flex items-center justify-center px-4">
                {/* Content */}
                <div className="relative z-10 max-w-2xl w-full">
                    <div className={`${theme.card} p-8 rounded-2xl shadow-xl`}>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-in-out" 
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Question Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                {currentQ.icon}
                            </div>
                        </div>

                        {/* Question Section */}
                        <motion.div
                            key={currentQuestion}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="mb-8"
                        >
                            <h2 className={`text-2xl font-semibold mb-2 ${theme.textBold} text-center`}>{currentQ.question}</h2>
                            <p className={`${theme.text} text-center`}>{currentQ.description}</p>
                        </motion.div>

                        {/* Answer Section */}
                        <motion.div
                            key={`answer-${currentQuestion}`}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                delay: 0.1,
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="space-y-4"
                        >
                            {currentQ.type === 'number' ? (
                                <input
                                    type="number"
                                    min={currentQ.min}
                                    max={currentQ.max}
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                                    placeholder={currentQ.placeholder}
                                />
                            ) : currentQ.type === 'select' ? (
                                <div className="grid gap-3">
                                    {currentQ.options.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleInputChange(option.id)}
                                            className={`w-full p-4 rounded-xl border transition-all duration-300 ${answers[currentQ.id] === option.id ? isDark ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-blue-500 bg-blue-50' : isDark ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            ) : currentQ.type === 'slider' ? (
                                renderSlider()
                            ) : (
                                <div className="grid gap-3">
                                    {currentQ.options.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${answers[option.id] ? isDark ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-blue-500 bg-blue-50' : isDark ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={option.id === 'none' ? answers.none === 1 : answers[option.id] === 1}
                                                onChange={(e) => {
                                                    if (option.id === 'none') {
                                                        // If "None" is selected, clear other selections
                                                        setAnswers(prev => ({
                                                            ...prev,
                                                            none: e.target.checked ? 1 : 0,
                                                            smoking: e.target.checked ? 0 : prev.smoking || 0,
                                                            drinking: e.target.checked ? 0 : prev.drinking || 0
                                                        }));
                                                    } else {
                                                        // If other option is selected, uncheck "None"
                                                        setAnswers(prev => ({
                                                            ...prev,
                                                            [option.id]: e.target.checked ? 1 : 0,
                                                            none: 0 // Uncheck none
                                                        }));
                                                    }
                                                }}
                                                className="mr-3 h-5 w-5 accent-indigo-600"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {error && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </motion.div>

                        {/* Navigation */}
                        <div className="mt-8 flex justify-between items-center">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : theme.text + ' hover:' + theme.textBold}`}
                            >
                                {currentQuestion !== 0 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                                Previous
                            </button>

                            <span className={`${theme.text} text-sm`}>
                                Question {currentQuestion + 1} of {questions.length}
                            </span>

                            {isLastQuestion ? (
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={loading} 
                                    className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all duration-300 flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            Submit
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleNext} 
                                    className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all duration-300 flex items-center"
                                >
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
