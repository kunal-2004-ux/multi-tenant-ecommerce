import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Topbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow p-4 flex justify-between items-center fixed w-full z-10 top-0 h-16">
            <h1 className="text-xl font-bold text-gray-800">Multi-Tenant Shop</h1>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                    {user?.username} ({user?.role})
                </span>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="w-64 bg-gray-800 text-white fixed h-full pt-20 left-0 top-0 overflow-y-auto">
            <nav className="p-4 space-y-2">
                {user?.role === 'OWNER' && (
                    <>
                        <NavLink to="/owner" label="Dashboard" />
                        <NavLink to="/products" label="Products" />
                        <NavLink to="/orders" label="Orders" />
                    </>
                )}
                {user?.role === 'STAFF' && (
                    <>
                        <NavLink to="/staff" label="Dashboard" />
                        <NavLink to="/products" label="My Products" />
                        <NavLink to="/orders" label="Assigned Orders" />
                    </>
                )}
                {user?.role === 'CUSTOMER' && (
                    <>
                        <NavLink to="/customer" label="Dashboard" />
                        <NavLink to="/products" label="Browse Products" />
                        <NavLink to="/orders" label="My Orders" />
                    </>
                )}
            </nav>
        </aside>
    );
};

const NavLink = ({ to, label }) => (
    <Link to={to} className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
        {label}
    </Link>
);

export const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Topbar />
            <Sidebar />
            <main className="ml-64 pt-16 p-6">
                {children}
            </main>
        </div>
    );
};
