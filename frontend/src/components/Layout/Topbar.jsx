import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="text-lg font-bold tracking-tight text-slate-800">
                Multi-Tenant Shop
            </div>
            <div className="flex items-center gap-4 text-sm">
                {user && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {user.username} <span className="text-slate-400">|</span> {user.role}
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};
