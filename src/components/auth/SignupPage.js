import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../shared/ThemeToggle';

const SignupPage = () => {
    const navigate = useNavigate();
    const { signup, signInWithGoogle } = useAuth();
    const { theme, isDark } = useTheme();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignInWithGoogle = async() => {
        try {
            setError('');
            setLoading(true);
            await signInWithGoogle();
            navigate('/reset-password', {
                state: {
                    from: 'signup',
                    flow: ['greeting', 'questionnaire', 'dashboard']
                }
            });
        } catch (error) {
            setError('Failed to sign up with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords don't match");
        }

        try {
            setError('');
            setLoading(true);
            await signup(formData.email, formData.password, formData.fullName);
            navigate('/reset-password', {
                state: {
                    from: 'signup',
                    flow: ['greeting', 'questionnaire', 'dashboard']
                }
            });
        } catch (error) {
            setError('Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`h-screen overflow-hidden ${theme.background}`}>
            {/* Background Design */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute top-0 -left-4 w-48 h-48 md:w-72 md:h-72 ${
                    isDark ? 'bg-purple-500' : 'bg-purple-300'
                } rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float`} />
                <div className={`absolute -bottom-8 left-20 w-48 h-48 md:w-72 md:h-72 ${
                    isDark ? 'bg-pink-500' : 'bg-pink-300'
                } rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300`} />
            </div>

            {/* Signup Card */}
            <div className="relative h-full flex items-center justify-center p-4">
                <div className={`${theme.card} w-full max-w-md rounded-2xl p-6 md:p-8 shadow-xl`}>
                    <div className="flex justify-end mb-4">
                        <ThemeToggle />
                    </div>

                    <div className="text-center mb-6">
                        <h2 className={`text-2xl md:text-3xl font-bold ${theme.textBold}`}>
                            Create Account
                        </h2>
                        <p className={`${theme.text} mt-1 text-sm md:text-base`}>
                            Begin your wellness journey
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">
                            {error}
                        </div>
                    )}

                    {/* Google Sign Up */}
                    <button
                        onClick={handleSignInWithGoogle}
                        disabled={loading}
                        className={`w-full mb-4 flex items-center justify-center gap-2 p-2.5 rounded-lg transition-all ${
                            isDark 
                            ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className={`font-medium ${theme.text}`}>
                            {loading ? "Signing up..." : "Continue with Google"}
                        </span>
                    </button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${theme.border}`} />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className={`px-2 ${isDark ? 'bg-slate-900' : 'bg-white'} ${theme.text}`}>
                                or sign up with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Full Name Input */}
                        <div>
                            <label className={`block text-sm ${theme.text} mb-1`}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                className={`w-full px-3 py-2.5 rounded-lg text-sm ${
                                    isDark 
                                    ? 'bg-white/5 border-white/10' 
                                    : 'bg-white border-slate-200'
                                } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme.text}`}
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className={`block text-sm ${theme.text} mb-1`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`w-full px-3 py-2.5 rounded-lg text-sm ${
                                    isDark 
                                    ? 'bg-white/5 border-white/10' 
                                    : 'bg-white border-slate-200'
                                } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme.text}`}
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className={`block text-sm ${theme.text} mb-1`}>
                                Create Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className={`w-full px-3 py-2.5 rounded-lg text-sm ${
                                        isDark 
                                        ? 'bg-white/5 border-white/10' 
                                        : 'bg-white border-slate-200'
                                    } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme.text}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {/* Eye icon SVG */}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className={`block text-sm ${theme.text} mb-1`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    className={`w-full px-3 py-2.5 rounded-lg text-sm ${
                                        isDark 
                                        ? 'bg-white/5 border-white/10' 
                                        : 'bg-white border-slate-200'
                                    } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme.text}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {/* Eye icon SVG */}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gradient py-2.5 rounded-lg text-white font-medium text-sm"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className={`mt-4 text-center text-sm ${theme.text}`}>
                        <p>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className={isDark 
                                    ? 'text-indigo-400 hover:text-indigo-300' 
                                    : 'text-indigo-600 hover:text-indigo-700'
                                }
                            >
                                Sign in
                            </Link>
                        </p>
                        <Link
                            to="/"
                            className={`inline-block mt-2 ${theme.text} hover:opacity-75 text-sm`}
                        >
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;