import React from 'react';
import Topbar from './Topbar';
import { Sidebar } from './Sidebar';

export const AppLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 font-sans">
            <Topbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-6xl fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
