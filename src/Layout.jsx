import React from 'react';

export default function Layout({ children, currentPageName }) {
    return (
        <div className="min-h-screen lx-bg-ambient">
            {children}
        </div>
    );
}