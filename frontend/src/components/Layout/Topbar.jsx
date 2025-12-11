import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
    const { user, logout } = useAuth();

    return (
        <header className="w-full bg-white border-b" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-900 text-white font-semibold text-lg">M</div>
                        <div className="text-lg md:text-xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>Multi-Tenant Shop</div>
                    </Link>

                    <nav className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <Link to="/signup/customer" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium" style={{ background: "var(--color-accent)", color: "#fff" }}>
                                    Sign up
                                </Link>
                                <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                                    Login
                                </Link>
                            </>
                        ) : (
                            <>
                                <span className="text-sm text-slate-600 mr-2 hidden md:inline">{user.username} • {user.role}</span>
                                <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium bg-slate-900 text-white">Logout</button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
