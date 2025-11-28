import { useState } from 'react';
import { X, Mail, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/users/forgot-password', { email });
            setStep('otp');
            setSuccess('OTP sent to your email.');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err && typeof (err as any).response === 'object' && (err as any).response?.data?.message
                ? (err as any).response.data.message
                : 'Failed to send OTP.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/users/reset-password', { email, otp, newPassword });
            setSuccess('Password reset successfully! You can now login.');
            setTimeout(() => {
                onClose();
                setStep('email');
                setEmail('');
                setOtp('');
                setNewPassword('');
                setSuccess('');
            }, 2000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err && typeof (err as any).response === 'object' && (err as any).response?.data?.message
                ? (err as any).response.data.message
                : 'Failed to reset password.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-500/10 mb-4">
                                <KeyRound className="text-pink-500" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                            <p className="text-gray-400 text-sm">
                                {step === 'email' && "Enter your email to receive a reset code."}
                                {step === 'otp' && "Enter the OTP sent to your email."}
                                {step === 'password' && "Create a new password."}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                                {success}
                            </div>
                        )}

                        {step === 'email' && (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-300 ml-1 uppercase">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-yellow-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Sending...' : <>Send OTP <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        )}

                        {(step === 'otp' || step === 'password') && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                {step === 'otp' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-300 ml-1 uppercase">Enter OTP</label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 text-center tracking-widest text-xl"
                                                placeholder="000000"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep('password')}
                                            className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                                        >
                                            Verify OTP
                                        </button>
                                    </div>
                                )}

                                {step === 'password' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-300 ml-1 uppercase">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-gradient-to-r from-pink-600 to-yellow-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
