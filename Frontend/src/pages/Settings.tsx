import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Lock, Shield, LogOut } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.patch('/users/update-account', { name, email });
            updateUser({ ...user!, name, email });
            toast.success('Profile updated successfully');
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error && typeof (error as any).response === 'object' && (error as any).response?.data?.message
                ? (error as any).response.data.message
                : 'Failed to update profile';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('New passwords do not match');
        }
        setLoading(true);
        try {
            // Assuming there's an endpoint for password change, if not we might need to add it or use reset flow
            // For now, let's assume update-account handles it or we need a specific endpoint.
            // Checking user.controller.js, there isn't a direct change-password endpoint, only forgot/reset.
            // We might need to add one or just leave this as a placeholder for now.
            toast.error('Password change functionality coming soon');
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error && typeof (error as any).response === 'object' && (error as any).response?.data?.message
                ? (error as any).response.data.message
                : 'Failed to update password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-left transition ${activeTab === 'profile' ? 'bg-pink-600/20 text-pink-500 border-l-4 border-pink-500' : 'text-gray-400 hover:bg-gray-800'
                                }`}
                        >
                            <User className="w-5 h-5" /> Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-left transition ${activeTab === 'security' ? 'bg-pink-600/20 text-pink-500 border-l-4 border-pink-500' : 'text-gray-400 hover:bg-gray-800'
                                }`}
                        >
                            <Lock className="w-5 h-5" /> Security
                        </button>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-6 py-4 text-left text-red-500 hover:bg-red-900/20 transition border-t border-gray-800"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                    {activeTab === 'profile' && (
                        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800">
                            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                <User className="w-6 h-6 text-pink-500" /> Personal Information
                            </h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-pink-600 to-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800">
                            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                <Shield className="w-6 h-6 text-pink-500" /> Security
                            </h2>
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-pink-600 to-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
