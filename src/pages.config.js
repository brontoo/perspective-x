/**
 * pages.config.js - Page routing configuration
 *
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 *
 * THE ONLY EDITABLE VALUE: mainPage
 */

import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import RoleHub from './pages/RoleHub';
import RoleReflection from './pages/RoleReflection';
import SignIn from './pages/SignIn';
import TeacherDashboard from './pages/TeacherDashboard';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Dashboard": Dashboard,
    "Home": Home,
    "RoleHub": RoleHub,
    "RoleReflection": RoleReflection,
    // ScenarioPlayer مُزال من هنا — يتم تسجيله مباشرة في App.jsx بدون Layout
    "SignIn": SignIn,
    "TeacherDashboard": TeacherDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};