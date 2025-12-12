import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role fallback or unauthorized page
        if (user.role === "OWNER") return <Navigate to="/owner" replace />;
        if (user.role === "STAFF") return <Navigate to="/staff" replace />;
        if (user.role === "CUSTOMER") return <Navigate to="/customer" replace />;
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
}
