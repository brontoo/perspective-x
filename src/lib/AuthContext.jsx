import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
                setAuthError(null);
            } else {
                setUser(null);
                setAuthError({ type: 'auth_required' });
            }
            setIsLoadingAuth(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                    setAuthError(null);
                } else {
                    setUser(null);
                    setProfile(null);
                    setAuthError({ type: 'auth_required' });
                }
                setIsLoadingAuth(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (data) setProfile(data);
    };

    const navigateToLogin = () => {
        // استخدام replace لتجنب حلقة التوجيه اللانهائية
        if (window.location.pathname !== '/SignIn') {
            window.location.replace('/SignIn');
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        window.location.replace('/SignIn');
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            navigateToLogin,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
