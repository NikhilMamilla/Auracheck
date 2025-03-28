import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, signInWithGoogle, currentUser } = useAuth();
    const { theme, isDark } = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        if (currentUser) {
            navigate('/reset-password', { state: { from: 'login' } });
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(formData.email, formData.password);
            navigate('/reset-password', { state: { from: 'login' } });
        } catch (error) {
            console.error("Login error:", error);
            setError(`Failed to log in: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            setRedirecting(true);
            await signInWithGoogle();
            // Note: For redirect flow, this code may not execute as the page will reload
            // The redirect handling is done in the AuthContext
        } catch (error) {
            console.error("Google Sign-in error:", error);
            setError(`Failed to sign in with Google: ${error.message}`);
            setRedirecting(false);
            setLoading(false);
        }
    };

    return (
        <div className={`h-screen overflow-hidden relative ${theme.background}`}>
            {/* Background Design */}
            <div className="absolute inset-0">
                <div className={`absolute top-0 -left-4 w-72 h-72 ${isDark ? 'bg-purple-500' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float`}></div>
                <div className={`absolute -bottom-8 left-20 w-72 h-72 ${isDark ? 'bg-pink-500' : 'bg-pink-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300`}></div>
            </div>

            {/* Login Card */}
            <div className="relative h-full flex items-center justify-center">
                <div className={`${theme.card} w-full max-w-md mx-4 p-8 rounded-2xl`}>
                    <div className="flex justify-end mb-4">
                        <ThemeToggle />
                    </div>

                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-bold ${theme.textBold}`}>Welcome Back!</h2>
                        <p className={`${theme.text} mt-2`}>Continue your wellness journey</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    
                    {redirecting && (
                        <div className="mb-6 p-3 bg-blue-100 text-blue-700 rounded-lg text-center">
                            Redirecting to Google for authentication...
                        </div>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className={`w-full mb-6 flex items-center justify-center gap-3 p-3 rounded-xl transition-colors ${
                            isDark 
                                ? 'hover:bg-white/5' 
                                : 'border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className={theme.text}>
                            {loading ? "Signing in..." : "Continue with Google"}
                        </span>
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${theme.border}`}></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className={`px-2 ${isDark ? 'bg-slate-900' : 'bg-white'} ${theme.text}`}>
                                or sign in with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme.text}`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme.text}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <Eye className="w-5 h-5 text-slate-500" />
                                    ) : (
                                        <EyeOff className="w-5 h-5 text-slate-500" />
                                    )}
                                </button>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <Link
                                    to="/reset-password"
                                    className={`text-sm ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gradient py-3 rounded-xl text-white font-medium"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className={`mt-6 text-center ${theme.text}`}>
                        <p>
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className={isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}
                            >
                                Sign up
                            </Link>
                        </p>
                        <Link
                            to="/"
                            className={`block mt-4 ${theme.text} hover:opacity-75`}
                        >
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
