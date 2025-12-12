import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
    const { user } = useAuth();
    const role = user?.role;

    const links = [];

    if (role === "OWNER") {
        links.push(
            { to: "/owner", label: "Dashboard" },
            { to: "/products", label: "Products" },
            { to: "/orders", label: "Orders" },
            { to: "/owner/staff", label: "Manage Staff" },
            { to: "/owner/create-staff", label: "Invite Staff" },
        );
    } else if (role === "STAFF") {
        links.push(
            { to: "/staff", label: "Dashboard" },
            { to: "/products", label: "My Products" },
            { to: "/orders", label: "Assigned Orders" },
        );
    } else if (role === "CUSTOMER") {
        links.push(
            { to: "/customer", label: "Dashboard" },
            { to: "/products", label: "Browse Products" },
            { to: "/orders", label: "My Orders" },
            { to: "/orders/new", label: "Place Order" },
        );
    } else if (!user) {
        links.push(
            { to: "/signup/customer", label: "Sign Up" },
            { to: "/login", label: "Login" },
        );
    }

    return (
        <aside className="hidden w-64 flex-col border-r bg-white p-4 pt-6 text-sm md:flex shadow-sm min-h-screen">
            <div className="mb-6 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Menu
            </div>
            <nav className="flex flex-col gap-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/owner" || link.to === "/staff" || link.to === "/customer"}
                        className={({ isActive }) =>
                            [
                                "rounded-md px-3 py-2 text-sm font-medium transition duration-150 ease-in-out",
                                isActive
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                            ].join(" ")
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};
