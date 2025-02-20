import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ThemeToggle from '../shared/ThemeToggle';

const questions = [
    {
        id: 'age',
        question: "What's your age?",
        description: "Your age helps us provide age-appropriate recommendations",
        type: 'number',
        min: 18,
        max: 100,
        placeholder: 'Enter your age (18-100)'
    },
    {
        id: 'sleep',
        question: 'How many hours do you usually sleep per day?',
        description: "Understanding your sleep pattern helps us assess your rest cycle",
        type: 'number',
        min: 0,
        max: 24,
        placeholder: 'Enter sleep hours (0-24)'
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
        ]
    },
    {
        id: 'physical_health',
        question: 'In the past month, how many days did you experience physical health issues?',
        description: "Physical health often correlates with mental well-being",
        type: 'number',
        min: 0,
        max: 31,
        placeholder: 'Enter number of days (0-31)'
    },
    {
        id: 'mental_health',
        question: 'In the past month, how many days did you feel mentally unwell?',
        description: "This helps us understand your current mental state",
        type: 'number',
        min: 0,
        max: 31,
        placeholder: 'Enter number of days (0-31)'
    },
    {
        id: 'stress',
        question: 'On a scale of 1-10, how would you rate your current stress level?',
        description: "1 being very low stress, 10 being extremely stressed",
        type: 'number',
        min: 1,
        max: 10,
        placeholder: 'Enter stress level (1-10)'
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
        ]
    }
];

const Questionnaire = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { theme, isDark } = useTheme();

    const currentQ = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;

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
        }
        return true;
    };

    const handleNext = () => {
        if (validateAnswer()) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
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

    return (
        <div className={`min-h-screen ${theme.background}`}>
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Background Animation */}
            <div className="absolute inset-0">
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300"></div>
            </div>

            {/* Center the content */}
            <div className="min-h-screen flex items-center justify-center px-4">
                {/* Content */}
                <div className="relative z-10 max-w-2xl w-full">
                    <div className={`${theme.card} p-8 rounded-2xl`}>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
                        </div>

                        {/* Question Section */}
                        <div className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-2 ${theme.textBold}`}>{currentQ.question}</h2>
                            <p className={theme.text}>{currentQ.description}</p>
                        </div>

                        {/* Answer Section */}
                        <div className="space-y-4">
                            {currentQ.type === 'number' ? (
                                <input
                                    type="number"
                                    min={currentQ.min}
                                    max={currentQ.max}
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                                                        // If "None" is selected, only update habit-related answers
                                                        setAnswers(prev => ({
                                                            ...prev,
                                                            none: e.target.checked ? 1 : 0,
                                                            smoking: e.target.checked ? 0 : prev.smoking || 0,
                                                            drinking: e.target.checked ? 0 : prev.drinking || 0
                                                        }));
                                                    } else {
                                                        // If other option is selected, uncheck "None"
                                                        setAnswers(prev => ({
                                                            none: 0,
                                                            [option.id]: e.target.checked ? 1 : 0
                                                        }));
                                                    }
                                                }}
                                                className="mr-3"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex justify-between items-center">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className={`px-6 py-2 rounded-lg transition-colors ${currentQuestion === 0 ? 'text-slate-400 cursor-not-allowed' : theme.text + ' hover:' + theme.textBold}`}
                            >
                                Previous
                            </button>

                            <span className={theme.text}>
                                Question {currentQuestion + 1} of {questions.length}
                            </span>

                            {isLastQuestion ? (
                                <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 rounded-lg text-white btn-gradient hover:shadow-lg transition-all duration-300">
                                    {loading ? "Analyzing..." : "Submit"}
                                </button>
                            ) : (
                                <button onClick={handleNext} className="px-6 py-2 rounded-lg text-white btn-gradient hover:shadow-lg transition-all duration-300">
                                    Next
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