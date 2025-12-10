import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (accessToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await client.post('/api/auth/login/', { username, password });
            const { access, refresh } = response.data;

            // We need to decode the token to get role/tenant info, OR the backend should return it.
            // Based on our implementation, backend only returns tokens.
            // We should ideally fetch user profile or decode token. 
            // WITHOUT decoding lib, we can't reliably get role.
            // Let's assume for this stage we decode base64 manually or assume backend sends it. 
            // The instruction said: "Store user info (role, tenant_id, username) under user"
            // Backend (Stage 2) returns: access, refresh. Token has claims.
            // Let's do a simple base64 decode for now to get the payload.

            const payload = JSON.parse(atob(access.split('.')[1]));

            const userData = {
                username: username, // approximate, payload might differentiate
                role: payload.role || 'CUSTOMER',
                tenant_id: payload.tenant_id
            };

            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('user', JSON.stringify(userData));

            setAccessToken(access);
            setUser(userData);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isAuthenticated: !!user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
