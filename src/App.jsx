import React, { lazy, Suspense, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { queryClientInstance } from '@/lib/query-client';
import { pagesConfig } from './pages.config';
import { supabase } from '@/lib/supabaseClient';
import { useReducedMotion } from './hooks/useReducedMotion';

// ── Lazy: ScenarioPlayer is heavily componentized, load dynamically ──
const ScenarioPlayer = lazy(() => import('@/pages/ScenarioPlayer'));

// ── Lazy: other pages not present in pages.config.js ──────
const ProfileSettings   = lazy(() => import('@/pages/ProfileSettings'));
const LeaderboardPage   = lazy(() => import('@/pages/LeaderboardPage'));
const LearningPath      = lazy(() => import('@/pages/LearningPath'));
const Roles = lazy(() => import('@/pages/Roles'));
const PageNotFound      = lazy(() => import('./lib/PageNotFound'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// ── Shared loading fallback ──────────────────────────────────────────
function LoadingScreen({ error, onRetry }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center lx-bg-ambient">
            <div className="glass-card p-5 flex items-center gap-3">
                {error ? <div role="alert"><p>{error}</p><button type="button" onClick={onRetry} className="px-button">Try again</button> <Link to="/SignIn">Back to sign in</Link></div> : <>
                <div className="w-5 h-5 border-2 border-[var(--lx-accent-glow)] border-t-[var(--lx-accent)] rounded-full animate-spin" />
                <span className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest">LOADING...</span>
                </>}
            </div>
        </div>
    );
}

const LayoutWrapper = ({ children, currentPageName }) =>
    Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;


const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        supabase.auth.getSession().then(({ data, error: failure }) => {
            if (failure) throw failure;
            if (active) setSession(data.session);
        }).catch(failure => {
            if (active) setError(failure.message || "Your session could not be checked. Please try again.");
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [attempt]);

    if (loading) return <LoadingScreen />;
    if (error) return <LoadingScreen error={error} onRetry={() => setAttempt(value => value + 1)} />;
    if (!session) return <Navigate to="/SignIn" replace />;
    return children;
};


function AppRoutes() {
    const location = useLocation();
    const isPublicPath = location.pathname === '/' || location.pathname === '/SignIn' || location.pathname.toLowerCase() === '/login' || location.pathname.toLowerCase() === '/signin' || location.pathname.toLowerCase() === '/sign-in';

    // ScenarioPlayer: fullscreen, no Layout — lazy loaded
    if (location.pathname === '/ScenarioPlayer') {
        return (
            <Suspense fallback={<LoadingScreen />}>
                <ScenarioPlayer />
            </Suspense>
        );
    }

    if (location.pathname === '/GasLawScenario' || location.pathname === '/gas-law-scenario') {
        return <Navigate to="/ScenarioPlayer?scenario=gas_boyle_adnoc" replace />;
    }

    if (isPublicPath) {
        return (
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/" element={
                        <LayoutWrapper currentPageName={mainPageKey}>
                            <MainPage />
                        </LayoutWrapper>
                    } />
                    {/* SignIn is available in Pages, but we also map explicit public paths if needed. 
                        Since SignIn is public, we mount it explicitly here. */}
                    <Route path="/SignIn" element={<Pages.SignIn />} />
                    <Route path="/login" element={<Navigate to="/SignIn" replace />} />
                    <Route path="/signin" element={<Navigate to="/SignIn" replace />} />
                    <Route path="/sign-in" element={<Navigate to="/SignIn" replace />} />
                </Routes>
            </Suspense>
        );
    }

    return (
        <ProtectedRoute>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    {/* Map all pages configured in pages.config.js */}
                    {Object.entries(Pages).map(([path, Page]) => {
                        // Skip SignIn in protected routes as it's public
                        if (path === 'SignIn' || path === 'Home') return null;
                        return (
                            <Route
                                key={path}
                                path={`/${path}`}
                                element={
                                    <LayoutWrapper currentPageName={path}>
                                        <Page />
                                    </LayoutWrapper>
                                }
                            />
                        );
                    })}
                    {/* Explicit routes for pages not in pages.config.js */}
                    <Route path="/Roles" element={<LayoutWrapper currentPageName="Roles"><Roles /></LayoutWrapper>} />
                    <Route path="/role-hub" element={<Navigate to={`/RoleHub${location.search}`} replace />} />
                    <Route path="/ProfileSettings" element={
                        <LayoutWrapper currentPageName="ProfileSettings">
                            <ProfileSettings />
                        </LayoutWrapper>
                    } />
                    <Route path="/leaderboard" element={
                        <LayoutWrapper currentPageName="Leaderboard">
                            <LeaderboardPage />
                        </LayoutWrapper>
                    } />
                    <Route path="/LearningPath" element={
                        <LayoutWrapper currentPageName="LearningPath">
                            <LearningPath />
                        </LayoutWrapper>
                    } />
                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </Suspense>
        </ProtectedRoute>
    );
}


function App() {
    useReducedMotion(); // Sets data-reduced-motion attribute on <html>

    return (
        <QueryClientProvider client={queryClientInstance}>
            <Router>
                <AppRoutes />
            </Router>
            <Toaster />
        </QueryClientProvider>
    );
}

export default App;
