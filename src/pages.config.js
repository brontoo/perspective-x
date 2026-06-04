/**
 * pages.config.js - Page routing configuration
 *
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 *
 * THE ONLY EDITABLE VALUE: mainPage
 */

import { lazy } from 'react';
import __Layout from './Layout.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Home = lazy(() => import('./pages/Home'));
const RoleHub = lazy(() => import('./pages/RoleHub'));
const RoleReflection = lazy(() => import('./pages/RoleReflection'));
const SignIn = lazy(() => import('./pages/SignIn'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));

export const PAGES = {
    "Dashboard": Dashboard,
    "Home": Home,
    "RoleHub": RoleHub,
    "RoleReflection": RoleReflection,
    // ScenarioPlayer is removed from here — registered directly in App.jsx without Layout
    "SignIn": SignIn,
    "TeacherDashboard": TeacherDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};