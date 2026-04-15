
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft, Camera, User, Lock, Trash2,
    Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

export default function ProfileSettings() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Name
    const [fullName, setFullName] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [nameSuccess, setNameSuccess] = useState('');
    const [nameError, setNameError] = useState('');

    // Password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Avatar
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    // Delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            setProfile(profileData);
            setFullName(profileData?.full_name || '');

            // جلب الصورة إذا موجودة
            if (profileData?.avatar_path) {
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(profileData.avatar_path);
                setAvatarUrl(urlData.publicUrl);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ── تغيير الاسم ──
    const handleSaveName = async () => {
        if (!fullName.trim()) return;
        setSavingName(true);
        setNameError('');
        setNameSuccess('');

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName.trim() })
            .eq('id', user.id);

        if (error) {
            setNameError('Failed to update name. Try again.');
        } else {
            setNameSuccess('Name updated successfully!');
            setTimeout(() => setNameSuccess(''), 3000);
        }
        setSavingName(false);
    };

    // ── تغيير كلمة المرور ──
    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        setSavingPassword(true);

        // التحقق من كلمة المرور الحالية عن طريق إعادة تسجيل الدخول
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            setPasswordError('Current password is incorrect.');
            setSavingPassword(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setPasswordError('Failed to update password. Try again.');
        } else {
            setPasswordSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(''), 3000);
        }
        setSavingPassword(false);
    };

    // ── رفع الصورة ──
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setAvatarError('Image must be less than 2MB.');
            return;
        }

        setUploadingAvatar(true);
        setAvatarError('');

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        // رفع الصورة لـ Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            setAvatarError('Failed to upload image. Try again.');
            setUploadingAvatar(false);
            return;
        }

        // حفظ المسار في الـ profile
        await supabase
            .from('profiles')
            .update({ avatar_path: filePath })
            .eq('id', user.id);

        // عرض الصورة الجديدة
        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        setAvatarUrl(urlData.publicUrl + '?t=' + Date.now());
        setUploadingAvatar(false);
    };

    // ── حذف الحساب ──
    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setDeletingAccount(true);

        // حذف البيانات من الجداول
        await supabase.from('student_progress').delete().eq('student_id', user.id);
        await supabase.from('teacher_feedback').delete().eq('student_email', user.email);
        await supabase.from('profiles').delete().eq('id', user.id);

        // تسجيل الخروج
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const displayName = profile?.full_name || user?.email?.split('@')[0];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Account Settings</h1>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

                {/* ── Avatar Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-teal-400" /> Profile Picture
                    </h2>

                    <div className="flex items-center gap-6">
                        {/* Avatar Preview */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="avatar"
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-white">
                                        {displayName?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="text-slate-400 text-sm mb-3">
                                Upload a profile picture. Max size: 2MB.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 text-sm transition disabled:opacity-50">
                                <Camera className="w-4 h-4" />
                                {uploadingAvatar ? 'Uploading...' : 'Choose Photo'}
                            </button>
                            {avatarError && (
                                <p className="text-red-400 text-xs mt-2">{avatarError}</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Name Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" /> Full Name
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Display Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                                placeholder="Your full name"
                            />
                        </div>

                        {nameSuccess && (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                                <CheckCircle2 className="w-4 h-4" /> {nameSuccess}
                            </div>
                        )}
                        {nameError && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                <AlertTriangle className="w-4 h-4" /> {nameError}
                            </div>
                        )}

                        <button
                            onClick={handleSaveName}
                            disabled={savingName || !fullName.trim()}
                            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-50 text-sm">
                            {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Save Name
                        </button>
                    </div>
                </motion.div>

                {/* ── Password Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-amber-400" /> Change Password
                    </h2>

                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition pr-12"
                                    placeholder="••••••••"
                                />
                                <button type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPw ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition pr-12"
                                    placeholder="Min 6 characters"
                                />
                                <button type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        {passwordSuccess && (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                                <CheckCircle2 className="w-4 h-4" /> {passwordSuccess}
                            </div>
                        )}
                        {passwordError && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                <AlertTriangle className="w-4 h-4" /> {passwordError}
                            </div>
                        )}

                        <button
                            onClick={handleChangePassword}
                            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-50 text-sm">
                            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Update Password
                        </button>
                    </div>
                </motion.div>

                {/* ── Delete Account Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-400" /> Delete Account
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                        This will permanently delete your account and all your progress. This action cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition">
                            <Trash2 className="w-4 h-4" />
                            Delete My Account
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4">
                            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-300 text-sm font-semibold">Are you absolutely sure?</p>
                                    <p className="text-red-400/70 text-xs mt-1">
                                        Type <span className="font-bold text-red-300">DELETE</span> to confirm.
                                    </p>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                className="w-full bg-slate-800 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                                placeholder='Type "DELETE" to confirm'
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteInput !== 'DELETE' || deletingAccount}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-40 text-sm">
                                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Confirm Delete
                                </button>
                                <button
                                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                                    className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

            </main>
        </div>
    );
}