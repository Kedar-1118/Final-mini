import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../utils/api';
import { ForgotPasswordModal } from '../../components/ForgotPasswordModal';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/users/login', formData);
      login(data.data.accessToken, data.data.user.name);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2232&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 relative z-10"
      >
        {/* Glass Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
              <Sparkles size={14} className="text-pink-400" />
              <span className="text-xs font-medium text-pink-300 uppercase tracking-wider">Early Access</span>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                <LogIn className="text-white" size={28} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400">Enter your credentials to access the beta.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1 uppercase tracking-wide">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1 uppercase tracking-wide">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center text-gray-400 hover:text-gray-300 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-white/5 text-pink-600 focus:ring-pink-500 focus:ring-offset-0 transition-all" />
                <span className="ml-2 group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-pink-500 hover:text-pink-400 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-pink-600 to-yellow-500 hover:from-pink-500 hover:to-yellow-400 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={20} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-pink-500 hover:text-pink-400 font-bold transition-colors">
                Apply for Access
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-gray-600">
          <p>© 2025 SocialPulse. All rights reserved.</p>
        </div>
      </motion.div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}
