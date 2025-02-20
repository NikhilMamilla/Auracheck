import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../shared/ThemeToggle';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the flow from location state
  const from = location.state?.from || 'login';
  const nextSteps = location.state?.flow || ['dashboard'];

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Password reset link sent to your email!');
      // Wait for 2 seconds then navigate to next step
      setTimeout(() => {
        const nextStep = nextSteps[0] || 'dashboard';
        navigate(`/${nextStep}`, { 
          state: { 
            flow: nextSteps.slice(1)
          } 
        });
      }, 2000);
    } catch (error) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  
  // Add skip functionality
  const handleSkip = () => {
    const nextStep = nextSteps[0] || 'dashboard';
    navigate(`/${nextStep}`, { 
      state: { 
        flow: nextSteps.slice(1)
      } 
    });
  };

  return (
    <div className={`min-h-screen py-12 ${theme.background}`}>
      {/* Background Design */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 -right-4 w-72 h-72 ${isDark ? 'bg-blue-500' : 'bg-blue-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float`}></div>
        <div className={`absolute -bottom-8 right-20 w-72 h-72 ${isDark ? 'bg-purple-500' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300`}></div>
      </div>

      {/* Reset Password Card */}
      <div className="relative flex items-center justify-center px-4">
        <div className={`${theme.card} w-full max-w-md p-8 rounded-2xl`}>
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold ${theme.textBold}`}>Reset Password</h2>
            <p className={`${theme.text} mt-2`}>Enter your email to reset your password</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme.text}`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 rounded-xl text-white font-medium"
            >
              {loading ? "Sending Reset Link..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className={`w-full p-3 ${theme.text} hover:opacity-75 transition-colors text-sm`}
            >
              Skip password reset
            </button>
          </form>

          <div className={`mt-6 text-center ${theme.text}`}>
            <Link
              to={from === 'login' ? '/login' : '/signup'}
              className={isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}
            >
              Back to {from === 'login' ? 'Login' : 'Sign Up'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;