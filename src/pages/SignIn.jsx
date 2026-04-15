
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
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
                    <h1 className="text-2xl font-black text-white">Perspective X</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {mode === 'signin' ? 'Welcome back — sign in to continue' : 'Create your account to get started'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">

                    {/* Toggle */}
                    <div className="flex gap-1 bg-slate-800 rounded-xl p-1 mb-6">
                        {['signin', 'signup'].map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {m === 'signin' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name — signup only */}
                        {mode === 'signup' && (
                            <div>
                                <label className="text-slate-400 text-sm mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>
                        )}

                        {/* Role — signup only */}
                        {mode === 'signup' && (
                            <div>
                                <label className="text-slate-400 text-sm mb-1 block">I am a...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'student', label: 'Student', icon: BookOpen },
                                        { value: 'teacher', label: 'Teacher', icon: GraduationCap },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRole(value)}
                                            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${role === value
                                                    ? 'bg-teal-500/20 border-teal-500/60 text-teal-400'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                }`}
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
                            <label className="text-slate-400 text-sm mb-1 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                                {success}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-teal-500/20"
                        >
                            {loading
                                ? '...'
                                : mode === 'signin' ? 'Sign In' : 'Create Account'
                            }
                        </button>

                        {/* Terms */}
                        {mode === 'signup' && (
                            <p className="text-xs text-slate-500 text-center">
                                By signing up, you agree to our Terms of Service
                            </p>
                        )}
                    </form>
                </div>
            </motion.div>
        </div>
    );
}