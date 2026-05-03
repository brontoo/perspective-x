import React, { lazy, Suspense, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { queryClientInstance } from '@/lib/query-client';
import { pagesConfig } from './pages.config';
import PageNotFound from './lib/PageNotFound';
import { supabase } from '@/lib/supabaseClient';

// ── Eager: ScenarioPlayer is special-cased by path before any routing ──
import ScenarioPlayer from '@/pages/ScenarioPlayer';

// ── Lazy: all other pages — split so ScenarioPlayer stays lean ──────
const Dashboard         = lazy(() => import('@/pages/Dashboard'));
const TeacherDashboard  = lazy(() => import('@/pages/TeacherDashboard'));
const ProfileSettings   = lazy(() => import('@/pages/ProfileSettings'));
const LeaderboardPage   = lazy(() => import('@/pages/LeaderboardPage'));
const RoleHub           = lazy(() => import('@/pages/RoleHub'));
const SignIn            = lazy(() => import('@/pages/SignIn'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// ── Shared loading fallback ──────────────────────────────────────────
function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center lx-bg-ambient">
            <div className="glass-card p-5 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[var(--lx-accent-glow)] border-t-[var(--lx-accent)] rounded-full animate-spin" />
                <span className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest">LOADING...</span>
            </div>
        </div>
    );
}

const LayoutWrapper = ({ children, currentPageName }) =>
    Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;


const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });
    }, []);

    if (loading) return <LoadingScreen />;
    if (!session) return <Navigate to="/SignIn" replace />;
    return children;
};


function AppRoutes() {
    const location = useLocation();
    const isPublicPath = location.pathname === '/' || location.pathname === '/SignIn';

    // ScenarioPlayer: fullscreen, no Layout — eager-loaded so it starts immediately
    if (location.pathname === '/ScenarioPlayer') {
        return <ScenarioPlayer />;
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
                    <Route path="/SignIn" element={<SignIn />} />
                </Routes>
            </Suspense>
        );
    }

    return (
        <ProtectedRoute>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    {Object.entries(Pages).map(([path, Page]) => (
                        <Route
                            key={path}
                            path={`/${path}`}
                            element={
                                <LayoutWrapper currentPageName={path}>
                                    <Page />
                                </LayoutWrapper>
                            }
                        />
                    ))}
                    <Route path="/Dashboard" element={
                        <LayoutWrapper currentPageName="Dashboard">
                            <Dashboard />
                        </LayoutWrapper>
                    } />
                    <Route path="/TeacherDashboard" element={
                        <LayoutWrapper currentPageName="TeacherDashboard">
                            <TeacherDashboard />
                        </LayoutWrapper>
                    } />
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
                    <Route path="/role-hub" element={
                        <LayoutWrapper currentPageName="RoleHub">
                            <RoleHub />
                        </LayoutWrapper>
                    } />
                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </Suspense>
        </ProtectedRoute>
    );
}


function App() {
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
