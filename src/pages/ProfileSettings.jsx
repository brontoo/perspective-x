import AvatarPicker from '@/components/perspective/AvatarPicker';
import { Avatar } from '@/components/perspective/Portal';
import { savePreset, savePhoto } from '@/lib/perspective/avatar';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Camera, User, Lock, Trash2, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function ProfileSettings() {
    const navigate = useNavigate();

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
    const [picture, setPicture] = useState(null);
    const [avatarSuccess, setAvatarSuccess] = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    // Delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const {
                data: { user: currentUser }
            } = await supabase.auth.getUser();
            if (!currentUser) {
                navigate('/SignIn', { replace: true });
                return;
            }
            setUser(currentUser);

            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();

            setProfile(profileData);
            setFullName(profileData?.full_name || '');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ── Change Name ──
    const handleSaveName = async () => {
        if (!fullName.trim()) return;
        setSavingName(true);
        setNameError('');
        setNameSuccess('');

        const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id);

        if (error) {
            setNameError('Failed to update name. Try again.');
        } else {
            setNameSuccess('Name updated successfully!');
            setTimeout(() => setNameSuccess(''), 3000);
        }
        setSavingName(false);
    };

    // ── Change Password ──
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

        // Verify current password by logging in again
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
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

    // Existing avatar storage path remains an object path; presets use auth profile metadata.
    const handleSavePicture = async () => {
        if (!user || !picture) return;
        setUploadingAvatar(true);
        setAvatarError('');
        setAvatarSuccess('');
        try {
            if (picture.file) await savePhoto(user.id, picture.file);
            else if (picture.preset) await savePreset(user.id, picture.preset);
            await loadProfile();
            setPicture(null);
            setAvatarSuccess('Your profile picture is saved.');
        } catch (e) {
            setAvatarError(e.message || 'Unable to save your picture.');
        } finally {
            setUploadingAvatar(false);
        }
    };
    const handleRemovePicture = async () => {
        if (!user) return;
        setUploadingAvatar(true);
        setAvatarError('');
        setAvatarSuccess('');
        try {
            const { error } = await supabase.from('profiles').update({ avatar_path: null }).eq('id', user.id).select('id').single();
            if (error) throw error;
            await savePreset(user.id, null);
            await loadProfile();
            setPicture(null);
            setAvatarSuccess('Using your initials.');
        } catch (e) {
            setAvatarError(e.message || 'Unable to remove your picture.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // ── Delete Account ──
    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setDeletingAccount(true);

        // Delete data from tables
        await supabase.from('student_progress').delete().eq('student_id', user.id);
        await supabase.from('teacher_feedback').delete().eq('student_email', user.email);
        await supabase.from('profiles').delete().eq('id', user.id);

        // Sign out
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const displayName = profile?.full_name || user?.email?.split('@')[0];

    if (loading) {
        return (
            <div className="dark min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="glass-card p-6 flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-[var(--lx-accent)] animate-spin" />
                    <span className="text-xs font-mono text-[var(--lx-text-muted)] tracking-widest">LOADING PROFILE...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dark min-h-screen lx-bg-ambient">
            {/* Header */}
            <header className="glass-nav-dark sticky top-0 z-50">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-[var(--lx-text-sub)] hover:text-[var(--lx-text)] rounded-lg glass-panel transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--lx-text)]">Account Settings</h1>
                        <p className="text-xs text-[var(--lx-text-muted)]">{user?.email}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                {/* ── Avatar Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <h2 className="text-lg font-bold text-[var(--lx-text)] mb-6 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-[var(--lx-accent)]" /> Profile Picture
                    </h2>

                    <div
                        className="px-ui"
                        style={{
                            minHeight: 0,
                            background: 'transparent',
                            padding: 8,
                            borderRadius: 12
                        }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar user={user} profile={profile} name={displayName} size={72} />
                            <p className="px-muted">Choose a preset or a private photo. Optional · 2 MB maximum.</p>
                        </div>

                        <AvatarPicker value={picture} onChange={setPicture} disabled={uploadingAvatar} />
                        <div className="flex flex-wrap gap-3">
                            <button className="px-button" disabled={!picture || uploadingAvatar} onClick={handleSavePicture}>
                                {uploadingAvatar ? 'Saving…' : 'Save picture'}
                            </button>
                            <button className="px-text-button" disabled={uploadingAvatar} onClick={handleRemovePicture}>
                                Remove picture
                            </button>
                        </div>
                        {avatarError && (
                            <p className="px-error" role="alert">
                                {avatarError}
                            </p>
                        )}
                        {avatarSuccess && (
                            <p className="px-success" role="status">
                                {avatarSuccess}
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* ── Name Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <h2 className="text-lg font-bold text-[var(--lx-text)] mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-[var(--lx-accent)]" /> Full Name
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[var(--lx-text-sub)] text-sm mb-1 block">Display Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="glass-input-dark w-full"
                                placeholder="Your full name"
                            />
                        </div>

                        {nameSuccess && (
                            <div className="flex items-center gap-2 text-[var(--lx-success)] text-sm glass-card border border-[var(--lx-success)]/20 px-4 py-2">
                                <CheckCircle2 className="w-4 h-4" /> {nameSuccess}
                            </div>
                        )}
                        {nameError && (
                            <div className="flex items-center gap-2 text-[var(--lx-danger)] text-sm glass-card border border-[var(--lx-danger)]/20 px-4 py-2">
                                <AlertTriangle className="w-4 h-4" /> {nameError}
                            </div>
                        )}

                        <button
                            onClick={handleSaveName}
                            disabled={savingName || !fullName.trim()}
                            className="liquid-btn-accent flex items-center gap-2 px-6 py-2.5 text-sm font-bold disabled:opacity-50"
                        >
                            {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Save Name
                        </button>
                    </div>
                </motion.div>

                {/* ── Password Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                    <h2 className="text-lg font-bold text-[var(--lx-text)] mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[var(--lx-warning)]" /> Change Password
                    </h2>

                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="text-[var(--lx-text-sub)] text-sm mb-1 block">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="glass-input-dark w-full pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition"
                                >
                                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="text-[var(--lx-text-sub)] text-sm mb-1 block">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPw ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="glass-input-dark w-full pr-12"
                                    placeholder="Min 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition"
                                >
                                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-[var(--lx-text-sub)] text-sm mb-1 block">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="glass-input-dark w-full"
                                placeholder="••••••••"
                            />
                        </div>

                        {passwordSuccess && (
                            <div className="flex items-center gap-2 text-[var(--lx-success)] text-sm glass-card border border-[var(--lx-success)]/20 px-4 py-2">
                                <CheckCircle2 className="w-4 h-4" /> {passwordSuccess}
                            </div>
                        )}
                        {passwordError && (
                            <div className="flex items-center gap-2 text-[var(--lx-danger)] text-sm glass-card border border-[var(--lx-danger)]/20 px-4 py-2">
                                <AlertTriangle className="w-4 h-4" /> {passwordError}
                            </div>
                        )}

                        <button
                            onClick={handleChangePassword}
                            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                            className="liquid-btn-accent flex items-center gap-2 px-6 py-2.5 text-sm font-bold disabled:opacity-50"
                        >
                            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Update Password
                        </button>
                    </div>
                </motion.div>

                {/* ── Delete Account Section ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card border border-red-500/20 p-6"
                >
                    <h2 className="text-lg font-bold text-[var(--lx-text)] mb-2 flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-[var(--lx-danger)]" /> Delete Account
                    </h2>
                    <p className="text-[var(--lx-text-muted)] text-sm mb-6">
                        This will permanently delete your account and all your progress. This action cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-[var(--lx-danger)] hover:bg-red-500/10 text-sm transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete My Account
                        </button>
                    ) : (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                            <div className="flex items-start gap-3 glass-card border border-red-500/20 p-4">
                                <AlertTriangle className="w-5 h-5 text-[var(--lx-danger)] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[var(--lx-danger)] text-sm font-semibold">Are you absolutely sure?</p>
                                    <p className="text-[var(--lx-danger)]/70 text-xs mt-1">
                                        Type <span className="font-bold text-[var(--lx-danger)]">DELETE</span> to confirm.
                                    </p>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                className="glass-input-dark w-full"
                                style={{ borderColor: 'rgba(239,68,68,0.3)' }}
                                placeholder='Type "DELETE" to confirm'
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteInput !== 'DELETE' || deletingAccount}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-40 text-sm"
                                >
                                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Confirm Delete
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteInput('');
                                    }}
                                    className="liquid-btn-ghost px-6 py-2.5 text-sm"
                                >
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
