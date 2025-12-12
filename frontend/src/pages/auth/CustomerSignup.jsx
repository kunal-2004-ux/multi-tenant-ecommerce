import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/client";
import StoreDiscoverLink from "../../components/StoreDiscoverLink";
import { useAuth } from "../../context/AuthContext";

export default function CustomerSignup() {
    const navigate = useNavigate();
    const { setUser } = useAuth ? useAuth() : { setUser: () => { } }; // graceful if context not mounted
    const [form, setForm] = useState({
        tenant_slug: "",
        username: "",
        email: "",
        password: "",
    });
    const [tenants, setTenants] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Try to auto-prefill tenant_slug from hostname or fetch available tenants
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await api.get('/api/auth/tenants/');
                setTenants(response.data);
            } catch (err) {
                console.warn("Failed to fetch tenant list", err);
            }
        };

        const host = window.location.hostname || "";
        const parts = host.split(".");
        let prefilled = false;

        if (parts.length >= 2) {
            const candidate = parts[0].toLowerCase();
            if (!["localhost", "www", "127", ""].includes(candidate)) {
                setForm((s) => ({ ...s, tenant_slug: candidate }));
                prefilled = true;
            }
        }

        if (!prefilled) {
            fetchTenants();
        }
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        // Basic client-side validation
        if (!form.tenant_slug || form.tenant_slug.trim().length === 0) {
            setError("Please select a store to join.");
            return;
        }

        setLoading(true);
        try {
            const resp = await api.post("/api/auth/register-customer/", {
                username: form.username,
                email: form.email,
                password: form.password,
                tenant_slug: form.tenant_slug.trim().toLowerCase(),
            });
            // server returns tokens & user object
            const tokens = resp.data.tokens || {};
            const user = resp.data.user || {};
            if (tokens.access && tokens.refresh) {
                localStorage.setItem("access", tokens.access);
                localStorage.setItem("refresh", tokens.refresh);
                const userObj = { username: user.username || form.username, role: user.role || "CUSTOMER", tenant_id: user.tenant_id || null };
                localStorage.setItem("user", JSON.stringify(userObj));
                if (setUser) setUser(userObj);
            }
            navigate("/customer");
        } catch (err) {
            const message = err?.response?.data?.detail || err?.response?.data || err.message;
            setError(typeof message === "string" ? message : JSON.stringify(message));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-extrabold mb-2 text-slate-900">Join a Store</h2>
                <p className="text-sm text-slate-500 mb-6">Create a customer account for a specific store. Accounts are scoped to a store.</p>

                {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Store <span className="text-red-500">*</span></label>
                        {tenants.length > 0 ? (
                            <select
                                name="tenant_slug"
                                value={form.tenant_slug}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                                required
                            >
                                <option value="">-- Choose a Store --</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.subdomain}>
                                        {t.name} ({t.subdomain})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            // Fallback if no tenants loaded or prefilled
                            <input
                                name="tenant_slug"
                                value={form.tenant_slug}
                                onChange={handleChange}
                                placeholder="Store Slug (e.g. mystore)"
                                className="w-full rounded-md border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Choose the store you want to sign up for.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="w-full rounded-md border border-slate-200 p-3" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" type="email" className="w-full rounded-md border border-slate-200 p-3" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Password"
                                type={showPassword ? "text" : "password"}
                                className="w-full rounded-md border border-slate-200 p-3 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 z-20"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-md py-3 font-semibold disabled:opacity-60">
                            {loading ? "Signing up…" : "Sign Up"}
                        </button>
                    </div>

                    <div className="text-center text-sm text-slate-600">
                        Already have an account? <Link to="/login" className="text-blue-600 underline">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
