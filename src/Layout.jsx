import React from 'react';

export default function Layout({ children, currentPageName }) {
    // SignIn page should be the entry point
    return (
        <div className="min-h-screen bg-slate-950">
            <style>{`
        :root {
          --tw-gradient-from: #14b8a6;
          --tw-gradient-to: #10b981;
          --emerald-500: #10b981;
          --emerald-400: #34d399;
          --purple-500: #a855f7;
          --purple-400: #c084fc;
          --blue-500: #3b82f6;
          --blue-400: #60a5fa;
          --amber-500: #f59e0b;
          --amber-400: #fbbf24;
          --red-500: #ef4444;
          --red-400: #f87171;
          --orange-500: #f97316;
          --orange-400: #fb923c;
          --teal-500: #14b8a6;
          --teal-400: #2dd4bf;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #334155 transparent;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 4px;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
            {children}
        </div>
    );
}