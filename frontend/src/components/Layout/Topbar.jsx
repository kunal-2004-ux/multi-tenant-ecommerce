import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
    const { user, logout } = useAuth();

    return (
        <header className="w-full bg-white border-b">
            <div className="container-max flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 text-white font-semibold">M</div>
                    <div className="text-lg font-semibold tracking-tight">Multi-Tenant Shop</div>
                </Link>

                <nav className="flex items-center gap-3">
                    {!user ? (
                        <>
                            <Link to="/signup/customer" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium btn-primary">
                                Get started
                            </Link>
                            <Link to="/login" className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700">
                                Sign in
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="text-sm text-slate-600 hidden md:inline">{user.username} • {user.role}</span>
                            <button onClick={logout} className="ml-2 inline-flex px-3 py-2 rounded-lg bg-slate-900 text-white text-sm">Logout</button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
