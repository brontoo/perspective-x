import LeaderboardPage from './pages/LeaderboardPage';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import SignIn from '@/pages/SignIn';
import TeacherDashboard from '@/pages/TeacherDashboard';
import Dashboard from '@/pages/Dashboard';
import ProfileSettings from '@/pages/ProfileSettings';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;


const LayoutWrapper = ({ children, currentPageName }) => Layout ?
    <Layout currentPageName={currentPageName}>{children}</Layout>
    : <>{children}</>;


const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
                <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/SignIn" replace />;
    }

    return children;
};


function AppRoutes() {
    const location = useLocation();
    const isPublicPath = location.pathname === '/' || location.pathname === '/SignIn';

    if (isPublicPath) {
        return (
            <Routes>
                <Route path="/" element={
                    <LayoutWrapper currentPageName={mainPageKey}>
                        <MainPage />
                    </LayoutWrapper>
                } />
                <Route path="/SignIn" element={<SignIn />} />
            </Routes>
        );
    }

    return (
        <ProtectedRoute>
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
                {/* ✅ Route جديد لصفحة Leaderboard */}
                <Route path="/leaderboard" element={
                    <LayoutWrapper currentPageName="Leaderboard">
                        <LeaderboardPage />
                    </LayoutWrapper>
                } />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
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