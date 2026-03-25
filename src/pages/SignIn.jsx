import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function SignIn() {
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, role: role } }
            });
            if (error) { setError(error.message); setLoading(false); return; }
            setSuccess('Account created! Please sign in.');
            setMode('signin');
            setLoading(false);
            return;
        }

        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError('Invalid email or password.'); setLoading(false); return; }

        // جلب الـ role من جدول profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        // تشخيص — سنحذفه لاحقاً
        console.log('====== AUTH DEBUG ======');
        console.log('User ID:', data.user.id);
        console.log('User Email:', data.user.email);
        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);
        console.log('Role value:', profile?.role);
        console.log('Is teacher?', profile?.role === 'teacher');
        console.log('========================');

        if (profile?.role === 'teacher') {
            window.location.href = '/TeacherDashboard';
        } else {
            window.location.href = '/Dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="bg-slate-900/80 border border-teal-900/30 rounded-2xl p-8 w-full max-w-md shadow-2xl backdrop-blur-sm relative z-10">

                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 text-center mb-1">
                    Perspective X
                </h2>
                <p className="text-slate-500 text-center mb-6 text-sm">
                    {mode === 'signin' ? 'Welcome back — sign in to continue' : 'Create your account to get started'}
                </p>

                {/* Toggle */}
                <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
                    <button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${mode === 'signin' ? 'bg-teal-500 text-black' : 'text-slate-400 hover:text-white'}`}>
                        Sign In
                    </button>
                    <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${mode === 'signup' ? 'bg-teal-500 text-black' : 'text-slate-400 hover:text-white'}`}>
                        Sign Up
                    </button>
                </div>

                {error && <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg p-3 mb-4 text-sm text-center">{error}</div>}
                {success && <div className="bg-teal-900/30 border border-teal-500/40 text-teal-400 rounded-lg p-3 mb-4 text-sm text-center">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Full Name</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                                placeholder="Your full name" />
                        </div>
                    )}

                    <div>
                        <label className="text-slate-400 text-sm mb-1 block">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                            placeholder="example@email.com" />
                    </div>

                    <div>
                        <label className="text-slate-400 text-sm mb-1 block">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                            placeholder="••••••••" />
                    </div>

                    {/* Role Selection — Sign Up only */}
                    {mode === 'signup' && (
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setRole('student')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${role === 'student' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                    <GraduationCap className="w-7 h-7" />
                                    <span className="font-semibold text-sm">Student</span>
                                </button>
                                <button type="button" onClick={() => setRole('teacher')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${role === 'teacher' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                    <BookOpen className="w-7 h-7" />
                                    <span className="font-semibold text-sm">Teacher</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 mt-2">
                        {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p className="text-slate-600 text-xs text-center mt-4">
                    By signing up, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    );
}
