import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSendPlaneFill, RiCloseLine, RiCustomerService2Line, RiChat1Line, RiMoonLine, RiSunLine } from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';

const GeminiChatbot = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: '👋 Hello! I am Aurabot, your personal wellness assistant. How can I help you today? 😊',
                timestamp: new Date()
            }]);
        }
    }, [isOpen, messages.length]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Respond to this message in a supportive and empathetic manner, suitable for mental health assistance, using emojis to make the conversation more lively and without repeating greetings: ${input}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            console.log('API Response:', data); // Log the API response for debugging
            const botMessage = {
                role: 'assistant',
                content: data.candidates[0].content.parts[0].text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            setError('Sorry, I encountered an error. Please try again.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-lg border ${isDark ? 'border-white/10' : 'border-black/5'}`}
                    >
                        <div className={`p-4 ${isDark ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600' : 'bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-lg">
                                        <RiCustomerService2Line className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">Aurabot</h3>
                                        <p className="text-sm text-white/80">Your Wellness Assistant</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        {isDark ? (
                                            <RiSunLine className="w-5 h-5 text-white" />
                                        ) : (
                                            <RiMoonLine className="w-5 h-5 text-white" />
                                        )}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <RiCloseLine className="w-6 h-6 text-white" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isDark ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className="max-w-[85%] group">
                                        {message.role !== 'user' && (
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                                                    <RiCustomerService2Line className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                                                </div>
                                                <span className={`text-xs ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>Aurabot</span>
                                            </div>
                                        )}
                                        <div className={`p-4 rounded-2xl ${message.role === 'user' ? isDark ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-violet-500/20' : 'bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20' : isDark ? 'bg-slate-700/50 shadow-lg shadow-black/5' : 'bg-white shadow-lg shadow-black/5 border border-slate-100'} transition-all duration-300 hover:shadow-xl ${message.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                            <p className={`${message.role === 'user' ? 'text-white' : theme.text} text-[15px] leading-relaxed`}>{message.content}</p>
                                            <div className={`text-xs mt-2 opacity-70 group-hover:opacity-100 transition-opacity ${message.role === 'user' ? 'text-white/70' : theme.textSecondary}`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className={`inline-block p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-white shadow-lg shadow-black/5 border border-slate-100'}`}>
                                        <div className="flex space-x-2">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.5, 1, 0.5]
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.5,
                                                        delay: i * 0.2
                                                    }}
                                                    className={`w-2 h-2 rounded-full ${isDark ? 'bg-violet-400' : 'bg-violet-500'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center"
                                >
                                    <div className={`p-3 rounded-lg ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>{error}</div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={`p-4 ${isDark ? 'bg-slate-700/50' : 'bg-white/80'} backdrop-blur-lg border-t ${theme.border}`}>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className={`flex-1 px-4 py-3 rounded-xl ${isDark ? 'bg-slate-600/50 text-white placeholder-white/50' : 'bg-slate-100 text-slate-900 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-[15px]`}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={`p-3 rounded-xl ${input.trim() && !isLoading ? isDark ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500' : 'bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 hover:from-violet-400 hover:via-indigo-400 hover:to-purple-400' : isDark ? 'bg-slate-600/50' : 'bg-slate-200'} text-white transition-all shadow-lg ${input.trim() && !isLoading ? 'shadow-violet-500/20' : ''}`}
                                >
                                    <RiSendPlaneFill className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg ${isDark ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 shadow-violet-500/20' : 'bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 shadow-indigo-500/20'} text-white flex items-center justify-center`}
            >
                {isOpen ? (
                    <RiCloseLine className="w-7 h-7" />
                ) : (
                    <RiChat1Line className="w-7 h-7" />
                )}
            </motion.button>
        </div>
    );
};

export default GeminiChatbot;