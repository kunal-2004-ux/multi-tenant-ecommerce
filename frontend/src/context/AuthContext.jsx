import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            const token = localStorage.getItem("access");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    // Check expiry
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        logout();
                    } else {
                        setUser({
                            username: decoded.username || "User",
                            role: decoded.role,
                            tenant_id: decoded.tenant_id,
                            ...decoded
                        });
                    }
                } catch (error) {
                    console.error("Invalid token:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (identifier, password) => {
        try {
            const response = await api.post("/api/auth/login/", { username: identifier, password });
            const { access, refresh } = response.data.tokens || response.data;

            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            const decoded = jwtDecode(access);
            const userObj = {
                username: decoded.username || identifier,
                role: decoded.role,
                tenant_id: decoded.tenant_id,
                ...decoded
            };
            setUser(userObj);

            return { user: userObj, tokens: { access, refresh } };
        } catch (error) {
            throw error;
        }
    };

    const registerOwner = async (data) => {
        const response = await api.post("/api/auth/register-owner/", data);
        const { access, refresh } = response.data.tokens;
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        const decoded = jwtDecode(access);
        const userObj = {
            username: decoded.username || data.owner_username,
            role: decoded.role,
            tenant_id: decoded.tenant_id,
            ...decoded
        };
        setUser(userObj);
        return { user: userObj, tokens: { access, refresh } };
    };

    const registerCustomer = async (data) => {
        const response = await api.post("/api/auth/register-customer/", data);
        const { access, refresh } = response.data.tokens;
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        const decoded = jwtDecode(access);
        const userObj = {
            username: decoded.username || data.username,
            role: decoded.role,
            tenant_id: decoded.tenant_id,
            ...decoded
        };
        setUser(userObj);
        return { user: userObj, tokens: { access, refresh } };
    }

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    };

    const value = {
        user,
        setUser,
        login,
        logout,
        registerOwner,
        registerCustomer,
        loading
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
