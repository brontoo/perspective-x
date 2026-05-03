
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react'; // ← حذفنا Mail لأننا لن نستخدمها

export default function SignIn() {
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // ← حذفنا showEmailConfirm بالكامل

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // ── Sign Up ──
        if (mode === 'signup') {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, role } }
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (signUpData?.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: signUpData.user.id,
                        email: email,
                        full_name: fullName,
                        role: role,
                    });

                if (profileError) {
                    console.error('Profile upsert error:', profileError);
                }
            }

            // ← بعد التسجيل مباشرة، حوّله حسب الدور بدون أي شاشة تأكيد
            if (role === 'teacher') {
                window.location.href = '/TeacherDashboard';
            } else {
                window.location.href = '/Dashboard';
            }

            setLoading(false);
            return;
        }

        // ── Sign In ──
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            // ← رسالة خطأ موحدة بدون ذكر تأكيد البريد
            setError('Invalid email or password.');
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        const userRole = profile?.role || data.user.user_metadata?.role || 'student';

        if (!profile) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || '',
                role: userRole,
            });
        }

        if (userRole === 'teacher') {
            window.location.href = '/TeacherDashboard';
        } else {
            window.location.href = '/Dashboard';
        }
    };

    // ── UI ──
    return (
        <div className="dark min-h-screen lx-bg-ambient flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-[var(--lx-text)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Perspective X</h1>
                    <p className="text-[var(--lx-text-muted)] text-sm mt-1">
                        {mode === 'signin' ? 'Welcome back — sign in to continue' : 'Create your account to get started'}
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card p-6">

                    {/* Toggle */}
                    <div className="glass-tabs mb-6">
                        {['signin', 'signup'].map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                className={`glass-tab flex-1 py-2 text-sm font-semibold transition-all ${mode === m ? 'active' : ''}`}
                            >
                                {m === 'signin' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name — signup only */}
                        {mode === 'signup' && (
                            <div>
                                <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className="glass-input-dark w-full"
                                />
                            </div>
                        )}

                        {/* Role — signup only */}
                        {mode === 'signup' && (
                            <div>
                                <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">I am a...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'student', label: 'Student', icon: BookOpen },
                                        { value: 'teacher', label: 'Teacher', icon: GraduationCap },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRole(value)}
                                            className={`flex items-center gap-2 p-3 text-sm font-semibold transition-all ${role === value
                                                    ? 'glass-card border border-[var(--lx-accent)] text-[var(--lx-accent)]'
                                                    : 'glass-panel border border-[var(--lx-glass-border-sub)] text-[var(--lx-text-muted)] hover:border-[var(--lx-accent)]/40'
                                                }`}
                                            style={{ borderRadius: 'var(--lx-r-btn)' }}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="glass-input-dark w-full"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="glass-input-dark w-full"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="glass-badge glass-badge-danger p-3 w-full text-sm block">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="glass-badge glass-badge-success p-3 w-full text-sm block">
                                {success}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="liquid-btn-accent w-full font-bold py-3 disabled:opacity-50"
                            style={{ borderRadius: 'var(--lx-r-btn)' }}
                        >
                            {loading
                                ? '...'
                                : mode === 'signin' ? 'Sign In' : 'Create Account'
                            }
                        </button>

                        {/* Terms */}
                        {mode === 'signup' && (
                            <p className="text-xs text-[var(--lx-text-muted)] text-center">
                                By signing up, you agree to our Terms of Service
                            </p>
                        )}
                    </form>
                </div>
            </motion.div>
        </div>
    );
}